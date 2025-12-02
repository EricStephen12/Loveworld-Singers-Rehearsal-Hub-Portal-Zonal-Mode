/**
 * SONG SUBMISSION SERVICE
 * 
 * Handles song submissions and notifications to admins
 */

import { db } from './firebase-setup';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

const SONGS_COLLECTION = 'songs';
const SUBMITTED_SONGS_COLLECTION = 'submitted_songs'; // Separate collection for submissions
const SONG_NOTIFICATIONS_COLLECTION = 'song_notifications';

export interface SongSubmission {
  id?: string;
  title: string;
  lyrics: string;
  writer: string;
  category: string;
  key: string;
  tempo: string;
  leadSinger: string;
  conductor: string;
  leadKeyboardist: string;
  leadGuitarist: string;
  drummer: string;
  solfas: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  adminSeen?: boolean;
  replyMessage?: string;
  // CRITICAL: Zone tracking for proper filtering
  zoneId: string;
  zoneName?: string;
  submittedBy: {
    userId: string;
    userName: string;
    email: string;
    submittedAt: string;
  };
  reviewedBy?: {
    userId: string;
    userName: string;
    reviewedAt: string;
  };
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SongNotification {
  id?: string;
  songId: string;
  songTitle: string;
  submittedBy: string;
  submittedByEmail: string;
  type: 'new_submission' | 'approved' | 'rejected' | 'seen' | 'replied';
  message: string;
  read: boolean;
  createdAt: string;
  timestamp: any;
}

/**
 * Submit a song for review
 */
export async function submitSong(songData: Omit<SongSubmission, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log('📤 [SongSubmission] Submitting song:', songData.title);
    
    const submissionData: Omit<SongSubmission, 'id'> = {
      ...songData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to submitted_songs collection
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION);
    const docRef = await addDoc(submissionsRef, {
      ...submissionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Create notification for admins (include zone info)
    await createSubmissionNotification(docRef.id, songData.title, songData.submittedBy, songData.zoneId, songData.zoneName);
    
    console.log('✅ [SongSubmission] Song submitted with ID:', docRef.id);
    
    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('❌ [SongSubmission] Error submitting song:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit song'
    };
  }
}

/**
 * Create notification when a song is submitted
 */
async function createSubmissionNotification(
  songId: string,
  songTitle: string,
  submittedBy: SongSubmission['submittedBy'],
  zoneId?: string,
  zoneName?: string
): Promise<void> {
  try {
    const notificationData: Omit<SongNotification, 'id'> & { zoneId?: string; zoneName?: string } = {
      songId,
      songTitle,
      submittedBy: submittedBy.userName,
      submittedByEmail: submittedBy.email,
      type: 'new_submission',
      message: `New song "${songTitle}" submitted by ${submittedBy.userName}${zoneName ? ` from ${zoneName}` : ''}`,
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
      // Include zone info for filtering
      zoneId: zoneId || 'unknown',
      zoneName: zoneName || 'Unknown Zone'
    };
    
    const notificationsRef = collection(db, SONG_NOTIFICATIONS_COLLECTION);
    await addDoc(notificationsRef, notificationData);
    
    console.log('✅ [SongSubmission] Notification created for song:', songId, 'zone:', zoneId);
  } catch (error) {
    console.error('❌ [SongSubmission] Error creating notification:', error);
  }
}

/**
 * Get all submitted songs (for admin) - filtered by zone
 * @param zoneId - The zone ID to filter by. If not provided, returns all (for super admin)
 * @param isHQGroup - If true, returns all submissions (HQ can see everything)
 */
export async function getAllSubmittedSongs(zoneId?: string, isHQGroup?: boolean): Promise<SongSubmission[]> {
  try {
    console.log('📖 [SongSubmission] Getting submitted songs for zone:', zoneId || 'ALL');
    
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION);
    let q;
    
    // HQ groups and super admins can see all submissions
    if (isHQGroup || !zoneId) {
      q = query(submissionsRef, orderBy('createdAt', 'desc'));
    } else {
      // Regular zones only see their own submissions
      q = query(
        submissionsRef, 
        where('zoneId', '==', zoneId),
        orderBy('createdAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    
    const submissions = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        adminSeen: data.adminSeen || false,
        zoneId: data.zoneId || 'unknown',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      } as SongSubmission;
    });
    
    console.log('✅ [SongSubmission] Found', submissions.length, 'submitted songs for zone:', zoneId || 'ALL');
    return submissions;
  } catch (error) {
    console.error('❌ [SongSubmission] Error getting submitted songs:', error);
    return [];
  }
}

/**
 * Get pending songs (for admin) - filtered by zone
 * @param zoneId - The zone ID to filter by. If not provided, returns all (for super admin)
 * @param isHQGroup - If true, returns all pending submissions (HQ can see everything)
 */
export async function getPendingSongs(zoneId?: string, isHQGroup?: boolean): Promise<SongSubmission[]> {
  try {
    console.log('📖 [SongSubmission] Getting pending songs for zone:', zoneId || 'ALL');
    
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION);
    let snapshot;
    
    // HQ groups and super admins can see all pending submissions
    if (isHQGroup || !zoneId) {
      const q = query(
        submissionsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      snapshot = await getDocs(q);
    } else {
      // Regular zones only see their own pending submissions
      // Note: Firestore requires composite index for multiple where + orderBy
      const q = query(
        submissionsRef,
        where('status', '==', 'pending'),
        where('zoneId', '==', zoneId),
        orderBy('createdAt', 'desc')
      );
      snapshot = await getDocs(q);
    }
    
    const submissions = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        zoneId: data.zoneId || 'unknown',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      } as SongSubmission;
    });
    
    console.log('✅ [SongSubmission] Found', submissions.length, 'pending songs for zone:', zoneId || 'ALL');
    return submissions;
  } catch (error) {
    console.error('❌ [SongSubmission] Error getting pending songs:', error);
    return [];
  }
}

