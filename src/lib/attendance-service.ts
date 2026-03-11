import { FirebaseDatabaseService } from './firebase-database'

export interface AttendanceRecord {
  id?: string
  user_id: string
  event_type: 'rehearsal' | 'service' | 'event'
  event_name: string
  check_in_time: string
  qr_code_used?: string
  status: 'present' | 'late' | 'absent'
  notes?: string
  zone_id?: string // Added to support zone-filtering for admins
  created_at?: string
}

export class AttendanceService {
  // Check in user for attendance
  static async checkIn(userId: string, qrCode: string, eventName: string = 'Rehearsal', zoneId?: string): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> {
    try {
      // Verify QR code is valid (not expired)
      const qrData = this.parseQRCode(qrCode)
      if (!qrData.isValid) {
        return { success: false, message: 'Invalid or expired QR code' }
      }

      // Ensure the QR code was generated for THIS user (admin uses the scanner, but userId is extracted from the QR)
      const scannedUserId = qrData.userId
      if (!scannedUserId) {
        return { success: false, message: 'Invalid QR code format' }
      }

      const today = new Date().toISOString().split('T')[0]
      // Get today's attendance records for the scanned user
      const todayStart = new Date(`${today}T00:00:00`).getTime()

      const existingRecords = await FirebaseDatabaseService.getCollectionWhere(
        'attendance',
        'user_id',
        '==',
        scannedUserId
      )

      // Filter for today AND same event
      const alreadyCheckedIn = existingRecords.some((record: any) => {
        if (record.event_name !== eventName) return false

        let recordTime = 0
        if (record.check_in_time) {
          recordTime = new Date(record.check_in_time).getTime()
        } else if (record.createdAt) {
          // Fallback to Firestore createdAt if available
          recordTime = new Date(record.createdAt).getTime()
        }

        return recordTime >= todayStart
      })

      if (alreadyCheckedIn) {
        return { success: false, message: 'This user has already checked in for this event today' }
      }

      // Create attendance record
      const checkInTime = new Date().toISOString()
      const status = this.determineStatus()
      const attendanceData = {
        user_id: scannedUserId,
        event_type: 'rehearsal',
        event_name: eventName,
        check_in_time: checkInTime,
        qr_code_used: qrCode,
        status: status,
        notes: 'Checked in via QR code',
        zone_id: zoneId || null, // Connect record to the zone that scanned it
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await FirebaseDatabaseService.addDocument('attendance', attendanceData)

      if (!result.success) {
        throw new Error('Failed to save to database')
      }

      // Format response exactly as frontend expects
      const newRecord: AttendanceRecord = {
        id: result.id,
        user_id: scannedUserId,
        event_type: 'rehearsal',
        event_name: eventName,
        check_in_time: checkInTime,
        qr_code_used: qrCode,
        status: status,
        notes: 'Checked in via QR code',
        zone_id: zoneId || undefined,
        created_at: checkInTime
      }

      const fullName = await this.getUserFullName(scannedUserId)

      return {
        success: true,
        message: `Successfully checked in ${fullName}`,
        record: newRecord
      }
    } catch (error) {
 console.error('Check-in error:', error)
      return { success: false, message: 'Failed to check in. Please try again.' }
    }
  }

  // Helper method to fetch and format user's full name
  public static async getUserFullName(userId: string): Promise<string> {
    try {
      const profile = await FirebaseDatabaseService.getDocument('profiles', userId) as any
      if (profile) {
        const first = profile.first_name || profile.firstName || ''
        const last = profile.last_name || profile.lastName || ''
        if (first || last) {
          return `${first} ${last}`.trim()
        }
      }
      return 'Member'
    } catch (error) {
 console.error('Error fetching user profile for attendance:', error)
      return 'Member'
    }
  }

  // Get user's attendance history
  static async getUserAttendance(userId: string, limitCount: number = 10): Promise<AttendanceRecord[]> {
    try {
      const records = await FirebaseDatabaseService.getCollectionWhere(
        'attendance',
        'user_id',
        '==',
        userId
      )

      // Sort by check_in_time descending
      const sorted = records.sort((a: any, b: any) => {
        const timeA = new Date(a.check_in_time || a.created_at || 0).getTime()
        const timeB = new Date(b.check_in_time || b.created_at || 0).getTime()
        return timeB - timeA
      })

      return sorted.slice(0, limitCount) as AttendanceRecord[]
    } catch (error) {
 console.error('Get attendance error:', error)
      return []
    }
  }

  // Get attendance for an entire zone (or all for HQ)
  static async getZoneAttendance(zoneId: string, isHQ: boolean = false, limitCount: number = 100): Promise<(AttendanceRecord & { user_name: string })[]> {
    try {
      let records: any[] = []

      if (isHQ) {
        // HQ can see all global attendance
        records = await FirebaseDatabaseService.getCollection('attendance', limitCount)
      } else {
        // Regular zone sees ONLY their zone's check-ins
        records = await FirebaseDatabaseService.getCollectionWhere(
          'attendance',
          'zone_id',
          '==',
          zoneId
        )
      }

      // Sort by check_in_time descending
      const sorted = records.sort((a: any, b: any) => {
        const timeA = new Date(a.check_in_time || a.created_at || 0).getTime()
        const timeB = new Date(b.check_in_time || b.created_at || 0).getTime()
        return timeB - timeA
      })

      // Fetch user names for the records
      const enrichedRecords = await Promise.all(
        sorted.slice(0, limitCount).map(async (record) => {
          const userName = await this.getUserFullName(record.user_id)
          return { ...record, user_name: userName } as AttendanceRecord & { user_name: string }
        })
      )

      return enrichedRecords
    } catch (error) {
 console.error('Get zone attendance error:', error)
      return []
    }
  }

  // Generate QR code for attendance
  static generateAttendanceQR(userId: string): string {
    const timestamp = Math.floor(Date.now() / 300000) // Changes every 5 minutes (300,000 ms)
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    // Changed: Include the FULL userId so we don't corrupt the database reference
    return `LW-ATTEND-${userId}-${timestamp}-${randomCode}`
  }

  // Parse and validate QR code
  static parseQRCode(qrCode: string): { isValid: boolean; userId?: string; timestamp?: number } {
    try {
      const parts = qrCode.split('-')
      // Format: LW-ATTEND-{userId}-{timestamp}-{randomCode}
      // Note: userId can contain hyphens! Reconstruct the userId from parts [2] up to parts.length - 2
      if (parts.length < 5 || parts[0] !== 'LW' || parts[1] !== 'ATTEND') {
        return { isValid: false }
      }

      const timestampPart = parts[parts.length - 2]
      const timestamp = parseInt(timestampPart)

      // Reconstruct user ID (everything between ATTEND and timestamp)
      const userIdParts = parts.slice(2, parts.length - 2)
      const userId = userIdParts.join('-')

      const currentTimeWindow = Math.floor(Date.now() / 300000)

      // QR code expires after 5 minutes (allow 1 window of wiggle room for cross-boundary scans)
      if (Math.abs(currentTimeWindow - timestamp) > 1) {
        return { isValid: false }
      }

      return {
        isValid: true,
        userId: userId,
        timestamp
      }
    } catch {
      return { isValid: false }
    }
  }

  // Determine if user is on time, late, or absent
  private static determineStatus(): 'present' | 'late' | 'absent' {
    const now = new Date()
    const hour = now.getHours()

    // Assuming rehearsals start at 9 PM (21) locally for testing?
    // Let's standardise simple fallback logic for now, or adapt later.
    // E.g. anything before 10 PM is Present, 10 PM is late, after is absent
    if (hour < 21) return 'present'
    if (hour === 21) return 'late'
    return 'absent'
  }

  // Get attendance statistics
  static async getAttendanceStats(userId: string): Promise<{ total: number; present: number; late: number; absent: number; rate: number }> {
    try {
      const records = await FirebaseDatabaseService.getCollectionWhere(
        'attendance',
        'user_id',
        '==',
        userId
      )

      const total = records.length || 0
      const present = records.filter((r: any) => r.status === 'present').length || 0
      const late = records.filter((r: any) => r.status === 'late').length || 0
      const absent = records.filter((r: any) => r.status === 'absent').length || 0
      const rate = total > 0 ? Math.round((present / total) * 100) : 0

      return { total, present, late, absent, rate }
    } catch (error) {
 console.error('Get stats error:', error)
      return { total: 0, present: 0, late: 0, absent: 0, rate: 0 }
    }
  }
}
