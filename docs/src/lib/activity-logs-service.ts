// Firebase Activity Logs Service - Persistent storage for admin actions
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase-setup';

export interface ActivityLog {
  id?: string;
  adminId: string;
  adminUsername: string;
  adminFullName: string;
  action: string;
  details: string;
  section: string;
  zoneId: string;
  zoneName: string;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

class ActivityLogsService {
  private static COLLECTION_NAME = 'activityLogs';

  // Log an activity to Firebase
  static async logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<{ success: boolean; error?: string }> {
    try {
      const logData = {
        ...activity,
        timestamp: Timestamp.now(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        ipAddress: typeof window !== 'undefined' ? await this.getClientIP() : undefined
      };

      await addDoc(collection(db, this.COLLECTION_NAME), logData);
      return { success: true };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to log activity' };
    }
  }

  // Get all activity logs with optional filtering
  static async getLogs(filters?: {
    zoneId?: string;
    adminId?: string;
    action?: string;
    section?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<{ success: boolean; logs: ActivityLog[]; error?: string }> {
    try {
      let q = query(collection(db, this.COLLECTION_NAME));

      // Apply filters
      if (filters?.zoneId) {
        q = query(q, where('zoneId', '==', filters.zoneId));
      }
      if (filters?.adminId) {
        q = query(q, where('adminId', '==', filters.adminId));
      }
      if (filters?.action) {
        q = query(q, where('action', '==', filters.action));
      }
      if (filters?.section) {
        q = query(q, where('section', '==', filters.section));
      }
      if (filters?.startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters?.endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(filters.endDate)));
      }

      // Always order by timestamp (newest first) and apply limit
      q = query(q, orderBy('timestamp', 'desc'), limit(filters?.limit || 1000));

      const querySnapshot = await getDocs(q);
      const logs: ActivityLog[] = [];
      
      querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() } as ActivityLog);
      });

      return { success: true, logs };
    } catch (error) {
      console.error('Error getting logs:', error);
      return { success: false, logs: [], error: error instanceof Error ? error.message : 'Failed to get logs' };
    }
  }

  // Get logs by admin ID
  static async getLogsByAdmin(adminId: string, limitCount: number = 100): Promise<{ success: boolean; logs: ActivityLog[]; error?: string }> {
    return this.getLogs({ adminId, limit: limitCount });
  }

  // Get logs by zone
  static async getLogsByZone(zoneId: string, limitCount: number = 500): Promise<{ success: boolean; logs: ActivityLog[]; error?: string }> {
    return this.getLogs({ zoneId, limit: limitCount });
  }

  // Get recent logs across all zones
  static async getRecentLogs(limitCount: number = 50): Promise<{ success: boolean; logs: ActivityLog[]; error?: string }> {
    return this.getLogs({ limit: limitCount });
  }

  // Get logs by date range
  static async getLogsByDateRange(startDate: Date, endDate: Date, zoneId?: string): Promise<{ success: boolean; logs: ActivityLog[]; error?: string }> {
    return this.getLogs({ startDate, endDate, zoneId });
  }

  // Get activity summary statistics
  static async getSummary(zoneId?: string): Promise<{ success: boolean; summary: any; error?: string }> {
    try {
      const result = await this.getLogs({ zoneId, limit: 1000 });
      if (!result.success) {
        return { success: false, summary: null, error: result.error };
      }

      const logs = result.logs;
      const adminActivities: { [adminId: string]: number } = {};
      const sectionActivities: { [section: string]: number } = {};
      const actionCounts: { [action: string]: number } = {};
      const zoneActivities: { [zoneId: string]: number } = {};

      logs.forEach(log => {
        adminActivities[log.adminId] = (adminActivities[log.adminId] || 0) + 1;
        sectionActivities[log.section] = (sectionActivities[log.section] || 0) + 1;
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
        zoneActivities[log.zoneId] = (zoneActivities[log.zoneId] || 0) + 1;
      });

      const summary = {
        totalActivities: logs.length,
        adminActivities,
        sectionActivities,
        actionCounts,
        zoneActivities,
        recentActivity: logs[0] || null,
        dateRange: logs.length > 0 ? {
          oldest: logs[logs.length - 1]?.timestamp.toDate(),
          newest: logs[0]?.timestamp.toDate()
        } : null
      };

      return { success: true, summary };
    } catch (error) {
      console.error('Error getting summary:', error);
      return { success: false, summary: null, error: error instanceof Error ? error.message : 'Failed to get summary' };
    }
  }

  // Get client IP address (simplified version)
  private static async getClientIP(): Promise<string | undefined> {
    try {
      // In a real implementation, you might use a service like ipapi.co or similar
      // For now, we'll return undefined since we can't make external requests easily
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  // Export logs to JSON
  static async exportLogs(filters?: {
    zoneId?: string;
    adminId?: string;
    action?: string;
    section?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ success: boolean; data: string; error?: string }> {
    try {
      const result = await this.getLogs(filters);
      if (!result.success) {
        return { success: false, data: '', error: result.error };
      }

      // Convert Timestamp objects to ISO strings for JSON serialization
      const exportData = result.logs.map(log => ({
        ...log,
        timestamp: log.timestamp.toDate().toISOString(),
        timestampDate: log.timestamp.toDate().toLocaleString()
      }));

      const jsonString = JSON.stringify(exportData, null, 2);
      return { success: true, data: jsonString };
    } catch (error) {
      console.error('Error exporting logs:', error);
      return { success: false, data: '', error: error instanceof Error ? error.message : 'Failed to export logs' };
    }
  }
}

export default ActivityLogsService;
