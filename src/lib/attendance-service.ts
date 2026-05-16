import { BackendAPI } from './api-client';

/**
 * ATTENDANCE SERVICE (WEBSITE CLIENT)
 * All QR verification and logging is now handled by the Standalone Backend.
 */

export interface AttendanceRecord {
  id: string;
  userId: string;
  user_id?: string; // Legacy support
  userName: string;
  user_name: string; // Legacy support
  eventName: string;
  event_name?: string; // Legacy support
  status: 'present' | 'late' | 'absent';
  timestamp: Date;
  check_in_time?: string; // Legacy support
  check_out_time?: string; // Legacy support
  date_string?: string; // Legacy support
  created_at?: string; // Legacy support
  zoneId?: string;
}

export class AttendanceService {
  // Check in user for attendance
  static async checkIn(userId: string, qrCode: string, eventName: string = 'Rehearsal', zoneId?: string) {
    try {
      const response = await BackendAPI.attendance.mark({
        userId,
        qrCode,
        eventName,
        zoneId
      });
      return response;
    } catch (error) {
      console.error('Check-in error:', error);
      return { success: false, message: 'Failed to process attendance.' };
    }
  }

  // Get user's attendance history
  static async getUserAttendance(userId: string, limitCount: number = 10): Promise<AttendanceRecord[]> {
    try {
      const response = await BackendAPI.attendance.getByUser(userId);
      return (response.data || []).slice(0, limitCount).map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp),
        check_in_time: r.timestamp, // Map for legacy UI
        user_name: r.userName // Map for legacy UI
      }));
    } catch (error) {
      console.error('Get attendance error:', error);
      return [];
    }
  }

  // Get zone attendance (Restored for Admin UI)
  static async getZoneAttendance(zoneId: string, _isHQ = false, limitCount = 200): Promise<AttendanceRecord[]> {
    try {
      const response = await BackendAPI.generic.list('attendance', limitCount);
      const all = response.data || [];
      return all.filter((r: any) => r.zoneId === zoneId).map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp),
        check_in_time: r.timestamp,
        user_name: r.userName,
        event_name: r.eventName,
        date_string: new Date(r.timestamp).toLocaleDateString('en-CA')
      }));
    } catch (error) {
      console.error('Get zone attendance error:', error);
      return [];
    }
  }

  // Get attendance statistics
  static async getAttendanceStats(userId: string) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/attendance/stats?userId=${userId}`);
      const result = await response.json();
      return result.data || { total: 0, present: 0, late: 0, absent: 0, rate: 0 };
    } catch (error) {
      console.error('Get stats error:', error);
      return { total: 0, present: 0, late: 0, absent: 0, rate: 0 };
    }
  }

  // Generate QR code
  static generateAttendanceQR(userId: string): string {
    const timestamp = Math.floor(Date.now() / 300000);
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `LW-ATTEND-${userId}-${timestamp}-${randomCode}`;
  }
}
