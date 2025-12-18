
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, WordData } from './types';
import { audio } from './components/System/Audio';

// Initial Vocabulary Set
const INITIAL_WORDS: WordData[] = [
    { id: '1', en: 'Cat', jp: '猫', romaji: 'Neko', mastery: 0 },
    { id: '2', en: 'Dog', jp: '犬', romaji: 'Inu', mastery: 0 },
    { id: '3', en: 'Water', jp: '水', romaji: 'Mizu', mastery: 0 },
    { id: '4', en: 'Mountain', jp: '山', romaji: 'Yama', mastery: 0 },
    { id: '5', en: 'Fire', jp: '火', romaji: 'Hi', mastery: 0 },
    { id: '6', en: 'Moon', jp: '月', romaji: 'Tsuki', mastery: 0 },
    { id: '7', en: 'Sun', jp: '日', romaji: 'Hi', mastery: 0 },
    { id: '8', en: 'Person', jp: '人', romaji: 'Hito', mastery: 0 },
    { id: '9', en: 'Book', jp: '本', romaji: 'Hon', mastery: 0 },
    { id: '10', en: 'Tree', jp: '木', romaji: 'Ki', mastery: 0 },
];

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
  activeWords: WordData[]; // Words currently in rotation for this level
  learnedWords: WordData[]; // Words fully mastered
  holdingWord: { id: string, text: string, lang: 'en'|'jp' } | null; // Half-pair collected
  matchesMade: number; // Progress to next level
  
  // Quiz State
  quizQuestion: WordData | null;
  quizOptions: string[];
  
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
}

const MATCHES_TO_ADVANCE = 5;

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
  
  quizQuestion: null,
  quizOptions: [],
  
  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,

  startGame: () => {
    // Pick first 5 words for level 1
    set({ 
        status: GameStatus.PLAYING, 
        score: 0, 
        lives: 3, 
        speed: RUN_SPEED_BASE,
        level: 1,
        laneCount: 3,
        activeWords: JSON.parse(JSON.stringify(INITIAL_WORDS.slice(0, 5))),
        learnedWords: [],
        holdingWord: null,
        matchesMade: 0,
        hasDoubleJump: false,
        hasImmortality: false
    });
  },

  restartGame: () => {
      get().startGame();
  },

  takeDamage: () => {
    const { lives, isImmortalityActive } = get();
    if (isImmortalityActive) return;

    if (lives > 1) {
      set({ lives: lives - 1, holdingWord: null }); // Lose held word on damage
      audio.playWrongMatch();
    } else {
      set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0 });
    }
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  
  collectGem: (value) => set((state) => ({ 
    score: state.score + value, 
    gemsCollected: state.gemsCollected + 1 
  })),

  collectWord: (id, text, lang) => {
      const { holdingWord, activeWords, matchesMade, level } = get();

      // Vocalize immediately
      // If we just picked up English 'Cat', speak 'Cat'
      // If we just picked up Japanese 'Neko', speak 'Neko'
      audio.speak(text, lang === 'jp' ? 'ja' : 'en');

      if (!holdingWord) {
          // First half of pair
          set({ holdingWord: { id, text, lang } });
      } else {
          // Attempting match
          if (holdingWord.id === id && holdingWord.lang !== lang) {
              // CORRECT MATCH
              audio.playCorrectMatch();
              const points = 200;
              
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
                  speed: get().speed + 1 // Mild speed increase per match
              });

              if (newMatches >= MATCHES_TO_ADVANCE) {
                  get().startQuiz();
              }

          } else {
              // WRONG MATCH
              audio.playWrongMatch();
              // Penalty? Lose the holding word
              set({ holdingWord: null });
              // Small score penalty
              set((state) => ({ score: Math.max(0, state.score - 50) }));
          }
      }
  },

  startQuiz: () => {
      const { activeWords, learnedWords } = get();
      // Combine learned and active for quiz pool
      const pool = [...activeWords, ...learnedWords];
      if (pool.length === 0) return; // Safety

      // Pick a random question
      const question = pool[Math.floor(Math.random() * pool.length)];
      
      // Generate options (1 correct, 2 wrong)
      const correct = question.jp;
      const wrongs = pool
        .filter(w => w.id !== question.id)
        .map(w => w.jp)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);
      
      // If not enough words for wrongs, fill with placeholders
      while(wrongs.length < 2) wrongs.push('?');

      const options = [correct, ...wrongs].sort(() => 0.5 - Math.random());

      set({
          status: GameStatus.QUIZ,
          quizQuestion: question,
          quizOptions: options,
          speed: 0 // Stop the world
      });
  },

  answerQuiz: (answer) => {
      const { quizQuestion, level, activeWords } = get();
      if (!quizQuestion) return false;

      if (answer === quizQuestion.jp) {
          // Correct!
          audio.playCorrectMatch();
          audio.speak(quizQuestion.jp, 'ja');
          
          // Move mastered words to learned pile if mastery > 2
          // Or just rotate in new words
          const nextLevel = level + 1;
          
          // Add new words from initial list based on level
          // e.g. level 2 adds words 5-10
          let nextActiveWords = [...activeWords];
          const newWords = INITIAL_WORDS.slice(activeWords.length, activeWords.length + 3);
          if (newWords.length > 0) {
              nextActiveWords = [...nextActiveWords, ...newWords];
          }

          set({
              status: GameStatus.PLAYING,
              level: nextLevel,
              activeWords: nextActiveWords,
              matchesMade: 0,
              speed: RUN_SPEED_BASE + (nextLevel * 2), // Speed boost on level up
              score: get().score + 500
          });
          return true;
      } else {
          audio.playWrongMatch();
          get().takeDamage();
          // Stay in quiz? Or force fail? Let's give another chance or just exit quiz if lives > 0
          if (get().lives > 0) {
               // Reshuffle options to prevent spam clicking same spot?
          }
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
}));