/**
 * Approve a submitted song (moves it to main songs collection)
 */
export async function approveSong(
  submissionId: string,
  reviewerId: string,
  reviewerName: string,
  reviewNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('✅ [SongSubmission] Approving song:', submissionId);
    
    // Get the submission
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId);
    const { getDoc } = await import('firebase/firestore');
    const submissionDoc = await getDoc(submissionRef);
    
    if (!submissionDoc.exists()) {
      throw new Error('Submission not found');
    }
    
    const submissionData = submissionDoc.data() as SongSubmission;
    
    // Add to main songs collection
    const songsRef = collection(db, SONGS_COLLECTION);
    const songData = {
      title: submissionData.title,
      lyrics: submissionData.lyrics,
      writer: submissionData.writer,
      category: submissionData.category || 'Other',
      key: submissionData.key || '',
      tempo: submissionData.tempo || '',
      leadSinger: submissionData.leadSinger || '',
      conductor: submissionData.conductor || '',
      leadKeyboardist: submissionData.leadKeyboardist || '',
      leadGuitarist: submissionData.leadGuitarist || '',
      drummer: submissionData.drummer || '',
      solfas: submissionData.solfas || '',
      status: 'unheard',
      rehearsalCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await addDoc(songsRef, songData);
    
    // Update submission status
    await updateDoc(submissionRef, {
      status: 'approved',
      reviewedBy: {
        userId: reviewerId,
        userName: reviewerName,
        reviewedAt: new Date().toISOString()
      },
      reviewNotes: reviewNotes || '',
      updatedAt: serverTimestamp()
    });
    
    // Create notification
    await createStatusNotification(
      submissionId,
      submissionData.title,
      submissionData.submittedBy,
      'approved'
    );
    
    console.log('✅ [SongSubmission] Song approved and moved to main collection');
    
    return { success: true };
  } catch (error) {
    console.error('❌ [SongSubmission] Error approving song:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve song'
    };
  }
}

/**
 * Reject a submitted song
 */
