# Nihongo Sprinter - Complete Project Context for AI Assistants

## 🎯 What Is This?

**Nihongo Sprinter** is an educational endless runner game that teaches Japanese vocabulary through gameplay. Players run through a 3D environment, collecting Japanese word orbs and matching them with their English translations.

### Core Learning Loop
```
1. Player sees Japanese orb (猫) → Picks it up
2. Player finds English orb (Cat) → Matches it
3. Native TTS pronounces both words
4. After 5 matches → Quiz to reinforce learning
5. Level up → New words introduced
```

---

## 🏗️ Architecture Overview

### Tech Stack
| Layer | Technology | Purpose |
|-------|------------|----------|
| 3D Rendering | Three.js + React Three Fiber | Game world, player, orbs |
| UI Framework | React 18 + TypeScript | HUD, menus, modals |
| Styling | Tailwind CSS | Responsive design |
| State Management | Zustand | Global game state |
| TTS Audio | Gemini 2.5 Flash Preview TTS | Native Japanese pronunciation |
| Build Tool | Vite | Dev server + production build |

### Key Files Map
```
nihongo2/
├── App.tsx                    # Main app, 3D canvas setup
├── store.ts                   # Zustand store (game state, actions)
├── vocabularyData.ts          # Word database (500+ Japanese words)
├── audioConfig.ts             # TTS voice/style settings
├── types.ts                   # TypeScript interfaces
├── vite.config.ts             # Dev server + TTS API middleware
│
├── components/
│   ├── System/
│   │   ├── Audio.ts           # AudioController class (TTS, sound effects)
│   │   └── Motivations.ts     # Japanese encouragement phrases
│   ├── UI/
│   │   ├── HUD.tsx            # Heads-up display, menus, quiz screen
│   │   ├── AudioSettings.tsx  # Voice selection modal
│   │   └── AudioDebugPanel.tsx# Debug TTS issues
│   └── World/
│       ├── Player.tsx         # 3D player character + controls
│       ├── Environment.tsx    # Ground, sky, obstacles
│       ├── LevelManager.tsx   # Spawns word orbs + gems
│       └── Effects.tsx        # Visual effects
│
└── server/
    └── index.js               # Express server (production TTS)
```

---

## 🎮 Game Mechanics

### State Machine
```
MENU → PLAYING → QUIZ → PLAYING → ... → GAME_OVER
                  ↓
                SHOP (optional)
```

### Vocabulary System
- **10 Categories**: animals, food, colors, numbers, nature, body, greetings, people, objects, verbs
- **Difficulty Levels**: 1-3 (common → advanced words)
- **Mastery Tracking**: Words get harder as player masters them
- **Writing Modes**: Kanji (猫), Hiragana (ねこ), Romaji (neko)

### Combo System
```typescript
// Match within 4 seconds = combo continues
COMBO_TIMEOUT = 4000ms

// Combo multiplier: 1x, 1.25x, 1.5x, 1.75x, 2x, ...
points = basePoints * (1 + (combo - 1) * 0.25)

// Combo >= 3 triggers motivational phrase
// Combo >= 5 triggers celebration animation
```

### Motivation System
```typescript
// Triggered on: game start, combo ≥3, quiz success, level up
MOTIVATION_PHRASES = [
  { jp: 'すごい！', en: 'Amazing!' },
  { jp: 'やった！', en: 'You did it!' },
  { jp: 'がんばれ！行くぞ！', en: "Do your best! Let's go!" },
  // ... more phrases
]
```

---

## 🔊 TTS System (Critical Component)

### How It Works
```
Client (Audio.ts)              Server (vite.config.ts)
      │                              │
      │  POST /api/tts               │
      │  {text, lang, voice}    ──►  │
      │                              │  Gemini API
      │                              │  ──────────►
      │                              │  PCM audio
      │  ◄──  {audioContent}         │  ◄──────────
      │                              │
      ▼                              │
  PCM → AudioBuffer → Play           │
```

### API Configuration
```typescript
Model: 'gemini-2.5-flash-preview-tts'
Voice: 'Kore' (multilingual)
Format: PCM s16le, 24000Hz, mono
Auth: Header 'x-goog-api-key'
```

### Rate Limiting
- **Limit**: ~10 requests/minute
- **Solution**: Batch size 2, 1.5s delay between batches
- **Fallback**: Game continues without audio if TTS fails

### Known Issues
1. Some Japanese characters return `finishReason: OTHER` (no audio)
2. Rate limiting can cause silent words during preload
3. Browser audio context needs user interaction to start

