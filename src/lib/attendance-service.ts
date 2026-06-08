import { BackendAPI } from './api-client';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');



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

function parseTimestamp(ts: any): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof ts === 'string' || typeof ts === 'number') {
    const d = new Date(ts);
    return !isNaN(d.getTime()) ? d : new Date();
  }
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  if (ts._seconds) return new Date(ts._seconds * 1000);
  return new Date();
}

export class AttendanceService {
  // Check in user for attendance
  static async checkIn(userId: string, qrCode: string, eventName: string = 'Rehearsal', zoneId?: string) {
    try {
      // Validate QR code timestamp to prevent old screenshots
      if (qrCode.startsWith('LW-ATTEND-')) {
        const parts = qrCode.split('-');
        if (parts.length >= 4) {
          const qrTimestamp = parseInt(parts[3], 10);
          const currentTimestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
          
          // If the QR code is older than 10 seconds or from the future, reject it
          if (currentTimestamp - qrTimestamp > 10 || currentTimestamp - qrTimestamp < -5) {
            return { success: false, message: 'QR Code has expired. Please ask the member to show their active screen.' };
          }
        }
      }

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
      return (response.data || []).slice(0, limitCount).map((r: any) => {
        const safeDate = parseTimestamp(r.timestamp || r.check_in_time || r.created_at);
        const isoString = safeDate.toISOString();
        return {
          ...r,
          timestamp: safeDate,
          check_in_time: r.check_in_time ? parseTimestamp(r.check_in_time).toISOString() : isoString,
          check_out_time: r.check_out_time ? parseTimestamp(r.check_out_time).toISOString() : undefined,
          user_name: r.userName || r.user_name || 'Member',
          event_name: r.eventName || r.event_name || 'Rehearsal',
          date_string: safeDate.toLocaleDateString('en-CA')
        };
      });
    } catch (error) {
      console.error('Get attendance error:', error);
      return [];
    }
  }

  // Get zone attendance (Restored for Admin UI)
  static async getZoneAttendance(zoneId: string, _isHQ = false, limitCount = 200): Promise<AttendanceRecord[]> {
    try {
      let all: any[] = [];
      let fromBackendEndpoint = false;
      try {
        const response = await BackendAPI.attendance.getAll(_isHQ ? undefined : zoneId);
        all = response.data || [];
        fromBackendEndpoint = true;
      } catch (err) {
        const response = await BackendAPI.generic.list('attendance', limitCount);
        all = response.data || [];
      }

      // If fetched from the dedicated backend endpoint, it is already perfectly filtered by zoneId, zoneName, slug, or membership.
      // If fallback generic list was used, perform robust client-side filtering.
      let filtered = all;
      if (!fromBackendEndpoint && !_isHQ && zoneId) {
        const { ZONES } = await import('@/config/zones');
        const targetZone = ZONES.find(z => z.id === zoneId);
        const zoneName = targetZone?.name || '';
        const zoneSlug = targetZone?.slug || '';
        filtered = all.filter((r: any) => {
          if (r.zoneId === zoneId) return true;
          if (zoneName && r.zoneId === zoneName) return true;
          if (zoneSlug && r.zoneId === zoneSlug) return true;
          return false;
        });
      }

      return filtered.map((r: any) => {
        const safeDate = parseTimestamp(r.timestamp || r.check_in_time || r.created_at);
        const isoString = safeDate.toISOString();
        return {
          ...r,
          timestamp: safeDate,
          check_in_time: r.check_in_time ? parseTimestamp(r.check_in_time).toISOString() : isoString,
          check_out_time: r.check_out_time ? parseTimestamp(r.check_out_time).toISOString() : undefined,
          user_name: r.userName || r.user_name || 'Member',
          event_name: r.eventName || r.event_name || 'Rehearsal',
          date_string: safeDate.toLocaleDateString('en-CA')
        };
      });
    } catch (error) {
      console.error('Get zone attendance error:', error);
      return [];
    }
  }

  // Get attendance statistics
  static async getAttendanceStats(userId: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/attendance/stats?userId=${userId}`);
      const result = await response.json();
      return result.data || { total: 0, present: 0, late: 0, absent: 0, rate: 0 };
    } catch (error) {
      console.error('Get stats error:', error);
      return { total: 0, present: 0, late: 0, absent: 0, rate: 0 };
    }
  }

  // Generate QR code
  static generateAttendanceQR(userId: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `LW-ATTEND-${userId}-${timestamp}-${randomCode}`;
  }
}
