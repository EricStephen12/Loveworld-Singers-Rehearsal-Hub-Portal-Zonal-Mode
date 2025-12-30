# Design Document: AudioLab Library Simplification

## Overview

This feature transforms the AudioLab Library from a complex multi-layer UI (with bottom sheets, mini player, fullscreen player, and filter tabs) into a streamlined single-view interface using collapsible song cards. Each song expands inline to reveal its vocal parts, with playback controls embedded directly in the card.

## Architecture

The simplified architecture removes several UI layers:

```
BEFORE:
┌─────────────────────────────────────┐
│  LibraryView                        │
│  ├── Filter Tabs (All/S/A/T/B)      │
│  ├── Song List                      │
│  │   └── Song Cards (tap → sheet)   │
│  ├── SongActionSheet (bottom sheet) │
│  ├── MiniPlayer (persistent)        │
│  └── FullScreenPlayer (overlay)     │
└─────────────────────────────────────┘

AFTER:
┌─────────────────────────────────────┐
│  LibraryView                        │
│  ├── Search Bar                     │
│  └── Collapsible Song List          │
│      └── CollapsibleSongCard        │
│          ├── Header (tap to toggle) │
│          └── Expanded Content       │
│              ├── Play All Button    │
│              ├── Part List          │
│              └── Inline Controls    │
└─────────────────────────────────────┘
```

## Components and Interfaces

### 1. CollapsibleSongCard Component

```typescript
interface CollapsibleSongCardProps {
  song: Song;
  isExpanded: boolean;
  isPlaying: boolean;
  currentPart: VocalPart | null;
  currentTime: number;
  duration: number;
  onToggleExpand: () => void;
  onPlayAll: () => void;
  onPlayPart: (part: VocalPart) => void;
  onPause: () => void;
  onSeek: (time: number) => void;
}
```

### 2. Updated LibraryView State

```typescript
interface LibraryViewState {
  songs: Song[];
  searchQuery: string;
  expandedSongId: string | null;  // Only one expanded at a time
  playingSongId: string | null;
  playingPart: VocalPart | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}
```

### 3. Simplified AudioLabContext

Remove these state properties:
- `isPlayerVisible`
- `isFullScreenPlayer`

Remove these actions:
- `SHOW_FULLSCREEN_PLAYER`
- `HIDE_FULLSCREEN_PLAYER`
- `HIDE_PLAYER` (modify to just stop audio)

## Data Models

### Song (existing, unchanged)

```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  genre?: string;
  duration: number;
  albumArt?: string;
  audioUrl: string;
  audioUrls?: AudioUrls;
  availableParts?: VocalPart[];
}

interface AudioUrls {
  full?: string;
  soprano?: string;
  alto?: string;
  tenor?: string;
  bass?: string;
}

type VocalPart = 'full' | 'soprano' | 'alto' | 'tenor' | 'bass';
```

### Playback State (local to LibraryView)

```typescript
interface InlinePlaybackState {
  songId: string | null;
  part: VocalPart;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Expanded card shows all available parts
*For any* song with available vocal parts, when the card is expanded, the expanded content SHALL display exactly the parts listed in `song.availableParts`, each with a play button.
**Validates: Requirements 2.1, 2.2, 4.1, 4.5**

### Property 2: Accordion behavior - single expansion
*For any* two songs in the library, when the second song is expanded, the first song SHALL be collapsed (only one `expandedSongId` at a time).
**Validates: Requirements 2.5**

### Property 3: Toggle expansion
*For any* song card, tapping the header when collapsed SHALL expand it, and tapping when expanded SHALL collapse it (toggle behavior).
**Validates: Requirements 2.1, 2.3**

### Property 4: Play All triggers full mix
*For any* song, when "Play All" is tapped, the audio engine SHALL receive a play command for the 'full' part.
**Validates: Requirements 3.2**

### Property 5: Part isolation plays correct track
*For any* song and any available vocal part, when that part's play button is tapped, the audio engine SHALL receive a play command for that specific part.
**Validates: Requirements 4.2**

### Property 6: Position preservation on part switch
*For any* song during playback, when switching from one part to another, the playback position SHALL remain within 0.5 seconds of the original position.
**Validates: Requirements 4.4**

### Property 7: Playback controls visibility
*For any* song that is currently playing, the expanded card SHALL display: progress bar, current time, total duration, and play/pause button.
**Validates: Requirements 3.3, 3.4, 5.1, 5.3**

### Property 8: Active part indication
*For any* song with an isolated part playing, that part's row SHALL have distinct visual styling (e.g., highlighted background, different icon state).
**Validates: Requirements 4.3**

### Property 9: Collapse stops playback
*For any* song that is currently playing, when its card is collapsed, the audio engine SHALL receive a stop command and `isPlaying` SHALL become false.
**Validates: Requirements 5.5**

### Property 10: Seek updates position
*For any* seek operation on the progress bar, the audio engine's current time SHALL update to the seeked position within 0.1 seconds.
**Validates: Requirements 5.2**

### Property 11: Pause preserves position
*For any* playing song, when pause is triggered, the playback position SHALL remain unchanged (within 0.1 seconds tolerance).
**Validates: Requirements 3.5**

## Error Handling

| Scenario | Handling |
|----------|----------|
| Audio fails to load | Display error message in card, disable play buttons |
| Part audio URL missing | Hide that part from the list |
| Network interruption during playback | Pause playback, show retry option |
| Invalid song data | Skip song in list, log error |

## Testing Strategy

### Property-Based Testing Library
- **fast-check** for TypeScript property-based testing

### Unit Tests
- CollapsibleSongCard renders correctly in collapsed/expanded states
- Filter removal - only "All" filter present
- Bottom sheet, mini player, fullscreen player components not rendered

### Property-Based Tests
Each correctness property will have a corresponding property-based test:

1. **Property 1 Test**: Generate random songs with various `availableParts` configurations, expand card, verify displayed parts match `availableParts`
2. **Property 2 Test**: Generate list of songs, expand one, expand another, verify only second is expanded
3. **Property 3 Test**: Generate song, toggle expand twice, verify state returns to original
4. **Property 4 Test**: Generate song, trigger Play All, verify audio engine called with 'full' part
5. **Property 5 Test**: Generate song with parts, trigger each part play, verify correct part sent to engine
6. **Property 6 Test**: Generate playback state with position, switch parts, verify position preserved
7. **Property 7 Test**: Generate playing state, verify all control elements present
8. **Property 8 Test**: Generate song with active part, verify that part has active styling
9. **Property 9 Test**: Generate playing song, collapse card, verify stop called and isPlaying false
10. **Property 10 Test**: Generate seek position, trigger seek, verify engine position updated
11. **Property 11 Test**: Generate playing state with position, pause, verify position unchanged

### Test Configuration
- Minimum 100 iterations per property test
- Each test tagged with: `**Feature: audiolab-library-simplification, Property {N}: {description}**`

