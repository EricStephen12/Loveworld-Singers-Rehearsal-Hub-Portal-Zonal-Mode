# AudioLab Complete User Journey

## Core Design Philosophy

**Suno/TikTok Thinking:** "How do we give the user a win in under 60 seconds?"

Not about:
- Where to click
- Which tab
- Which feature

Design for:
- Confidence
- Momentum  
- Reward

---

## 🟢 THE 60-SECOND JOURNEY

### ⏱️ 0–3 seconds → ENTRY

**Screen:** Home / Start

Nothing else exists yet. Big center CTA:

```
🎙️ Create a Project
"Make music in under a minute"
```

Optional (small):
- ▶ Continue last project (if exists)

❌ No tabs  
❌ No Library  
❌ No Studio

---

### ⏱️ 3–10 seconds → COMMITMENT

User taps "Create a Project"

**Next screen (forced choice):**
"How do you want to start?"

Buttons:
- 🎙️ Record from scratch
- 🎧 Use a song

That's it. No distractions.

---

### ⏱️ 10–25 seconds → ACTION (FAST WIN)

**If "Record from scratch":**
1. Create project instantly
2. Open Studio
3. Mic permission auto-request
4. Big pulsing Record button
5. Text: "Say anything — you can delete it later"
6. User records anything

*This matters psychologically.*

---

### ⏱️ 25–40 seconds → REWARD

User taps Stop

Immediately:
- Waveform appears
- Playback starts automatically
- Text appears: ✅ "You just created your first take"

🎉 Dopamine hit.

---

### ⏱️ 40–60 seconds → NEXT ACTION (LOOP)

Now you guide them.

**Overlay / banner:**
"What do you want to do next?"

Buttons:
- ➕ Add another layer
- 🎤 Practice singing
- 💾 Save & continue later

User picks → loop continues.

---

## 🔁 THE LOOP

```
Create → Small success → Reward → Suggest next action → Repeat
```

Never ask: "What tab do you want?"
Always suggest: "Do this next."

---

## App Structure

### Views (Intent-Based Navigation)

| View | Purpose | Entry Point |
|------|---------|-------------|
| `home` | Entry point, single CTA | Default landing |
| `intent-choice` | "How do you want to start?" | After tapping Create |
| `studio` | Recording workspace | After choosing intent |
| `library` | Song browser | Only when user needs a song |
| `practice` | Practice modes | After recording or from suggestion |
| `karaoke` | Sing-along mode | From practice or library |
| `collab` | Live sessions | From suggestion or explicit nav |

### Bottom Navigation (Hidden Initially)

Only appears AFTER first project created:

| Icon | Label | View |
|------|-------|------|
| Home | Home | `home` |
| Music2 | Library | `library` |
| Mic | Practice | `practice` |
| Users | Collab | `collab` |

---

## HOME VIEW (Entry Point)

### First-Time User (No Projects)

```
┌─────────────────────────────────┐
│                                 │
│         [AudioLab Logo]         │
│                                 │
│    ┌─────────────────────┐      │
│    │                     │      │
│    │   🎙️ Create a       │      │
│    │      Project        │      │
│    │                     │      │
│    └─────────────────────┘      │
│                                 │
│    Make music in under          │
│    a minute                     │
│                                 │
└─────────────────────────────────┘
```

### Returning User (Has Projects)

```
┌─────────────────────────────────┐
│                                 │
│    ┌─────────────────────┐      │
│    │ ▶ Continue:         │      │
│    │   "My Recording"    │      │
│    │   1:23 recorded     │      │
│    └─────────────────────┘      │
│                                 │
│    ┌─────────────────────┐      │
│    │   🎙️ New Project    │      │
│    └─────────────────────┘      │
│                                 │
└─────────────────────────────────┘
```

---

## INTENT CHOICE VIEW

After tapping "Create a Project":

```
┌─────────────────────────────────┐
│         ← Back                  │
│                                 │
│    How do you want to start?    │
│                                 │
│    ┌─────────────────────┐      │
│    │ 🎙️ Record from      │      │
│    │    scratch          │      │
│    │                     │      │
│    │ Start with your     │      │
│    │ voice               │      │
│    └─────────────────────┘      │
│                                 │
│    ┌─────────────────────┐      │
│    │ 🎧 Use a song       │      │
│    │                     │      │
│    │ Pick a backing      │      │
│    │ track first         │      │
│    └─────────────────────┘      │
│                                 │
└─────────────────────────────────┘
```

---

## STUDIO VIEW (Recording)

### Initial State (Ready to Record)

```
┌─────────────────────────────────┐
│  ← Back        New Recording    │
│                                 │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │   Say anything —        │    │
│  │   you can delete it     │    │
│  │   later                 │    │
│  │                         │    │
│  │   [Empty waveform area] │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│         ┌───────────┐           │
│         │           │           │
│         │  ● REC    │  ← Big,   │
│         │           │    pulsing│
│         └───────────┘           │
│                                 │
│         00:00                   │
└─────────────────────────────────┘
```

### Recording State

```
┌─────────────────────────────────┐
│  ← Back        Recording...     │
│                                 │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │   🔴 Recording          │    │
│  │                         │    │
│  │   [Live waveform]       │    │
│  │   ▁▂▃▅▆▇▆▅▃▂▁          │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│         ┌───────────┐           │
│         │           │           │
│         │  ■ STOP   │  ← Tap    │
│         │           │    to stop│
│         └───────────┘           │
│                                 │
│         00:15                   │
└─────────────────────────────────┘
```

