/**
 * UNIFIED BACKEND CLIENT
 * This is the bridge between the Website UI and the new Standalone Backend API.
 */

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

export const BackendAPI = {
  // Songs
  songs: {
    getAll: () => apiFetch('/api/songs'),
    getById: (id: string) => apiFetch(`/api/songs/${id}`),
    create: (data: any) => apiFetch('/api/songs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiFetch(`/api/songs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiFetch(`/api/songs/${id}`, {
      method: 'DELETE',
    }),
  },

  // Profiles
  profiles: {
    get: (id: string) => apiFetch(`/api/profile/${id}`),
    update: (id: string, data: any) => apiFetch(`/api/profile/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },

  // Rehearsals & Praise Nights
  rehearsals: {
    getAll: (zoneId?: string) => apiFetch(`/api/rehearsals${zoneId ? `?zoneId=${zoneId}` : ''}`),
    create: (data: any) => apiFetch('/api/rehearsals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiFetch(`/api/rehearsals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string, zoneId?: string) => apiFetch(`/api/rehearsals/${id}${zoneId ? `?zoneId=${zoneId}` : ''}`, {
      method: 'DELETE',
    }),
  },

  // Chat
  chat: {
    sendMessage: (data: {
      chatId: string;
      message: string;
      userId: string;
      userName: string;
      type?: string;
      mediaUrl?: string;
    }) => apiFetch('/api/chat/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Attendance
  attendance: {
    mark: (data: any) => apiFetch('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getByUser: (userId: string) => apiFetch(`/api/attendance?userId=${userId}`),
    getByRehearsal: (rehearsalId: string) => apiFetch(`/api/attendance?rehearsalId=${rehearsalId}`),
    getAll: (zoneId?: string) => apiFetch(`/api/attendance${zoneId ? `?zoneId=${zoneId}` : ''}`),
  },

  // Announcements
  announcements: {
    getAll: () => apiFetch('/api/announcements'),
  },

  // Media
  media: {
    getSignature: (folder: string, timestamp: number) => apiFetch('/api/media/signature', {
      method: 'POST',
      body: JSON.stringify({ folder, timestamp }),
    }),
  },

  // Generic CRUD
  generic: {
    list: (collection: string, limit = 500, whereField?: string, whereValue?: any, whereOperator?: string) => {
      let url = `/api/generic?collection=${collection}&limit=${limit}`;
      if (whereField && whereValue !== undefined) {
        url += `&whereField=${whereField}&whereValue=${whereValue}`;
        if (whereOperator) url += `&whereOperator=${whereOperator}`;
      }
      return apiFetch(url);
    },
    get: (collection: string, id: string) => apiFetch(`/api/generic?collection=${collection}&id=${id}`),
    create: (collection: string, data: any) => apiFetch(`/api/generic?collection=${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (collection: string, id: string, data: any) => apiFetch(`/api/generic?collection=${collection}&id=${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (collection: string, id: string) => apiFetch(`/api/generic?collection=${collection}&id=${id}`, {
      method: 'DELETE',
    }),
  },

  // Subscriptions
  subscriptions: {
    check: (userId: string, zoneId?: string) => 
      apiFetch(`/api/subscriptions?userId=${userId}${zoneId ? `&zoneId=${zoneId}` : ''}`),
  }
};
