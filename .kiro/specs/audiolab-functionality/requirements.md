# Requirements Document

## Introduction

AudioLab is a comprehensive audio production and practice platform for LoveWorld Singers. The system enables choir members to practice songs with karaoke mode, record multi-track vocal layers in a DAW-style studio, collaborate in real-time sessions, and manage their song library. The platform integrates with Firebase for data persistence and Cloudinary for audio file storage.

## Glossary

- **AudioLab**: The audio production and practice module within LWSRH
- **Track**: A single audio layer in a multi-track project (vocal, harmony, guide track)
- **Project**: A multi-track recording session containing multiple tracks
- **Session**: A real-time collaborative recording session with multiple participants
- **Karaoke Mode**: Practice mode with scrolling lyrics and pitch feedback
- **Web Audio API**: Browser API for audio processing, playback, and recording
- **Waveform**: Visual representation of audio amplitude over time
- **BPM**: Beats per minute - tempo measurement
- **Guide Track**: Pre-recorded backing track for singers to follow

## Requirements

### Requirement 1: Audio Playback Engine

**User Story:** As a choir member, I want to play songs from the library with full playback controls, so that I can listen and practice along.

#### Acceptance Criteria

1. WHEN a user selects a song from the library THEN the AudioLab SHALL load the default audio file (Full Mix) and display it in the mini player
2. WHEN a user taps the play button THEN the AudioLab SHALL begin audio playback from the current position
3. WHEN a user taps the pause button THEN the AudioLab SHALL pause playback and maintain the current position
4. WHEN a user drags the progress bar THEN the AudioLab SHALL seek to the specified position in the audio
5. WHEN a user adjusts the volume slider THEN the AudioLab SHALL change the playback volume accordingly
6. WHEN audio playback reaches the end THEN the AudioLab SHALL handle repeat mode (off, all, one) appropriately
7. WHEN shuffle mode is enabled THEN the AudioLab SHALL randomize the playback order of songs in the queue
8. WHEN a user selects a different vocal part THEN the AudioLab SHALL switch to that audio track while maintaining playback position
9. WHEN loading a song with multiple parts THEN the AudioLab SHALL pre-load all available parts for seamless switching

### Requirement 2: Song Library Management

**User Story:** As a choir member, I want to browse and search songs in my library, so that I can quickly find what I need to practice.

#### Acceptance Criteria

1. WHEN the library view loads THEN the AudioLab SHALL fetch and display songs from Firebase filtered by the user's zone
2. WHEN a user types in the search bar THEN the AudioLab SHALL filter songs by title, artist, or genre in real-time
3. WHEN a user selects a filter chip (Soprano, Alto, Tenor, Bass) THEN the AudioLab SHALL filter songs that have that vocal part available
4. WHEN a user taps on a song card THEN the AudioLab SHALL display song details and available vocal parts
5. WHEN a user long-presses a song THEN the AudioLab SHALL show a context menu with options (add to playlist, share, download)

### Requirement 2.1: Multi-Part Audio System

**User Story:** As a choir member, I want to switch between different vocal parts of a song (Full Mix, Alto, Soprano, Tenor, Bass), so that I can practice my specific part or hear how it fits with others.

#### Acceptance Criteria

1. WHEN a song has multiple vocal parts THEN the AudioLab SHALL display a part selector showing available parts (Full Mix, Soprano, Alto, Tenor, Bass)
2. WHEN a user selects a vocal part THEN the AudioLab SHALL switch playback to that audio track seamlessly
3. WHEN switching parts during playback THEN the AudioLab SHALL maintain the current playback position
4. WHEN a part is not available for a song THEN the AudioLab SHALL disable that option in the selector
5. WHEN displaying song cards THEN the AudioLab SHALL show badges indicating which vocal parts are available

### Requirement 2.2: HQ Admin Song Distribution

**User Story:** As an HQ admin, I want to upload songs with multiple vocal part tracks, so that choir members across all zones can access properly separated audio for practice.

#### Acceptance Criteria

1. WHEN an HQ admin uploads a song THEN the Admin Panel SHALL allow uploading separate audio files for each vocal part (Full Mix, Soprano, Alto, Tenor, Bass)
2. WHEN uploading vocal parts THEN the Admin Panel SHALL validate that all files have matching duration
3. WHEN a song is published THEN the AudioLab SHALL make it available to all zones that have access
4. WHEN an HQ admin updates a song's audio THEN the AudioLab SHALL notify zones of the update
5. WHEN uploading audio files THEN the Admin Panel SHALL store them in Cloudinary under organized folders (songs/{songId}/full-mix.mp3, songs/{songId}/alto.mp3, etc.)
6. WHEN saving song metadata THEN the Admin Panel SHALL store URLs for each available vocal part in Firebase

### Requirement 3: Karaoke Practice Mode

**User Story:** As a choir member, I want to practice singing with scrolling lyrics and pitch feedback, so that I can improve my vocal accuracy.

#### Acceptance Criteria

1. WHEN a user enters karaoke mode THEN the AudioLab SHALL load the song's lyrics data and synchronize with audio playback
2. WHEN audio plays THEN the AudioLab SHALL scroll lyrics automatically, highlighting the current line
3. WHEN the user sings THEN the AudioLab SHALL capture microphone input and analyze pitch in real-time
4. WHEN pitch is analyzed THEN the AudioLab SHALL display a pitch accuracy indicator showing deviation from target
5. WHEN the user maintains accurate pitch THEN the AudioLab SHALL increment the streak counter and update the score
6. WHEN pitch accuracy drops below threshold THEN the AudioLab SHALL reset the streak counter
7. WHEN a lyric line is completed THEN the AudioLab SHALL display a rating (Perfect, Excellent, Great, Good)

