
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { audio } from './components/System/Audio';
import { ACHIEVEMENTS, Achievement, GameStatus, PlayerStats, RUN_SPEED_BASE, WordCategory, WordData, WritingMode } from './types';
import { getRandomWords } from './vocabularyData';

// Default categories for new players
const DEFAULT_CATEGORIES: WordCategory[] = ['animals', 'food', 'nature'];

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;

  // Vocabulary State
  activeWords: WordData[];
  learnedWords: WordData[];
  holdingWord: { id: string, text: string, lang: 'en'|'jp' } | null;
  matchesMade: number;

  // New: Category & Writing Mode
  selectedCategories: WordCategory[];
  writingMode: WritingMode;

  // New: Combo System
  combo: number;
  maxCombo: number;
  streak: number;           // Consecutive correct matches
  lastMatchTime: number;    // For speed bonus tracking

  // New: Achievement System
  achievements: Achievement[];
  newAchievement: Achievement | null;  // For popup display
  playerStats: PlayerStats;

  // New: Audio Loading State
  isAudioLoading: boolean;
  audioError: string | null;

  // Quiz State
  quizQuestion: WordData | null;
  quizOptions: string[];
  quizzesCompleted: number;

  // Inventory
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;

  // Actions
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;

  // Word Actions
  collectWord: (id: string, text: string, lang: 'en' | 'jp') => void;

  // Flow
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;

  // Shop/Abilities
  buyItem: (type: 'DOUBLE_JUMP' | 'MAX_LIFE' | 'HEAL' | 'IMMORTAL', cost: number) => boolean;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;

  // Quiz
  startQuiz: () => void;
  answerQuiz: (answer: string) => boolean;

  // New: Settings
  setWritingMode: (mode: WritingMode) => void;
  toggleCategory: (category: WordCategory) => void;
  setSelectedCategories: (categories: WordCategory[]) => void;

  // New: Achievement
  checkAchievements: () => void;
  clearNewAchievement: () => void;
  setAudioError: (error: string | null) => void;
}

const MATCHES_TO_ADVANCE = 5;
const COMBO_TIMEOUT = 4000; // ms to maintain combo