export async function rejectSong(
  submissionId: string,
  reviewerId: string,
  reviewerName: string,
  reviewNotes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('❌ [SongSubmission] Rejecting song:', submissionId);
    
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId);
    
    await updateDoc(submissionRef, {
      status: 'rejected',
      reviewedBy: {
        userId: reviewerId,
        userName: reviewerName,
        reviewedAt: new Date().toISOString()
      },
      reviewNotes: reviewNotes,
      updatedAt: serverTimestamp()
    });
    
    // Get submission data for notification
    const submissionDocRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId);
    const submissionDoc = await getDoc(submissionDocRef);
    const submissionData = submissionDoc.data() as SongSubmission | undefined;
    
    if (submissionData) {
      // Create notification
      await createStatusNotification(
        submissionId,
        submissionData.title,
        submissionData.submittedBy,
        'rejected'
      );
    }
    
    console.log('✅ [SongSubmission] Song rejected');
    
    return { success: true };
  } catch (error) {
    console.error('❌ [SongSubmission] Error rejecting song:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject song'
    };
  }
}

/**
 * Create status notification (approved/rejected)
 */
async function createStatusNotification(
  songId: string,
  songTitle: string,
  submittedBy: SongSubmission['submittedBy'],
  status: 'approved' | 'rejected' | 'seen' | 'replied',
  customMessage?: string
): Promise<void> {
  try {
    const notificationData: Omit<SongNotification, 'id'> = {
      songId,
      songTitle,
      submittedBy: submittedBy.userName,
      submittedByEmail: submittedBy.email,
      type: status,
      message: customMessage || `Your song "${songTitle}" has been ${status}`,
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };
    
    const notificationsRef = collection(db, SONG_NOTIFICATIONS_COLLECTION);
    await addDoc(notificationsRef, notificationData);
    
    console.log('✅ [SongSubmission] Status notification created');
  } catch (error) {
    console.error('❌ [SongSubmission] Error creating status notification:', error);
  }
}

/**
 * Get unread notifications for admins - filtered by zone
 * @param zoneId - The zone ID to filter by
 * @param isHQGroup - If true, returns all notifications (HQ can see everything)
 */
export async function getUnreadNotifications(zoneId?: string, isHQGroup?: boolean): Promise<SongNotification[]> {
  try {
    const notificationsRef = collection(db, SONG_NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('read', '==', false),
      where('type', '==', 'new_submission'),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    
    let notifications = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        zoneId: data.zoneId || 'unknown',
        createdAt: data.createdAt || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as SongNotification & { zoneId?: string };
    });
    
    // Filter by zone if not HQ/super admin
    if (zoneId && !isHQGroup) {
      notifications = notifications.filter(n => (n as any).zoneId === zoneId);
    }
    
    return notifications;
  } catch (error) {
    console.error('❌ [SongSubmission] Error getting notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, SONG_NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('❌ [SongSubmission] Error marking notification as read:', error);
  }
}

/**
 * Mark submission as seen by admin and notify user
 */
export async function markSubmissionSeen(submissionId: string, adminName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId);
    const submissionDoc = await getDoc(submissionRef);
    if (!submissionDoc.exists()) {
      throw new Error('Submission not found');
    }

    const submissionData = submissionDoc.data() as SongSubmission;

    await updateDoc(submissionRef, {
      adminSeen: true,
      updatedAt: serverTimestamp()
    });

    await createStatusNotification(
      submissionId,
      submissionData.title,
      submissionData.submittedBy,
      'seen',
      `${adminName} has seen your submission`
    );

    return { success: true };
  } catch (error) {
    console.error('❌ [SongSubmission] Error marking seen:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to mark seen' };
  }
}

/**
 * Reply to a submission and notify user
 */
export async function replyToSubmission(submissionId: string, adminName: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId);
    const submissionDoc = await getDoc(submissionRef);
    if (!submissionDoc.exists()) {
      throw new Error('Submission not found');
    }

    const submissionData = submissionDoc.data() as SongSubmission;

    await updateDoc(submissionRef, {
      replyMessage: message,
      updatedAt: serverTimestamp()
    });

    await createStatusNotification(
      submissionId,
      submissionData.title,
      submissionData.submittedBy,
      'replied',
      `${adminName} replied: ${message}`
    );

    return { success: true };
  } catch (error) {
    console.error('❌ [SongSubmission] Error replying to submission:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reply' };
  }
}



