# Requirements Document

## Introduction

This feature expands push notifications across the LWSRH app to ensure users receive timely browser/mobile notifications for all important events - not just voice calls. Currently, only voice calls and real-time chat messages trigger push notifications. This expansion will add server-side FCM push notifications for chat messages, AudioLab invites, calendar events, song approvals/rejections, media uploads, and zone announcements.

## Glossary

- **FCM**: Firebase Cloud Messaging - Google's push notification service
- **RTDB**: Firebase Realtime Database - used to store FCM tokens (separate quota from Firestore)
- **Push Notification**: Browser/mobile notification that appears even when app is closed
- **Zone**: A group/organization within the app (e.g., CE Lagos Zone 1)
- **AudioLab**: The app's collaborative music production studio feature

## Requirements

### Requirement 1

**User Story:** As a user, I want to receive push notifications for new chat messages, so that I don't miss important conversations when I'm not actively using the app.

#### Acceptance Criteria

1. WHEN a user sends a chat message THEN the system SHALL send a push notification to all other participants in the chat
2. WHEN a user is currently viewing the chat THEN the system SHALL NOT send a push notification for that chat
3. WHEN displaying a chat notification THEN the system SHALL show the sender name and message preview
4. WHEN a user clicks a chat notification THEN the system SHALL navigate to that specific chat

### Requirement 2

**User Story:** As a user, I want to receive push notifications for AudioLab collaboration invites, so that I can quickly respond to project invitations.

#### Acceptance Criteria

1. WHEN a user is added as a collaborator to an AudioLab project THEN the system SHALL send a push notification to that user
2. WHEN displaying an AudioLab invite notification THEN the system SHALL show the project name and inviter's name
3. WHEN a user clicks an AudioLab notification THEN the system SHALL navigate to that specific project

### Requirement 3

**User Story:** As a user, I want to receive push notifications for upcoming calendar events, so that I don't miss rehearsals and important dates.

#### Acceptance Criteria

1. WHEN a calendar event is 24 hours away THEN the system SHALL send a reminder push notification to zone members
2. WHEN a calendar event is 1 hour away THEN the system SHALL send a final reminder push notification
3. WHEN displaying a calendar notification THEN the system SHALL show the event name and time
4. WHEN a user clicks a calendar notification THEN the system SHALL navigate to the calendar page

### Requirement 4

**User Story:** As a song submitter, I want to receive push notifications when my song is approved or rejected, so that I know the status immediately.

#### Acceptance Criteria

1. WHEN an admin approves a song submission THEN the system SHALL send a push notification to the submitter
2. WHEN an admin rejects a song submission THEN the system SHALL send a push notification to the submitter with the reason
3. WHEN an admin replies to a song submission THEN the system SHALL send a push notification to the submitter
4. WHEN a user clicks a song notification THEN the system SHALL navigate to the song submission page

### Requirement 5

**User Story:** As a zone member, I want to receive push notifications for new media uploads, so that I can stay updated on new content.

#### Acceptance Criteria

1. WHEN a new video is uploaded to the media library THEN the system SHALL send a push notification to zone members
2. WHEN a new playlist is created THEN the system SHALL send a push notification to zone members
3. WHEN displaying a media notification THEN the system SHALL show the content title and type
4. WHEN a user clicks a media notification THEN the system SHALL navigate to the media page

### Requirement 6

**User Story:** As a zone member, I want to receive push notifications for zone announcements, so that I don't miss important messages from leadership.

#### Acceptance Criteria

1. WHEN an admin posts a zone announcement THEN the system SHALL send a push notification to all zone members
2. WHEN displaying a zone notification THEN the system SHALL show the announcement title and preview
3. WHEN a user clicks a zone notification THEN the system SHALL navigate to the notifications page

### Requirement 7

**User Story:** As a system administrator, I want a unified notification API, so that all notification types use consistent infrastructure.

#### Acceptance Criteria

1. THE system SHALL provide a single API endpoint for sending push notifications
2. THE system SHALL support different notification types (chat, audiolab, calendar, song, media, zone)
3. THE system SHALL handle invalid/expired FCM tokens gracefully by removing them
4. THE system SHALL log notification delivery success/failure for debugging