### After Recording (REWARD)

```
┌─────────────────────────────────┐
│  ← Back        My Recording     │
│                                 │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │   ✅ You just created   │    │
│  │      your first take!   │    │
│  │                         │    │
│  │   [Waveform display]    │    │
│  │   ▁▂▃▅▆▇▆▅▃▂▁▂▃▅▆▇▆▅   │    │
│  │                         │    │
│  │   ▶ Playing...          │    │
│  └─────────────────────────┘    │
│                                 │
│  What do you want to do next?   │
│                                 │
│  ┌──────────┐ ┌──────────┐      │
│  │ ➕ Add   │ │ 🎤 Practice│     │
│  │  layer   │ │  singing │      │
│  └──────────┘ └──────────┘      │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 💾 Save & continue later│    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

---

## LIBRARY VIEW

Only accessed when:
1. User chooses "Use a song" from intent choice
2. User explicitly navigates via bottom nav (after first project)

### Purpose
Browse and select songs as backing tracks or for practice.

### Key Difference from Current
- No "New Project" button here
- Library doesn't decide what happens
- Every song tap leads to clear action

---

## NON-NEGOTIABLE RULES

1. **No tabs before intent** - User must commit to an action first
2. **Studio never creates projects silently** - Explicit project creation
3. **Library never decides what happens** - It's a picker, not a launcher
4. **Every click must feel like progress** - No dead ends
5. **Reward before explanation** - Show success, then options

---

## STATE MANAGEMENT

### AudioLabContext State

```typescript
{
  // Navigation
  currentView: ViewType,           // 'home' | 'intent-choice' | 'studio' | 'library' | 'practice' | 'karaoke' | 'collab'
  previousView: ViewType | null,
  hasCompletedFirstProject: boolean, // Controls bottom nav visibility
  
  // Project
  currentProject: Project | null,
  recentProjects: Project[],
  
  // Player (for backing tracks)
  player: PlayerState,
  
  // Recording
  isRecording: boolean,
  hasFirstRecording: boolean,      // For showing reward
  
  // UI
  showNextActionPrompt: boolean,   // After recording completes
}
```

### Key Actions

- `createProject(intent: 'scratch' | 'song')` - Create project with intent
- `startRecording()` - Begin recording
- `stopRecording()` - Stop and trigger reward
- `showNextActions()` - Display "what next" prompt
- `continueProject(id)` - Resume existing project

---

## FILE STRUCTURE

```
src/app/pages/audiolab/
├── page.tsx                    # Main page component
├── layout.tsx                  # AudioLabProvider wrapper
├── _components/
│   ├── index.ts               # Barrel exports
│   ├── HomeView.tsx           # Entry point (NEW)
│   ├── IntentChoiceView.tsx   # "How to start?" (NEW)
│   ├── StudioView.tsx         # Recording (REFACTORED)
│   ├── LibraryView.tsx        # Song picker (SIMPLIFIED)
│   ├── PracticeView.tsx       # Practice modes
│   ├── KaraokeView.tsx        # Karaoke mode
│   ├── CollabView.tsx         # Collaboration
│   ├── MiniPlayer.tsx         # Collapsed player
│   ├── FullScreenPlayer.tsx   # Expanded player
│   ├── BottomNav.tsx          # Navigation (CONDITIONAL)
│   └── NextActionPrompt.tsx   # "What next?" overlay (NEW)
├── _context/
│   └── AudioLabContext.tsx    # Global state (UPDATED)
├── _lib/
│   ├── audio-engine.ts        # Web Audio API
│   ├── song-service.ts        # Song CRUD
│   ├── project-service.ts     # Project CRUD
│   └── practice-service.ts    # Practice tracking
└── _types/
    └── index.ts               # TypeScript types
```

---

## IMPLEMENTATION STATUS

### ✅ Completed Features
- **Entry Flow** - HomeView → IntentChoiceView → Studio (60-second journey)
- **Project Creation** - Create from scratch or with backing track
- **Recording** - Mic capture with real-time waveform visualization
- **Playback** - Auto-play after recording, manual playback controls
- **Multi-track** - Add vocal layers, mute/solo controls
- **Reward Loop** - "First take" celebration + next action prompt
- **Continue Project** - Resume from HomeView
- **Karaoke Mode** - Real pitch detection, scoring, lyrics display
- **Vocal Warm-Up** - 5 guided exercises with timer and mic monitoring
- **Practice Stats** - XP, streaks, weekly progress tracking
- **Cloud Upload** - Recordings saved to Cloudinary
- **Backing Track** - Play song while recording with volume control
- **Project Settings** - Rename, delete, export, share projects
- **Live Sessions** - Create/join sessions with real-time chat
- **Session Waveform** - Animated visualization during live sessions

### 🔧 Partially Complete
- **Collab Playback Sync** - Real-time playback sync between participants
- **Pitch Training** - Coming soon placeholder
- **Vocal Strength** - Coming soon placeholder

### ❌ Not Yet Implemented
- **Real lyrics sync** - Need timed lyrics data from songs
- **Vocal part isolation** - Switch between S/A/T/B parts during practice
- **Audio mixing** - Mix multiple tracks for export
