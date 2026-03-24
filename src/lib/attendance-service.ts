import { FirebaseDatabaseService } from './firebase-database'
import { HQ_GROUP_IDS, BOSS_ZONE_ID } from '@/config/zones'

export interface AttendanceRecord {
  id?: string
  user_id: string
  event_type: 'rehearsal' | 'service' | 'event'
  event_name: string
  check_in_time: string
  check_out_time?: string
  qr_code_used?: string
  status: 'present' | 'late' | 'absent'
  notes?: string
  zone_id?: string // Added to support zone-filtering for admins
  created_at?: string
  date_string: string // "YYYY-MM-DD" for easy daily queries/filtering
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

      // Ensure the QR code was generated for THIS user (admin uses the scanner)
      const scannedUserId = qrData.userId
      if (!scannedUserId) {
        return { success: false, message: 'Invalid QR code format' }
      }

      // Use LOCAL date string for daily tracking to avoid UTC midnight shifts
      const now = new Date()
      const dateString = now.toLocaleDateString('en-CA') // Format: YYYY-MM-DD
      const timestampString = now.toISOString()

      // Get today's attendance record for this user and event
      const records = (await FirebaseDatabaseService.getCollectionWhere(
        'attendance',
        'user_id',
        '==',
        scannedUserId
      )) as any[]

      // Filter for specific date and event name in JS (or use compound query if indexed)
      const existingRecord = records.find((r: any) =>
        r.date_string === dateString && r.event_name === eventName
      )

      const fullName = await this.getUserFullName(scannedUserId)

      if (existingRecord) {
        // If already clocked out, don't allow more scans (or update clock-out again)
        if (existingRecord.check_out_time) {
          // Update clock-out again (allows user to re-scan if they left then came back then left again)
          const updatedData = {
            check_out_time: timestampString,
            updatedAt: new Date()
          }
          await FirebaseDatabaseService.updateDocument('attendance', existingRecord.id, updatedData)

          return {
            success: true,
            message: `${fullName} re-clocked out at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            record: { ...existingRecord, ...updatedData } as any
          }
        }

        // Logic: already clocked in, but no clock out. Perform CLOCK OUT.
        const updateData = {
          check_out_time: timestampString,
          updatedAt: new Date()
        }

        const updateResult = await FirebaseDatabaseService.updateDocument('attendance', existingRecord.id, updateData)
        if (!updateResult.success) throw new Error('Failed to update check-out')

        return {
          success: true,
          message: `${fullName} clocked out at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          record: { ...existingRecord, ...updateData } as any
        }
      }

      // No record for today: perform CLOCK IN
      const attendanceData = {
        user_id: scannedUserId,
        event_type: 'rehearsal',
        event_name: eventName,
        check_in_time: timestampString,
        date_string: dateString,
        qr_code_used: qrCode,
        status: this.determineStatus(),
        notes: 'Checked in via QR code',
        zone_id: zoneId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await FirebaseDatabaseService.addDocument('attendance', attendanceData)

      if (!result.success) {
        throw new Error('Failed to save to database')
      }

      return {
        success: true,
        message: `${fullName} clocked in at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        record: { ...attendanceData, id: result.id } as any
      }
    } catch (error) {
      console.error('Check-in error:', error)
      return { success: false, message: 'Failed to process attendance. Please try again.' }
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
        // HQ Admin should only see records from HQ-specific zones
        const hqZones = [...HQ_GROUP_IDS, BOSS_ZONE_ID]
        records = await FirebaseDatabaseService.getCollectionWhereIn('attendance', 'zone_id', hqZones)
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
