# Design Document: Push Notifications Expansion

## Overview

This feature expands the existing push notification infrastructure to cover all major app events. Currently, only voice calls use server-side FCM push notifications. This design extends that pattern to chat messages, AudioLab invites, calendar events, song approvals, media uploads, and zone announcements.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser/PWA)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Chat Service   │  │ AudioLab Service│  │  Admin Actions  │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │           │
│           └────────────────────┼────────────────────┘           │
│                                │                                │
│                    ┌───────────▼───────────┐                    │
│                    │  /api/send-notification │                   │
│                    │   (Unified API)        │                    │
│                    └───────────┬───────────┘                    │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Firebase Admin SDK    │
                    │   (Server-side FCM)     │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
    ┌─────────▼─────────┐ ┌─────▼─────┐ ┌─────────▼─────────┐
    │  Realtime DB      │ │   FCM     │ │  Token Cleanup    │
    │  (FCM Tokens)     │ │  Service  │ │  (Invalid tokens) │
    └───────────────────┘ └───────────┘ └───────────────────┘
```

## Components and Interfaces

### 1. Unified Notification API (`/api/send-notification`)

A single API endpoint that handles all notification types:

```typescript
interface NotificationRequest {
  type: 'chat' | 'audiolab' | 'calendar' | 'song' | 'media' | 'zone' | 'call';
  recipientIds: string[];  // User IDs to notify
  title: string;
  body: string;
  data?: {
    url?: string;          // Where to navigate on click
    chatId?: string;
    projectId?: string;
    eventId?: string;
    songId?: string;
    [key: string]: string | undefined;
  };
  excludeUserId?: string;  // Don't notify this user (e.g., sender)
}

interface NotificationResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors?: string[];
}
```

### 2. Notification Triggers

Each feature will call the unified API when events occur:

| Event | Trigger Location | Recipients |
|-------|-----------------|------------|
| Chat message | `chat-service.ts` sendMessage() | Other chat participants |
| AudioLab invite | AudioLab add collaborator action | Invited user |
| Calendar reminder | Cron job / scheduled function | Zone members |
| Song approval | Admin song review action | Song submitter |
| Media upload | Admin media upload action | Zone members |
| Zone announcement | Admin announcement action | Zone members |

### 3. FCM Token Management

Tokens are stored in Firebase Realtime Database at `fcm_tokens/{userId}`:

```typescript
interface FCMTokenData {
  token: string;
  platform: 'web' | 'android' | 'ios';
  updatedAt: number;
  userId: string;
}
```

## Data Models

### Notification Payload Structure

```typescript
// FCM Message structure
interface FCMMessage {
  token: string;
  data: Record<string, string>;  // All values must be strings
  webpush: {
    notification: {
      title: string;
      body: string;
      icon: string;
      badge: string;
      tag: string;
      requireInteraction: boolean;
      data: Record<string, string>;
    };
    fcmOptions: {
      link: string;  // Must be absolute URL
    };
  };
}
```

### Notification Types and URLs

| Type | Tag Format | Click URL |
|------|-----------|-----------|
| chat | `chat-{chatId}` | `/pages/groups?chat={chatId}` |
| audiolab | `audiolab-{projectId}` | `/pages/audiolab?project={projectId}` |
| calendar | `calendar-{eventId}` | `/pages/calendar` |
| song | `song-{songId}` | `/pages/submit-song` |
| media | `media-{timestamp}` | `/pages/media` |
| zone | `zone-{messageId}` | `/pages/notifications` |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Chat notification recipients exclude sender
*For any* chat message sent by user A to a chat with participants [A, B, C], the notification should be sent to [B, C] only, never to A.
**Validates: Requirements 1.1, 1.2**

### Property 2: Notification content completeness
*For any* notification of any type, the notification payload must contain a non-empty title, non-empty body, valid URL, and appropriate tag.
**Validates: Requirements 1.3, 2.2, 3.3, 5.3, 6.2**

### Property 3: Invalid token cleanup
*For any* FCM send that fails with "not found" or "not registered" error, the corresponding token should be removed from the database.
**Validates: Requirements 7.3**

### Property 4: Notification type support
*For any* valid notification type in ['chat', 'audiolab', 'calendar', 'song', 'media', 'zone', 'call'], the API should accept and process the request without error.
**Validates: Requirements 7.2**

### Property 5: Recipient filtering
*For any* notification request with excludeUserId set, that user should never receive the notification even if they are in recipientIds.
**Validates: Requirements 1.2**

## Error Handling

1. **Invalid FCM Token**: Remove from database, continue with other recipients
2. **No tokens found**: Return success with sentCount=0 (user hasn't enabled notifications)
3. **FCM quota exceeded**: Log error, return partial success
4. **Network errors**: Retry once, then fail gracefully

## Testing Strategy

### Unit Tests
- Test notification payload construction for each type
- Test recipient filtering logic
- Test URL generation for each notification type

### Property-Based Tests
- Use fast-check library for TypeScript
- Test that sender is never in recipients
- Test that all notification types are handled
- Test token cleanup on failures

### Integration Tests
- Test end-to-end notification flow with mock FCM
- Test service worker notification handling

## Implementation Notes

1. **Batch notifications**: For zone-wide notifications (media, announcements), batch FCM sends to avoid rate limits
2. **Deduplication**: Use notification tags to prevent duplicate notifications
3. **Quiet hours**: Consider adding user preference for notification quiet hours (future enhancement)
4. **Rate limiting**: Implement per-user rate limiting to prevent notification spam
