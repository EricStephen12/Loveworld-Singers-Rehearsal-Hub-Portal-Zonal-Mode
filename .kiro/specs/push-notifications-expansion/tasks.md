# Implementation Plan

- [x] 1. Create unified notification API
  - [x] 1.1 Create `/api/send-notification/route.ts` with support for all notification types
    - Accept type, recipientIds, title, body, data, excludeUserId
    - Reuse FCM token fetching from existing send-call-notification
    - Support batch sending for multiple recipients
    - _Requirements: 7.1, 7.2_
  - [x] 1.2 Write property test for notification type support
    - **Property 4: Notification type support**
    - **Validates: Requirements 7.2**
  - [x] 1.3 Add invalid token cleanup on send failures
    - Remove tokens that return "not found" or "not registered"
    - _Requirements: 7.3_
  - [x] 1.4 Write property test for invalid token cleanup
    - **Property 3: Invalid token cleanup**
    - **Validates: Requirements 7.3**

- [x] 2. Implement chat message notifications
  - [x] 2.1 Update chat-service.ts sendMessage() to call notification API
    - Send to all participants except sender
    - Include chat name, sender name, message preview
    - _Requirements: 1.1, 1.3_
  - [x] 2.2 Write property test for chat notification recipients
    - **Property 1: Chat notification recipients exclude sender**
    - **Validates: Requirements 1.1, 1.2**
  - [x] 2.3 Add active chat detection to skip notifications
    - Don't notify users currently viewing the chat
    - _Requirements: 1.2_

- [x] 3. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement AudioLab invite notifications
  - [x] 4.1 Find AudioLab collaborator add function and add notification call
    - Send notification when user is added as collaborator
    - Include project name and inviter name
    - _Requirements: 2.1, 2.2_
  - [x] 4.2 Ensure notification click navigates to project
    - URL: `/pages/audiolab?project={projectId}`
    - _Requirements: 2.3_

- [x] 5. Implement song approval notifications
  - [x] 5.1 Find song approval/rejection admin action and add notification call
    - Send notification on approve, reject, or reply
    - Include song title and status
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 5.2 Ensure notification click navigates to song submission page
    - URL: `/pages/submit-song`
    - _Requirements: 4.4_

- [x] 6. Implement media upload notifications
  - [x] 6.1 Find media upload admin action and add notification call
    - Send notification when new video or playlist is added
    - Include content title and type
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 6.2 Ensure notification click navigates to media page
    - URL: `/pages/media`
    - _Requirements: 5.4_

- [x] 7. Implement zone announcement notifications
  - [x] 7.1 Find zone announcement creation and add notification call
    - Send notification to all zone members
    - Include announcement title and preview
    - _Requirements: 6.1, 6.2_
  - [x] 7.2 Ensure notification click navigates to notifications page
    - URL: `/pages/notifications`
    - _Requirements: 6.3_

- [x] 8. Implement calendar event reminders
  - [x] 8.1 Create scheduled function or cron job for calendar reminders
    - Check for events 24 hours and 1 hour away
    - Send reminder notifications to zone members
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 8.2 Ensure notification click navigates to calendar page
    - URL: `/pages/calendar`
    - _Requirements: 3.4_

- [x] 9. Final Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.
