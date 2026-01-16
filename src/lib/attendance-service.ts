import { supabase } from './supabase-client'

export interface AttendanceRecord {
  id?: string
  user_id: string
  event_type: 'rehearsal' | 'service' | 'event'
  event_name: string
  check_in_time: string
  qr_code_used?: string
  status: 'present' | 'late' | 'absent'
  notes?: string
  created_at?: string
}

export class AttendanceService {
  // Check in user for attendance
  static async checkIn(userId: string, qrCode: string, eventName: string = 'Rehearsal'): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> {
    try {
      // Verify QR code is valid (not expired)
      const qrData = this.parseQRCode(qrCode)
      if (!qrData.isValid) {
        return { success: false, message: 'Invalid or expired QR code' }
      }

            const today = new Date().toISOString().split('T')[0]
      const { data: existingRecord, error: checkError } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('event_name', eventName)
        .gte('check_in_time', `${today}T00:00:00`)
        .lte('check_in_time', `${today}T23:59:59`)
        .single()

      if (existingRecord) {
        return { success: false, message: 'You have already checked in for this event today' }
      }

      // Create attendance record
      const attendanceRecord: Omit<AttendanceRecord, 'id' | 'created_at'> = {
        user_id: userId,
        event_type: 'rehearsal',
        event_name: eventName,
        check_in_time: new Date().toISOString(),
        qr_code_used: qrCode,
        status: this.determineStatus(),
        notes: 'Checked in via QR code'
      }

      const { data, error } = await supabase
        .from('attendance')
        .insert(attendanceRecord)
        .select()
        .single()

      if (error) throw error

      return { 
        success: true, 
        message: 'Successfully checked in!', 
        record: data 
      }
    } catch (error) {
      console.error('Check-in error:', error)
      return { success: false, message: 'Failed to check in. Please try again.' }
    }
  }

  // Get user's attendance history
  static async getUserAttendance(userId: string, limit: number = 10): Promise<AttendanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .order('check_in_time', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get attendance error:', error)
      return []
    }
  }

  // Generate QR code for attendance
  static generateAttendanceQR(userId: string): string {
    const timestamp = Math.floor(Date.now() / 300000) // Changes every 5 minutes instead of 1 minute
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `LW-ATTEND-${userId.slice(0, 8).toUpperCase()}-${timestamp}-${randomCode}`
  }

  // Parse and validate QR code
  private static parseQRCode(qrCode: string): { isValid: boolean; userId?: string; timestamp?: number } {
    try {
      const parts = qrCode.split('-')
      if (parts.length !== 4 || parts[0] !== 'LW' || parts[1] !== 'ATTEND') {
        return { isValid: false }
      }

      const timestamp = parseInt(parts[2])
      const currentTime = Math.floor(Date.now() / 300000)
      
      // QR code expires after 5 minutes
      if (currentTime - timestamp > 1) {
        return { isValid: false }
      }

      return { 
        isValid: true, 
        userId: parts[2], 
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
    
    // Assuming rehearsals start at 9 AM
    if (hour < 9) return 'present'
    if (hour < 10) return 'late'
    return 'absent'
  }

  // Get attendance statistics
  static async getAttendanceStats(userId: string): Promise<{ total: number; present: number; late: number; absent: number; rate: number }> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('status')
        .eq('user_id', userId)

      if (error) throw error

      const total = data?.length || 0
      const present = data?.filter(r => r.status === 'present').length || 0
      const late = data?.filter(r => r.status === 'late').length || 0
      const absent = data?.filter(r => r.status === 'absent').length || 0
      const rate = total > 0 ? Math.round((present / total) * 100) : 0

      return { total, present, late, absent, rate }
    } catch (error) {
      console.error('Get stats error:', error)
      return { total: 0, present: 0, late: 0, absent: 0, rate: 0 }
    }
  }
}
