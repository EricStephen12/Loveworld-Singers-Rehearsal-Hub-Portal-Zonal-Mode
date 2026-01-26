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
  limit
} from 'firebase/firestore'

import { db } from './firebase-setup'
import { isHQGroup } from '@/config/zones'

const SONGS_COLLECTION = 'songs'
const SUBMITTED_SONGS_COLLECTION = 'submitted_songs'
const SONG_NOTIFICATIONS_COLLECTION = 'song_notifications'

export interface ConversationMessage {
  id: string
  sender: 'admin' | 'user'
  senderName: string
  message: string
  timestamp: string
}

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
  audioUrl?: string
  status: 'pending' | 'approved' | 'rejected'
  adminSeen?: boolean
  replyMessage?: string // Legacy - kept for backward compatibility
  userReply?: string // Legacy - kept for backward compatibility
  conversation?: ConversationMessage[] // New chat-like conversation
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

    // Trigger FCM push notification for admins (HQ members)
    try {
      // Import FirebaseDatabaseService dynamically if needed or use db directly
      // Since this is a lib file, we should be careful about browser-only calls if it runs on server
      // But this seems to be a client-side service based on the usage of 'fetch' in other parts

      const hqMembersRef = collection(db, 'hq_members')
      const hqSnapshot = await getDocs(query(hqMembersRef, limit(100)))
      const adminIds = hqSnapshot.docs.map(doc => doc.data().userId).filter(Boolean)

      if (adminIds.length > 0) {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'song',
            recipientIds: adminIds,
            title: '🎵 New Song Submission',
            body: `New song "${songTitle}" submitted by ${submittedBy.userName}${zoneName ? ` from ${zoneName}` : ''}`,
            data: { songId, songTitle, type: 'new_submission' }
          })
        })
      }
    } catch (fcmError) {
      console.error('Error sending admin song notification:', fcmError)
    }
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

export async function getAllSubmittedSongs(zoneId?: string, isHQGroup?: boolean): Promise<SongSubmission[]> {
  try {
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION)

    let q
    if (isHQGroup && zoneId) {
      // HQ users: show ALL submissions from ANY HQ zone (C, D, E all see each other's submissions)
      // Get all submissions and filter client-side for HQ zones
      const { HQ_GROUP_IDS, BOSS_ZONE_ID } = await import('@/config/zones')
      const hqZoneIds = [...HQ_GROUP_IDS, BOSS_ZONE_ID]

      // Get all submissions
      const allSnapshot = await getDocs(query(submissionsRef, orderBy('createdAt', 'desc')))
      const allSubmissions = allSnapshot.docs.map((docSnap) => {
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

      // Filter to only HQ zone submissions (all HQ zones see each other's submissions)
      return allSubmissions.filter(sub => hqZoneIds.includes(sub.zoneId))
    } else if (zoneId) {
      // Regular zone: show ONLY submissions for this specific zone (Zone A only sees Zone A, Zone B only sees Zone B)
      q = query(submissionsRef, where('zoneId', '==', zoneId), orderBy('createdAt', 'desc'))
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
    } else {
      // No zone specified: return empty (shouldn't happen)
      return []
    }
  } catch (error) {
    console.error('Error getting submitted songs:', error)
    return []
  }
}

export async function getPendingSongs(zoneId?: string, isHQGroup?: boolean): Promise<SongSubmission[]> {
  try {
    const submissionsRef = collection(db, SUBMITTED_SONGS_COLLECTION)

    let q
    if (isHQGroup && zoneId) {
      // HQ users: show ALL pending submissions from ANY HQ zone
      const { HQ_GROUP_IDS, BOSS_ZONE_ID } = await import('@/config/zones')
      const hqZoneIds = [...HQ_GROUP_IDS, BOSS_ZONE_ID]

      // Get all pending submissions
      const allSnapshot = await getDocs(query(submissionsRef, where('status', '==', 'pending'), orderBy('createdAt', 'desc')))
      const allSubmissions = allSnapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          zoneId: data.zoneId || 'unknown',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        } as SongSubmission
      })

      // Filter to only HQ zone submissions
      return allSubmissions.filter(sub => hqZoneIds.includes(sub.zoneId))
    } else if (zoneId) {
      // Regular zone: show ONLY pending submissions for this specific zone
      q = query(submissionsRef, where('status', '==', 'pending'), where('zoneId', '==', zoneId), orderBy('createdAt', 'desc'))
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
    } else {
      return []
    }
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

    const isHQ = submissionData.zoneId && isHQGroup(submissionData.zoneId)
    const targetCollection = isHQ ? 'praise_night_songs' : 'zone_songs'
    const songsRef = collection(db, targetCollection)

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
      audioUrl: submissionData.audioUrl || '',
      status: 'unheard',
      rehearsalCount: 0,
      zoneId: submissionData.zoneId || '',
      praiseNightId: '', // Approved songs usually start unassigned to a specific program
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    await addDoc(songsRef, songData)

    await updateDoc(submissionRef, {
      status: 'approved',
      reviewedBy: { userId: reviewerId, userName: reviewerName, reviewedAt: new Date().toISOString() },
      reviewNotes: reviewNotes || '',
      updatedAt: serverTimestamp(),
      isUpdated: false,
      hasNewUserReply: false
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
      updatedAt: serverTimestamp(),
      isUpdated: false,
      hasNewUserReply: false
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

    // Send push notification for approval/rejection/reply (not for 'seen')
    if (status !== 'seen' && submittedBy.userId) {
      const title = status === 'approved'
        ? '🎵 Song Approved!'
        : status === 'rejected'
          ? '🎵 Song Feedback'
          : '🎵 Song Reply'

      const body = customMessage || `Your song "${songTitle}" has been ${status}`

      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'song',
            recipientIds: [submittedBy.userId],
            title,
            body,
            data: { songId, songTitle, status }
          })
        })
      } catch (pushError) {
      }
    }
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

    // Create new conversation message
    const newMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      senderName: adminName,
      message: message,
      timestamp: new Date().toISOString()
    }

    // Get existing conversation or create new array
    const existingConversation = submissionData.conversation || []
    const updatedConversation = [...existingConversation, newMessage]

    await updateDoc(submissionRef, {
      replyMessage: message, // Keep legacy field for backward compatibility
      conversation: updatedConversation,
      updatedAt: serverTimestamp(),
      isUpdated: false,
      hasNewUserReply: false,
      lastUpdatedBy: 'admin'
    })
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

    // Try with compound query first
    try {
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
    } catch (indexError) {
      // Fallback: simpler query without orderBy, filter and sort client-side
      const fallbackQ = query(
        notificationsRef,
        where('submittedByEmail', '==', userEmail)
      )
      const snapshot = await getDocs(fallbackQ)

      const notifications = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          } as SongNotification
        })
        .filter(n => ['approved', 'rejected', 'replied'].includes(n.type))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      return notifications
    }
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

