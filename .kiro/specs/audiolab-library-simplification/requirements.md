# Requirements Document

## Introduction

This feature simplifies the AudioLab Library interface by removing complex UI elements (bottom sheet, fullscreen player, mini player, voice part filters) and replacing them with a streamlined collapsible song card design. Each song expands inline to reveal its available vocal parts, allowing users to play all parts together or isolate individual parts directly from the list.

## Glossary

- **AudioLab**: The audio production and practice module within LWSRH
- **Collapsible Song Card**: A song list item that expands/collapses to show vocal parts
- **Vocal Part**: Individual audio track for a voice type (Soprano, Alto, Tenor, Bass, Full Mix)
- **Part Isolation**: Playing only a single vocal part while muting others
- **Full Mix**: All vocal parts combined into one audio track
- **Inline Playback**: Audio controls embedded within the song card, no separate player UI

## Requirements

### Requirement 1: Remove Complex UI Elements

**User Story:** As a choir member, I want a simpler library interface without popups and overlays, so that I can quickly access songs without extra navigation steps.

#### Acceptance Criteria

1. WHEN the library view loads THEN the AudioLab SHALL NOT display a bottom sheet (SongActionSheet) when a song is tapped
2. WHEN a song is playing THEN the AudioLab SHALL NOT display a mini player at the bottom of the screen
3. WHEN a song is playing THEN the AudioLab SHALL NOT display a fullscreen player option
4. WHEN the library view loads THEN the AudioLab SHALL NOT display voice part filter tabs (Soprano, Alto, Tenor, Bass)
5. WHEN the library view loads THEN the AudioLab SHALL display only an "All" filter showing all songs in a single list

### Requirement 2: Collapsible Song Card Design

**User Story:** As a choir member, I want to tap a song to see its available vocal parts inline, so that I can quickly access different parts without navigating away.

#### Acceptance Criteria

1. WHEN a user taps a song card THEN the AudioLab SHALL expand the card to reveal available vocal parts (Full Mix, Soprano, Alto, Tenor, Bass)
2. WHEN a song card is expanded THEN the AudioLab SHALL display each available vocal part as a tappable row with part name and play button
3. WHEN a user taps an expanded song card header THEN the AudioLab SHALL collapse the card back to its compact state
4. WHEN a song card expands THEN the AudioLab SHALL animate the expansion smoothly
5. WHEN only one song card is expanded THEN the AudioLab SHALL collapse any previously expanded card (accordion behavior)
6. WHEN a song has no multiple parts THEN the AudioLab SHALL still allow expansion showing only the Full Mix option

### Requirement 3: Play All Parts Together

**User Story:** As a choir member, I want to play all vocal parts of a song at once, so that I can hear the complete arrangement.

#### Acceptance Criteria

1. WHEN a song card is expanded THEN the AudioLab SHALL display a "Play All" button prominently
2. WHEN a user taps "Play All" THEN the AudioLab SHALL begin playback of the Full Mix audio track
3. WHEN "Play All" is active THEN the AudioLab SHALL display playback controls (play/pause, progress) inline within the expanded card
4. WHEN playback is active THEN the AudioLab SHALL show the current playback time and total duration
5. WHEN a user taps pause THEN the AudioLab SHALL pause playback and maintain the current position

### Requirement 4: Isolate Individual Vocal Parts

**User Story:** As a choir member, I want to play just my vocal part (e.g., Soprano), so that I can practice my specific line.

#### Acceptance Criteria

1. WHEN a song card is expanded THEN the AudioLab SHALL display each available vocal part with its own play button
2. WHEN a user taps a specific part's play button THEN the AudioLab SHALL play only that vocal part audio
3. WHEN an isolated part is playing THEN the AudioLab SHALL visually indicate which part is currently active
4. WHEN switching between parts during playback THEN the AudioLab SHALL maintain the current playback position
5. WHEN a part is not available for a song THEN the AudioLab SHALL NOT display that part option

### Requirement 5: Inline Playback Controls

**User Story:** As a choir member, I want playback controls within the song card, so that I can control audio without a separate player interface.

#### Acceptance Criteria

1. WHEN audio is playing THEN the AudioLab SHALL display a progress bar within the expanded song card
2. WHEN a user drags the progress bar THEN the AudioLab SHALL seek to the specified position
3. WHEN audio is playing THEN the AudioLab SHALL display a play/pause toggle button
4. WHEN audio playback reaches the end THEN the AudioLab SHALL stop playback and reset to the beginning
5. WHEN a user collapses a playing song card THEN the AudioLab SHALL stop playback

