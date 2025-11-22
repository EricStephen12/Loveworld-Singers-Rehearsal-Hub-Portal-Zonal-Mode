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
    
    // Create notification for admins
    await createSubmissionNotification(docRef.id, songData.title, songData.submittedBy);
    
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
  submittedBy: SongSubmission['submittedBy']
): Promise<void> {
  try {
    const notificationData: Omit<SongNotification, 'id'> = {
      songId,
      songTitle,
      submittedBy: submittedBy.userName,
      submittedByEmail: submittedBy.email,
      type: 'new_submission',
      message: `New song "${songTitle}" submitted by ${submittedBy.userName}`,
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };
    
    const notificationsRef = collection(db, SONG_NOTIFICATIONS_COLLECTION);
    await addDoc(notificationsRef, notificationData);
    
    console.log('✅ [SongSubmission] Notification created for song:', songId);
  } catch (error) {
    console.error('❌ [SongSubmission] Error creating notification:', error);
  }
}

/**
 * Get all submitted songs (for admin)
 */
export async function getAllSubmittedSongs(): Promise<SongSubmission[]> {
  try {
    console.log('📖 [SongSubmission] Getting all submitted songs...');
    
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION);
    const q = query(submissionsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const submissions = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        adminSeen: data.adminSeen || false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      } as SongSubmission;
    });
    
    console.log('✅ [SongSubmission] Found', submissions.length, 'submitted songs');
    return submissions;
  } catch (error) {
    console.error('❌ [SongSubmission] Error getting submitted songs:', error);
    return [];
  }
}

/**
 * Get pending songs (for admin)
 */
export async function getPendingSongs(): Promise<SongSubmission[]> {
  try {
    console.log('📖 [SongSubmission] Getting pending songs...');
    
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION);
    const q = query(
      submissionsRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const submissions = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      } as SongSubmission;
    });
    
    console.log('✅ [SongSubmission] Found', submissions.length, 'pending songs');
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
 * Get unread notifications for admins
 */
export async function getUnreadNotifications(): Promise<SongNotification[]> {
  try {
    const notificationsRef = collection(db, SONG_NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('read', '==', false),
      where('type', '==', 'new_submission'),
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