export async function updateUserSubmission(
  submissionId: string,
  userId: string,
  updates: Partial<Pick<SongSubmission, 'title' | 'lyrics' | 'writer' | 'key' | 'leadSinger' | 'notes' | 'audioUrl'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId)
    const submissionDoc = await getDoc(submissionRef)

    if (!submissionDoc.exists()) {
      return { success: false, error: 'Submission not found' }
    }

    const submissionData = submissionDoc.data() as SongSubmission

    // Check ownership
    if (submissionData.submittedBy.userId !== userId) {
      return { success: false, error: 'You can only edit your own submissions' }
    }

    // Allow editing pending and approved submissions (not rejected)
    if (submissionData.status === 'rejected') {
      return { success: false, error: 'Cannot edit rejected submissions' }
    }

    await updateDoc(submissionRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      isUpdated: true,  // Flag to show admin that user has updated
      lastUpdatedBy: 'user'
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating submission:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update submission' }
  }
}

// User reply to admin message
export async function userReplyToSubmission(
  submissionId: string,
  userId: string,
  message: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId)
    const submissionDoc = await getDoc(submissionRef)

    if (!submissionDoc.exists()) {
      return { success: false, error: 'Submission not found' }
    }

    const submissionData = submissionDoc.data() as SongSubmission

    // Check ownership
    if (submissionData.submittedBy.userId !== userId) {
      return { success: false, error: 'You can only reply to your own submissions' }
    }

    // Create new conversation message
    const newMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: userName || submissionData.submittedBy.userName || 'User',
      message: message,
      timestamp: new Date().toISOString()
    }

    // Get existing conversation or create new array
    const existingConversation = submissionData.conversation || []
    const updatedConversation = [...existingConversation, newMessage]

    // Also update legacy userReply field for backward compatibility
    const existingUserReply = submissionData.userReply || ''
    const newLegacyReply = existingUserReply
      ? `${existingUserReply}\n---\n${new Date().toLocaleString()}: ${message}`
      : `${new Date().toLocaleString()}: ${message}`

    await updateDoc(submissionRef, {
      userReply: newLegacyReply,
      conversation: updatedConversation,
      updatedAt: serverTimestamp(),
      hasNewUserReply: true,
      lastUpdatedBy: 'user'
    })

    // Create notification for admin
    await createStatusNotification(
      submissionId,
      submissionData.title,
      submissionData.submittedBy,
      'replied',
      `User replied: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`
    )

    return { success: true }
  } catch (error) {
    console.error('Error sending user reply:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send reply' }
  }
}

// Mark submission as seen by admin (clears update flags)
export async function markSubmissionAsSeen(submissionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const submissionRef = doc(db, SUBMITTED_SONGS_COLLECTION, submissionId)

    await updateDoc(submissionRef, {
      isUpdated: false,
      hasNewUserReply: false,
      lastSeenByAdmin: serverTimestamp()
    })

    return { success: true }
  } catch (error) {
    console.error('Error marking submission as seen:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to mark as seen' }
  }
}
