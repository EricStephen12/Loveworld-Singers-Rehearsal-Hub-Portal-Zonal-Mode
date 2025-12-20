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
  serverTimestamp
} from 'firebase/firestore'

import { db } from './firebase-setup'

const SONGS_COLLECTION = 'songs'
const SUBMITTED_SONGS_COLLECTION = 'submitted_songs'
const SONG_NOTIFICATIONS_COLLECTION = 'song_notifications'

export interface SongSubmission {
  id?: string
  title: string
  lyrics: string
  writer: string
  category: string
  key: string
  tempo: string
  leadSinger: string
  conductor: string
  leadKeyboardist: string
  leadGuitarist: string
  drummer: string
  solfas: string
  notes: string
  status: 'pending' | 'approved' | 'rejected'
  adminSeen?: boolean
  replyMessage?: string
  zoneId: string
  zoneName?: string
  submittedBy: {
    userId: string
    userName: string
    email: string
    submittedAt: string
  }
  reviewedBy?: {
    userId: string
    userName: string
    reviewedAt: string
  }
  reviewNotes?: string
  createdAt: string
  updatedAt: string
}

export interface SongNotification {
  id?: string
  songId: string
  songTitle: string
  submittedBy: string
  submittedByEmail: string
  type: 'new_submission' | 'approved' | 'rejected' | 'seen' | 'replied'
  message: string
  read: boolean
  createdAt: string
  timestamp: any
}

export async function submitSong(songData: Omit<SongSubmission, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const submissionData: Omit<SongSubmission, 'id'> = {
      ...songData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION)
    const docRef = await addDoc(submissionsRef, {
      ...submissionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    await createSubmissionNotification(docRef.id, songData.title, songData.submittedBy, songData.zoneId, songData.zoneName)
    
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error submitting song:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to submit song' }
  }
}

async function createSubmissionNotification(
  songId: string,
  songTitle: string,
  submittedBy: SongSubmission['submittedBy'],
  zoneId?: string,
  zoneName?: string
): Promise<void> {
  try {
    const notificationData = {
      songId,
      songTitle,
      submittedBy: submittedBy.userName,
      submittedByEmail: submittedBy.email,
      type: 'new_submission',
      message: `New song "${songTitle}" submitted by ${submittedBy.userName}${zoneName ? ` from ${zoneName}` : ''}`,
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
      zoneId: zoneId || 'unknown',
      zoneName: zoneName || 'Unknown Zone'
    }
    
    const notificationsRef = collection(db, SONG_NOTIFICATIONS_COLLECTION)
    await addDoc(notificationsRef, notificationData)
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

export async function getAllSubmittedSongs(zoneId?: string, isHQGroup?: boolean): Promise<SongSubmission[]> {
  try {
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION)
    
    const q = (isHQGroup || !zoneId)
      ? query(submissionsRef, orderBy('createdAt', 'desc'))
      : query(submissionsRef, where('zoneId', '==', zoneId), orderBy('createdAt', 'desc'))
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        adminSeen: data.adminSeen || false,
        zoneId: data.zoneId || 'unknown',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      } as SongSubmission
    })
  } catch (error) {
    console.error('Error getting submitted songs:', error)
    return []
  }
}

export async function getPendingSongs(zoneId?: string, isHQGroup?: boolean): Promise<SongSubmission[]> {
  try {
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION)
    
    const q = (isHQGroup || !zoneId)
      ? query(submissionsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc'))
      : query(submissionsRef, where('status', '==', 'pending'), where('zoneId', '==', zoneId), orderBy('createdAt', 'desc'))
    
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        zoneId: data.zoneId || 'unknown',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      } as SongSubmission
    })
  } catch (error) {
    console.error('Error getting pending songs:', error)
    return []
  }
}

export async function approveSong(
  submissionId: string,
  reviewerId: string,
  reviewerName: string,
  reviewNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId)
    const submissionDoc = await getDoc(submissionRef)
    
    if (!submissionDoc.exists()) throw new Error('Submission not found')
    
    const submissionData = submissionDoc.data() as SongSubmission
    
    const songsRef = collection(db, SONGS_COLLECTION)
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
    }
    
    await addDoc(songsRef, songData)
    
    await updateDoc(submissionRef, {
      status: 'approved',
      reviewedBy: { userId: reviewerId, userName: reviewerName, reviewedAt: new Date().toISOString() },
      reviewNotes: reviewNotes || '',
      updatedAt: serverTimestamp()
    })
    
    await createStatusNotification(submissionId, submissionData.title, submissionData.submittedBy, 'approved')
    
    return { success: true }
  } catch (error) {
    console.error('Error approving song:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to approve song' }
  }
}

