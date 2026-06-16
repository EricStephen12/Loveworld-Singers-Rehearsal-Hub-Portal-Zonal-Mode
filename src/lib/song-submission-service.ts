import { BackendAPI } from './api-client';

// Strip trailing slashes to prevent double-slash URLs (e.g. host//api) 
// which cause Vercel 308 redirects that break CORS
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

/**
 * SONG SUBMISSION SERVICE (WEBSITE CLIENT)
 * All submission workflows, approvals, and notifications are now handled by the Standalone Backend.
 */

export interface ConversationMessage {
  id: string;
  sender: 'admin' | 'user';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SongSubmission {
  id?: string;
  title: string;
  lyrics: string;
  writer: string;
  category: string;
  key?: string;
  tempo?: string;
  leadSinger?: string;
  conductor?: string;
  leadKeyboardist?: string;
  leadGuitarist?: string;
  drummer?: string;
  solfas?: string;
  notes?: string;
  audioUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminSeen?: boolean;
  replyMessage?: string; // Legacy support
  user_name: string; // Legacy support
  conversation?: ConversationMessage[];
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
  type: 'new_submission' | 'approved' | 'rejected' | 'seen' | 'replied';
  message: string;
  read: boolean;
  createdAt: string;
}

// Proxied Methods
export async function submitSong(songData: any) {
  return await BackendAPI.generic.create('submitted_songs', {
    ...songData,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export async function getAllSubmittedSongs(zoneId?: string, _isHQ?: boolean) {
  const response = await BackendAPI.generic.list('submitted_songs');
  const all = response.data || [];
  return zoneId ? all.filter((s: any) => s.zoneId === zoneId) : all;
}

export async function getSubmissionsByZone(zoneId: string, status?: string) {
  const all = await getAllSubmittedSongs(zoneId);
  return status ? all.filter((s: any) => s.status === status) : all;
}

export async function getPendingSongs(zoneId?: string, _isHQGroup?: boolean) {
  const all = await getAllSubmittedSongs(zoneId);
  return all.filter((s: any) => s.status === 'pending');
}

export async function approveSong(submissionId: string, reviewerId: string, reviewerName: string, reviewNotes?: string) {
  return await fetch(`${BACKEND_URL}/api/submissions/${submissionId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewerId, reviewerName, reviewNotes })
  }).then(r => r.json());
}

export async function rejectSong(submissionId: string, reviewerId: string, reviewerName: string, reviewNotes: string) {
  return await fetch(`${BACKEND_URL}/api/submissions/${submissionId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewerId, reviewerName, reviewNotes })
  }).then(r => r.json());
}

export async function getUserSubmissions(userId: string) {
  const all = await getAllSubmittedSongs();
  return all.filter((s: any) => s.submittedBy.userId === userId);
}

export async function deleteUserSubmission(submissionId: string, userId: string) {
  // Check ownership first
  const submission = await BackendAPI.generic.get('submitted_songs', submissionId);
  if (submission.data?.submittedBy?.userId !== userId) throw new Error('Unauthorized');
  return await BackendAPI.generic.delete('submitted_songs', submissionId);
}

export async function updateUserSubmission(submissionId: string, userId: string, updates: any) {
  return await BackendAPI.generic.update('submitted_songs', submissionId, { ...updates, updatedAt: new Date() });
}

export async function replyToSubmission(submissionId: string, adminName: string, message: string) {
  return await fetch(`${BACKEND_URL}/api/submissions/${submissionId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminName, message, sender: 'admin' })
  }).then(r => r.json());
}

export async function userReplyToSubmission(submissionId: string, userId: string, message: string, userName?: string) {
  return await fetch(`${BACKEND_URL}/api/submissions/${submissionId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userName, message, sender: 'user' })
  }).then(r => r.json());
}

export async function getUnreadNotifications(_zoneId?: string, _isHQ?: boolean) {
  const response = await BackendAPI.generic.list('notifications');
  return (response.data || []).filter((n: any) => !n.read && !n.is_read && n.category === 'song');
}
export async function deleteSubmissionAsAdmin(submissionId: string) {
  return await BackendAPI.generic.delete('submitted_songs', submissionId);
}

export async function markSubmissionAsSeen(submissionId: string) {
  return await BackendAPI.generic.update('submitted_songs', submissionId, { adminSeen: true });
}