---

## 🚀 Future Potential

### Educational Enhancements
| Feature | Description | Complexity |
|---------|-------------|------------|
| **Spaced Repetition** | SRS algorithm for word review timing | Medium |
| **Sentence Mode** | Learn phrases, not just words | Medium |
| **Grammar Lessons** | Teach particles (は, が, を) through gameplay | High |
| **JLPT Levels** | Organize words by N5→N1 proficiency | Low |
| **Kanji Stroke Order** | Mini-game to practice writing | High |
| **Listening Mode** | Hear word first, find the match | Low |

### Game Enhancements
| Feature | Description | Complexity |
|---------|-------------|------------|
| **Multiplayer Race** | Compete with friends | High |
| **Daily Challenges** | Streak rewards, leaderboards | Medium |
| **Character Customization** | Unlock skins with gems | Low |
| **Boss Battles** | Quiz battles against AI | Medium |
| **Story Mode** | Narrative-driven levels | High |
| **Mobile App** | React Native or Capacitor | Medium |

### Technical Improvements
| Feature | Description | Complexity |
|---------|-------------|------------|
| **Offline Mode** | Cache audio, play without internet | Medium |
| **User Accounts** | Save progress to cloud | Medium |
| **Analytics** | Track learning progress over time | Low |
| **AI Tutor** | Gemini-powered explanations | Medium |
| **Voice Input** | Practice pronunciation with STT | High |

---

## 📊 Data Structures

### Word Data
```typescript
interface WordData {
  id: string;        // 'animals_cat'
  en: string;        // 'Cat'
  jp: string;        // '猫'
  hiragana: string;  // 'ねこ'
  romaji: string;    // 'neko'
  category: string;  // 'animals'
  difficulty: number;// 1-3
  mastery: number;   // 0-5 (learned level)
}
```

### Game State (Zustand)
```typescript
interface GameState {
  // Core
  status: 'menu' | 'playing' | 'quiz' | 'shop' | 'gameover';
  score: number;
  lives: number;
  level: number;
  
  // Vocabulary
  activeWords: WordData[];      // Current level words
  holdingWord: WordData | null; // Currently held orb
  matchesMade: number;          // Progress to quiz
  
  // Progression
  combo: number;
  streak: number;
  achievements: Achievement[];
  
  // Settings
  selectedCategories: string[];
  writingMode: 'kanji' | 'hiragana' | 'romaji';
  audioSettings: { voice, style, speed };
  
  // Motivation
  currentMotivation: { jp, en } | null;
  showComboCelebration: boolean;
}
```

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Development (with TTS API)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```bash
# .env.local
GEMINI_API_KEY=your_api_key_here
```

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No audio | Missing API key | Add GEMINI_API_KEY to .env.local |
| 400 error "Thinking not enabled" | Wrong API params | Remove thinkingConfig from request |
| 429 rate limit | Too many TTS requests | Reduce batch size, add delays |
| Audio doesn't play | Browser blocked | User must click before audio works |
| Game freezes on load | TTS preload blocking | Made errors non-blocking |

---

## 💡 For AI Assistants Working on This Project

### Quick Context
1. This is a **Japanese learning game** disguised as an endless runner
2. The **TTS system** is the most complex part - uses Gemini's native audio API
3. State is managed with **Zustand** in `store.ts`
4. The 3D world uses **React Three Fiber** (Three.js + React)
5. Audio is handled by **AudioController** class in `Audio.ts`

### Before Making Changes
1. Read `store.ts` to understand game state
2. Check `vite.config.ts` for the TTS API middleware
3. Test audio with the Audio Debug Panel (accessible from menu)
4. The game should **never block** on TTS errors

### Key Design Decisions
1. **PCM audio format** - Gemini TTS returns raw PCM, must convert to AudioBuffer
2. **Client-side prompt building** - Audio.ts adds style wrappers, server passes through
3. **Caching** - Both server (Map) and client (Map<AudioBuffer>) cache audio
4. **Non-blocking errors** - Game continues even if TTS fails
5. **Motivation system** - Visual + audio feedback for engagement

---

## 🎯 Vision Statement

> **Nihongo Sprinter aims to make Japanese learning addictive.**
> 
> By combining the dopamine loop of endless runners with spaced repetition
> and native pronunciation, players learn vocabulary without feeling like
> they're studying. The game targets youth learners (8-16) but works for
> all ages.
>
> The ultimate goal is a mobile app with multiplayer features, story mode,
> and integration with JLPT study materials.

---

*Last updated: 2024-12-19*