/**
 * Get submissions by a specific user (for users to see their own submissions)
 */
export async function getUserSubmissions(userId: string): Promise<SongSubmission[]> {
  try {
    console.log('📖 [SongSubmission] Getting submissions for user:', userId);
    
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION);
    const q = query(
      submissionsRef,
      where('submittedBy.userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const submissions = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        zoneId: data.zoneId || 'unknown',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      } as SongSubmission;
    });
    
    console.log('✅ [SongSubmission] Found', submissions.length, 'submissions for user');
    return submissions;
  } catch (error) {
    console.error('❌ [SongSubmission] Error getting user submissions:', error);
    return [];
  }
}

/**
 * Get submissions for a user by email.
 * This fetches all submitted songs (admin-style) and then filters them by submittedBy.email.
 */
export async function getUserSubmissionsByEmail(userEmail: string): Promise<SongSubmission[]> {
  try {
    console.log('📖 [SongSubmission] Getting submissions for user by email:', userEmail);
    if (!userEmail) return [];

    // Fetch all submissions with HQ-style access, then filter in memory by email
    const allSubmissions = await getAllSubmittedSongs(undefined, true);
    const lower = userEmail.toLowerCase();

    const filtered = allSubmissions.filter((sub) => {
      const email = sub.submittedBy?.email || '';
      return email.toLowerCase() === lower;
    });

    console.log('✅ [SongSubmission] Found', filtered.length, 'submissions for email');
    return filtered;
  } catch (error) {
    console.error('❌ [SongSubmission] Error getting user submissions by email:', error);
    return [];
  }
}

/**
 * Get user's song notifications (approved, rejected, replied)
 */
export async function getUserSongNotifications(userEmail: string): Promise<SongNotification[]> {
  try {
    console.log('📖 [SongSubmission] Getting notifications for user:', userEmail);
    
    const notificationsRef = collection(db, SONG_NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('submittedByEmail', '==', userEmail),
      where('type', 'in', ['approved', 'rejected', 'replied']),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const notifications = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as SongNotification;
    });
    
    console.log('✅ [SongSubmission] Found', notifications.length, 'notifications for user');
    return notifications;
  } catch (error) {
    console.error('❌ [SongSubmission] Error getting user notifications:', error);
    return [];
  }
}


/**
 * Delete a user's own submission (only if pending)
 */
export async function deleteUserSubmission(submissionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ [SongSubmission] Deleting submission:', submissionId);
    
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId);
    const submissionDoc = await getDoc(submissionRef);
    
    if (!submissionDoc.exists()) {
      return { success: false, error: 'Submission not found' };
    }
    
    const submissionData = submissionDoc.data() as SongSubmission;
    
    // Verify ownership
    if (submissionData.submittedBy.userId !== userId) {
      return { success: false, error: 'You can only delete your own submissions' };
    }
    
    // Only allow deleting pending submissions
    if (submissionData.status !== 'pending') {
      return { success: false, error: 'Can only delete pending submissions' };
    }
    
    await deleteDoc(submissionRef);
    
    console.log('✅ [SongSubmission] Submission deleted');
    return { success: true };
  } catch (error) {
    console.error('❌ [SongSubmission] Error deleting submission:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete submission' };
  }
}

/**
 * Delete a submission from admin (can remove any status)
 */
export async function deleteSubmissionAsAdmin(submissionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ [SongSubmission][Admin] Deleting submission as admin:', submissionId);
    
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId);
    const submissionDoc = await getDoc(submissionRef);
    
    if (!submissionDoc.exists()) {
      return { success: false, error: 'Submission not found' };
    }
    
    await deleteDoc(submissionRef);
    console.log('✅ [SongSubmission][Admin] Submission deleted');
    return { success: true };
  } catch (error) {
    console.error('❌ [SongSubmission][Admin] Error deleting submission:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete submission' };
  }
}