### Requirement 4: Multi-Track Studio Recording

**User Story:** As a choir member, I want to record my vocal part over a guide track, so that I can create layered recordings for practice or submission.

#### Acceptance Criteria

1. WHEN a user creates a new project THEN the AudioLab SHALL initialize a multi-track session with default settings (BPM, time signature)
2. WHEN a user adds a track THEN the AudioLab SHALL create a new audio track with volume, pan, mute, and solo controls
3. WHEN a user presses the record button THEN the AudioLab SHALL capture microphone input and record to the active track
4. WHEN recording is active THEN the AudioLab SHALL display real-time waveform visualization of the input
5. WHEN a user stops recording THEN the AudioLab SHALL save the recorded audio and display the waveform on the track timeline
6. WHEN a user adjusts track volume THEN the AudioLab SHALL update the mix in real-time
7. WHEN a user toggles mute on a track THEN the AudioLab SHALL silence that track in the mix
8. WHEN a user toggles solo on a track THEN the AudioLab SHALL mute all other tracks except soloed ones
9. WHEN a user saves a project THEN the AudioLab SHALL upload audio files to Cloudinary and save project metadata to Firebase

### Requirement 5: Project Persistence

**User Story:** As a choir member, I want my recording projects to be saved and accessible across devices, so that I can continue working on them anytime.

#### Acceptance Criteria

1. WHEN a user saves a project THEN the AudioLab SHALL serialize project data (tracks, settings, metadata) to Firebase
2. WHEN a user opens a saved project THEN the AudioLab SHALL load all tracks and restore the previous state
3. WHEN audio files are recorded THEN the AudioLab SHALL upload them to Cloudinary with proper folder organization
4. WHEN loading a project THEN the AudioLab SHALL fetch audio URLs from Cloudinary and load them into the Web Audio context
5. WHEN a user deletes a project THEN the AudioLab SHALL remove project data from Firebase and audio files from Cloudinary

### Requirement 6: Real-Time Collaboration

**User Story:** As a choir section leader, I want to host live practice sessions where members can join and participate, so that we can rehearse together remotely.

#### Acceptance Criteria

1. WHEN a user creates a live session THEN the AudioLab SHALL generate a unique 6-digit join code
2. WHEN a user enters a valid join code THEN the AudioLab SHALL connect them to the active session
3. WHEN connected to a session THEN the AudioLab SHALL sync playback position across all participants
4. WHEN a participant speaks or sings THEN the AudioLab SHALL stream their audio to other participants in real-time
5. WHEN a participant sends a chat message THEN the AudioLab SHALL broadcast it to all session members
6. WHEN the host ends the session THEN the AudioLab SHALL disconnect all participants and clean up resources

### Requirement 7: Collaboration Chat

**User Story:** As a session participant, I want to communicate with other members via text and voice messages, so that we can coordinate during practice.

#### Acceptance Criteria

1. WHEN a user sends a text message THEN the AudioLab SHALL store it in Firebase and broadcast to session participants
2. WHEN a user records a voice note THEN the AudioLab SHALL upload it to Cloudinary and share the URL with participants
3. WHEN a new message arrives THEN the AudioLab SHALL display it in the chat with sender info and timestamp
4. WHEN a user is typing THEN the AudioLab SHALL show a typing indicator to other participants

### Requirement 8: Practice Progress Tracking

**User Story:** As a choir member, I want to track my practice progress over time, so that I can see my improvement and stay motivated.

#### Acceptance Criteria

1. WHEN a user completes a practice session THEN the AudioLab SHALL record the session data (duration, score, accuracy) to Firebase
2. WHEN the practice view loads THEN the AudioLab SHALL display weekly progress as a percentage of the target
3. WHEN a user maintains a daily practice streak THEN the AudioLab SHALL increment and display the streak counter
4. WHEN displaying stats THEN the AudioLab SHALL show total time practiced, sessions completed, and average grade

### Requirement 9: Audio File Management

**User Story:** As a choir member, I want to manage my recorded audio files, so that I can organize, share, or delete them as needed.

#### Acceptance Criteria

1. WHEN audio is recorded THEN the AudioLab SHALL encode it as WAV or MP3 format
2. WHEN uploading to Cloudinary THEN the AudioLab SHALL use the audiolab folder with user-specific subfolders
3. WHEN displaying audio files THEN the AudioLab SHALL show file name, duration, size, and creation date
4. WHEN a user deletes an audio file THEN the AudioLab SHALL remove it from both Cloudinary and Firebase

### Requirement 10: Offline Support

**User Story:** As a choir member, I want to access downloaded songs offline, so that I can practice without internet connectivity.

#### Acceptance Criteria

1. WHEN a user downloads a song THEN the AudioLab SHALL cache the audio file using the service worker
2. WHEN offline THEN the AudioLab SHALL load cached songs and allow playback
3. WHEN offline THEN the AudioLab SHALL queue any recordings for upload when connectivity returns
4. WHEN connectivity is restored THEN the AudioLab SHALL sync queued recordings to the cloud