export async function rejectSong(
  submissionId: string,
  reviewerId: string,
  reviewerName: string,
  reviewNotes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId)
    
    await updateDoc(submissionRef, {
      status: 'rejected',
      reviewedBy: { userId: reviewerId, userName: reviewerName, reviewedAt: new Date().toISOString() },
      reviewNotes: reviewNotes,
      updatedAt: serverTimestamp()
    })
    
    const submissionDoc = await getDoc(submissionRef)
    const submissionData = submissionDoc.data() as SongSubmission | undefined
    
    if (submissionData) {
      await createStatusNotification(submissionId, submissionData.title, submissionData.submittedBy, 'rejected')
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error rejecting song:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reject song' }
  }
}

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
    }
    
    const notificationsRef = collection(db, SONG_NOTIFICATIONS_COLLECTION)
    await addDoc(notificationsRef, notificationData)
  } catch (error) {
    console.error('Error creating status notification:', error)
  }
}

export async function getUnreadNotifications(zoneId?: string, isHQGroup?: boolean): Promise<SongNotification[]> {
  try {
    const notificationsRef = collection(db, SONG_NOTIFICATIONS_COLLECTION)
    const q = query(
      notificationsRef,
      where('read', '==', false),
      where('type', '==', 'new_submission'),
      orderBy('timestamp', 'desc')
    )
    const snapshot = await getDocs(q)
    
    let notifications = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        zoneId: data.zoneId || 'unknown',
        createdAt: data.createdAt || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as SongNotification & { zoneId?: string }
    })
    
    if (zoneId && !isHQGroup) {
      notifications = notifications.filter(n => (n as any).zoneId === zoneId)
    }
    
    return notifications
  } catch (error) {
    console.error('Error getting notifications:', error)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, SONG_NOTIFICATIONS_COLLECTION, notificationId)
    await updateDoc(notificationRef, { read: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

export async function markSubmissionSeen(submissionId: string, adminName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId)
    const submissionDoc = await getDoc(submissionRef)
    if (!submissionDoc.exists()) throw new Error('Submission not found')

    const submissionData = submissionDoc.data() as SongSubmission

    await updateDoc(submissionRef, { adminSeen: true, updatedAt: serverTimestamp() })
    await createStatusNotification(submissionId, submissionData.title, submissionData.submittedBy, 'seen', `${adminName} has seen your submission`)

    return { success: true }
  } catch (error) {
    console.error('Error marking seen:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to mark seen' }
  }
}

export async function replyToSubmission(submissionId: string, adminName: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId)
    const submissionDoc = await getDoc(submissionRef)
    if (!submissionDoc.exists()) throw new Error('Submission not found')

    const submissionData = submissionDoc.data() as SongSubmission

    await updateDoc(submissionRef, { replyMessage: message, updatedAt: serverTimestamp() })
    await createStatusNotification(submissionId, submissionData.title, submissionData.submittedBy, 'replied', `${adminName} replied: ${message}`)

    return { success: true }
  } catch (error) {
    console.error('Error replying to submission:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reply' }
  }
}

export async function getUserSubmissions(userId: string): Promise<SongSubmission[]> {
  try {
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION)
    const q = query(submissionsRef, where('submittedBy.userId', '==', userId), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        zoneId: data.zoneId || 'unknown',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
      } as SongSubmission
    })
  } catch (error) {
    console.error('Error getting user submissions:', error)
    return []
  }
}

export async function getUserSubmissionsByEmail(userEmail: string): Promise<SongSubmission[]> {
  try {
    if (!userEmail) return []
    const allSubmissions = await getAllSubmittedSongs(undefined, true)
    const lower = userEmail.toLowerCase()
    return allSubmissions.filter((sub) => (sub.submittedBy?.email || '').toLowerCase() === lower)
  } catch (error) {
    console.error('Error getting user submissions by email:', error)
    return []
  }
}

export async function getUserSongNotifications(userEmail: string): Promise<SongNotification[]> {
  try {
    const notificationsRef = collection(db, SONG_NOTIFICATIONS_COLLECTION)
    const q = query(
      notificationsRef,
      where('submittedByEmail', '==', userEmail),
      where('type', 'in', ['approved', 'rejected', 'replied']),
      orderBy('timestamp', 'desc')
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as SongNotification
    })
  } catch (error) {
    console.error('Error getting user notifications:', error)
    return []
  }
}

export async function deleteUserSubmission(submissionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId)
    const submissionDoc = await getDoc(submissionRef)
    
    if (!submissionDoc.exists()) return { success: false, error: 'Submission not found' }
    
    const submissionData = submissionDoc.data() as SongSubmission
    
    if (submissionData.submittedBy.userId !== userId) {
      return { success: false, error: 'You can only delete your own submissions' }
    }
    
    if (submissionData.status !== 'pending') {
      return { success: false, error: 'Can only delete pending submissions' }
    }
    
    await deleteDoc(submissionRef)
    return { success: true }
  } catch (error) {
    console.error('Error deleting submission:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete submission' }
  }
}

export async function deleteSubmissionAsAdmin(submissionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId)
    const submissionDoc = await getDoc(submissionRef)
    
    if (!submissionDoc.exists()) return { success: false, error: 'Submission not found' }
    
    await deleteDoc(submissionRef)
    return { success: true }
  } catch (error) {
    console.error('Error deleting submission:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete submission' }
  }
}