// Helper to get display text based on writing mode
export const getDisplayText = (word: WordData, mode: WritingMode): string => {
  switch (mode) {
    case WritingMode.HIRAGANA: return word.hiragana;
    case WritingMode.ROMAJI: return word.romaji;
    case WritingMode.KANJI:
    default: return word.jp;
  }
};

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  lives: 3,
  maxLives: 3,
  speed: 0,
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,

  activeWords: [],
  learnedWords: [],
  holdingWord: null,
  matchesMade: 0,

  // Category & Writing Mode
  selectedCategories: DEFAULT_CATEGORIES,
  writingMode: WritingMode.KANJI,

  // Combo System
  combo: 0,
  maxCombo: 0,
  streak: 0,
  lastMatchTime: 0,

  // Achievement System
  achievements: JSON.parse(JSON.stringify(ACHIEVEMENTS)),
  newAchievement: null,
  playerStats: {
    totalWordsLearned: 0,
    totalMatches: 0,
    totalCorrectQuizzes: 0,
    highestCombo: 0,
    highestStreak: 0,
    totalPlayTime: 0,
    gemsCollected: 0,
    levelsCompleted: 0,
  },

  isAudioLoading: false,
  audioError: null as string | null,

  quizQuestion: null,
  quizOptions: [],
  quizzesCompleted: 0,

  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,

  startGame: () => {
    const { selectedCategories, writingMode, achievements, playerStats } = get();

    // Get words from selected categories
    const startingWords = getRandomWords(selectedCategories, 5, 2); // 5 words, max difficulty 2

    // Preload audio for starting words
    set({ isAudioLoading: true });
    // audio.preloadWords(startingWords).finally(() => set({ isAudioLoading: false }));
    set({ isAudioLoading: false }); // Skip preloading for now as requested

    set({
        status: GameStatus.PLAYING,
        score: 0,
        lives: 3,
        speed: RUN_SPEED_BASE,
        level: 1,
        laneCount: 3,
        activeWords: JSON.parse(JSON.stringify(startingWords)),
        learnedWords: [],
        holdingWord: null,
        matchesMade: 0,
        combo: 0,
        streak: 0,
        lastMatchTime: Date.now(),
        hasDoubleJump: false,
        hasImmortality: false,
        newAchievement: null,
    });
  },

  restartGame: () => {
      get().startGame();
  },

  takeDamage: () => {
    const { lives, isImmortalityActive, combo } = get();
    if (isImmortalityActive) return;

    // Reset combo on damage
    set({ combo: 0, streak: 0 });

    if (lives > 1) {
      set({ lives: lives - 1, holdingWord: null });
      audio.playWrongMatch();
    } else {
      set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0 });
    }
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),

  collectGem: (value) => {
    const state = get();
    const newTotal = state.playerStats.gemsCollected + 1;

    set({
      score: state.score + value,
      gemsCollected: state.gemsCollected + 1,
      playerStats: { ...state.playerStats, gemsCollected: newTotal }
    });

    // Check gem achievement
    get().checkAchievements();
  },

  collectWord: (id, text, lang) => {
    const { holdingWord, activeWords, matchesMade, combo, streak, lastMatchTime, writingMode, playerStats } = get();

    // Vocalize immediately
    audio.speak(text, lang === 'jp' ? 'ja' : 'en');

    if (!holdingWord) {
        // First half of pair
        set({ holdingWord: { id, text, lang } });
    } else {
        // Attempting match
        if (holdingWord.id === id && holdingWord.lang !== lang) {
            // CORRECT MATCH! 🎉
            audio.playCorrectMatch();

            const now = Date.now();
            const timeSinceLast = now - lastMatchTime;

            // Calculate combo
            let newCombo = 1;
            if (timeSinceLast < COMBO_TIMEOUT) {
                newCombo = Math.min(combo + 1, 10); // Max 10x combo
            }

            // Combo multiplier for points
            const comboMultiplier = 1 + (newCombo - 1) * 0.25; // 1x, 1.25x, 1.5x, etc.
            const basePoints = 200;
            const points = Math.floor(basePoints * comboMultiplier);

            const newStreak = streak + 1;
            const newMaxCombo = Math.max(get().maxCombo, newCombo);

            // Increment mastery
            const newActiveWords = activeWords.map(w => {
                if (w.id === id) return { ...w, mastery: w.mastery + 1 };
                return w;
            });

            const newMatches = matchesMade + 1;

            set({
                holdingWord: null,
                score: get().score + points,
                activeWords: newActiveWords,
                matchesMade: newMatches,
                speed: get().speed + 0.5,
                combo: newCombo,
                maxCombo: newMaxCombo,
                streak: newStreak,
                lastMatchTime: now,
                playerStats: {
                    ...playerStats,
                    totalMatches: playerStats.totalMatches + 1,
                    highestCombo: Math.max(playerStats.highestCombo, newCombo),
                    highestStreak: Math.max(playerStats.highestStreak, newStreak),
                }
            });

            // Check achievements
            get().checkAchievements();

            if (newMatches >= MATCHES_TO_ADVANCE) {
                get().startQuiz();
            }

        } else {
            // WRONG MATCH
            audio.playWrongMatch();
            set({ holdingWord: null, combo: 0, streak: 0 });
            set((state) => ({ score: Math.max(0, state.score - 50) }));
        }
    }
  },

  startQuiz: () => {
      const { activeWords, learnedWords, writingMode } = get();
      const pool = [...activeWords, ...learnedWords];
      if (pool.length === 0) return;

      const question = pool[Math.floor(Math.random() * pool.length)];

      // Use the display text based on writing mode for options
      const correct = getDisplayText(question, writingMode);
      const wrongs = pool
        .filter(w => w.id !== question.id)
        .map(w => getDisplayText(w, writingMode))
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

      while(wrongs.length < 2) wrongs.push('?');

      const options = [correct, ...wrongs].sort(() => 0.5 - Math.random());

      set({
          status: GameStatus.QUIZ,
          quizQuestion: question,
          quizOptions: options,
          speed: 0
      });
  },

  answerQuiz: (answer) => {
      const { quizQuestion, level, activeWords, selectedCategories, writingMode, playerStats, quizzesCompleted } = get();
      if (!quizQuestion) return false;

      const correctAnswer = getDisplayText(quizQuestion, writingMode);

      if (answer === correctAnswer) {
          audio.playCorrectMatch();
          audio.speak(quizQuestion.jp, 'ja');

          const nextLevel = level + 1;
          const newQuizzesCompleted = quizzesCompleted + 1;

          // Add more words from vocabulary database
          let nextActiveWords = [...activeWords];
          const newWords = getRandomWords(
            selectedCategories,
            3,
            Math.min(3, Math.floor(nextLevel / 2) + 1) // Increase difficulty with level
          ).filter(w => !nextActiveWords.some(aw => aw.id === w.id)); // Avoid duplicates

          if (newWords.length > 0) {
              nextActiveWords = [...nextActiveWords, ...newWords];
          }

          set({
              status: GameStatus.PLAYING,
              level: nextLevel,
              activeWords: nextActiveWords,
              matchesMade: 0,
              speed: RUN_SPEED_BASE + (nextLevel * 2),
              score: get().score + 500,
              quizzesCompleted: newQuizzesCompleted,
              playerStats: {
                  ...playerStats,
                  totalCorrectQuizzes: playerStats.totalCorrectQuizzes + 1,
                  levelsCompleted: playerStats.levelsCompleted + 1,
              }
          });

          get().checkAchievements();
          return true;
      } else {
          audio.playWrongMatch();
          get().takeDamage();
          return false;
      }
  },

  setDistance: (dist) => set({ distance: dist }),

  openShop: () => set({ status: GameStatus.SHOP }),

  closeShop: () => set({ status: GameStatus.PLAYING }),

  buyItem: (type, cost) => {
      const { score, maxLives, lives } = get();

      if (score >= cost) {
          set({ score: score - cost });
          switch (type) {
              case 'DOUBLE_JUMP': set({ hasDoubleJump: true }); break;
              case 'MAX_LIFE': set({ maxLives: maxLives + 1, lives: lives + 1 }); break;
              case 'HEAL': set({ lives: Math.min(lives + 1, maxLives) }); break;
              case 'IMMORTAL': set({ hasImmortality: true }); break;
          }
          return true;
      }
      return false;
  },

  activateImmortality: () => {
      const { hasImmortality, isImmortalityActive } = get();
      if (hasImmortality && !isImmortalityActive) {
          set({ isImmortalityActive: true });
          setTimeout(() => set({ isImmortalityActive: false }), 5000);
      }
  },

  setStatus: (status) => set({ status }),

  // Settings
  setWritingMode: (mode) => set({ writingMode: mode }),

  toggleCategory: (category) => {
      const { selectedCategories } = get();
      let newCategories = [...selectedCategories];
      if (selectedCategories.includes(category)) {
          // Don't allow removing last category
          if (selectedCategories.length > 1) {
              newCategories = selectedCategories.filter(c => c !== category);
          }
      } else {
          newCategories = [...selectedCategories, category];
      }

      set({ selectedCategories: newCategories });

      // Preload some words from the new categories to be ready
      const wordsToPreload = getRandomWords(newCategories, 10, 3);
      // set({ isAudioLoading: true });
      // audio.preloadWords(wordsToPreload).finally(() => set({ isAudioLoading: false }));
  },

  setSelectedCategories: (categories) => {
      if (categories.length > 0) {
          set({ selectedCategories: categories });
      }
  },

  // Achievement System
  checkAchievements: () => {
      const { achievements, playerStats, streak, combo, selectedCategories, matchesMade, lastMatchTime, gemsCollected } = get();
      const updatedAchievements = [...achievements];
      let newUnlock: Achievement | null = null;

      // Check each achievement
      updatedAchievements.forEach((ach, i) => {
          if (ach.unlocked) return;

          let shouldUnlock = false;

          switch (ach.id) {
              case 'first_match':
                  shouldUnlock = playerStats.totalMatches >= 1;
                  break;
              case 'word_warrior':
                  shouldUnlock = playerStats.totalMatches >= 50;
                  break;
              case 'perfect_streak':
                  shouldUnlock = streak >= 10;
                  break;
              case 'quiz_master':
                  shouldUnlock = playerStats.totalCorrectQuizzes >= 10;
                  break;
              case 'speed_demon':
                  // 5 matches with combo (means within time limit)
                  shouldUnlock = combo >= 5;
                  break;
              case 'gem_collector':
                  shouldUnlock = playerStats.gemsCollected >= 500;
                  break;
              case 'combo_king':
                  shouldUnlock = combo >= 5;
                  break;
              case 'polyglot':
                  // Check if player has used all categories
                  shouldUnlock = selectedCategories.length >= 10;
                  break;
          }

          if (shouldUnlock) {
              updatedAchievements[i] = { ...ach, unlocked: true, unlockedAt: Date.now() };
              newUnlock = updatedAchievements[i];
          }
      });

      if (newUnlock) {
          set({ achievements: updatedAchievements, newAchievement: newUnlock });
          // Clear popup after 3 seconds
          setTimeout(() => {
              if (get().newAchievement?.id === newUnlock!.id) {
                  set({ newAchievement: null });
              }
          }, 3000);
      }
  },

  clearNewAchievement: () => set({ newAchievement: null }),
  setAudioError: (error: string | null) => set({ audioError: error }),
}));
