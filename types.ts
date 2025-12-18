
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  QUIZ = 'QUIZ',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE',
  GEM = 'GEM',
  WORD_ORB = 'WORD_ORB',
  SHOP_PORTAL = 'SHOP_PORTAL',
  ALIEN = 'ALIEN',
  MISSILE = 'MISSILE'
}

// Vocabulary Categories
export type WordCategory =
  | 'animals'
  | 'food'
  | 'colors'
  | 'numbers'
  | 'nature'
  | 'body'
  | 'greetings'
  | 'people'
  | 'objects'
  | 'verbs';

// Writing system display mode
export enum WritingMode {
  KANJI = 'KANJI',       // Show kanji (default)
  HIRAGANA = 'HIRAGANA', // Show hiragana only
  ROMAJI = 'ROMAJI'      // Show romaji (latin)
}

export interface WordData {
    id: string;
    en: string;
    jp: string;              // Kanji or Kana
    hiragana: string;        // Hiragana reading
    romaji: string;          // Romanized
    category: WordCategory;  // Word category
    difficulty: number;      // 1 = easy, 2 = medium, 3 = hard
    mastery: number;         // 0 to 3
}

// Achievement system
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;           // Emoji icon
    condition: string;      // Description of unlock condition
    unlocked: boolean;
    unlockedAt?: number;    // Timestamp when unlocked
}

// Player lifetime statistics
export interface PlayerStats {
    totalWordsLearned: number;
    totalMatches: number;
    totalCorrectQuizzes: number;
    highestCombo: number;
    highestStreak: number;
    totalPlayTime: number;
    gemsCollected: number;
    levelsCompleted: number;
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number]; // x, y, z
  active: boolean;

  // Specific to Word Orbs
  wordId?: string;
  text?: string;
  lang?: 'en' | 'jp';
  isMatch?: boolean;

  // Visuals
  color?: string;
  points?: number;
  hasFired?: boolean;
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const RUN_SPEED_BASE = 20.0;
export const SPAWN_DISTANCE = 120;
export const REMOVE_DISTANCE = 20;

// Japan-inspired Palette
export const NIHON_COLORS = {
    RED: '#ff0033',
    WHITE: '#ffffff',
    BLACK: '#0a0a0a',
    GOLD: '#ffd700',
    CYAN: '#00ffff',
    PINK: '#ff69b4',
    SAKURA: '#ffb7c5',
    INDIGO: '#4b0082'
};

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any;
    oneTime?: boolean;
}

// Default achievements
export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_match', name: 'First Steps', description: 'Complete your first word match', icon: '🌸', condition: 'Match 1 word pair', unlocked: false },
    { id: 'word_warrior', name: 'Word Warrior', description: 'Match 50 word pairs', icon: '⚔️', condition: 'Match 50 word pairs', unlocked: false },
    { id: 'perfect_streak', name: 'Perfect Streak', description: '10 matches without errors', icon: '🔥', condition: '10 match streak', unlocked: false },
    { id: 'quiz_master', name: 'Quiz Master', description: 'Pass 10 quizzes', icon: '🎓', condition: 'Pass 10 quizzes', unlocked: false },
    { id: 'speed_demon', name: 'Speed Demon', description: '5 matches in 30 seconds', icon: '⚡', condition: '5 fast matches', unlocked: false },
    { id: 'gem_collector', name: 'Gem Collector', description: 'Collect 500 gems total', icon: '💎', condition: 'Collect 500 gems', unlocked: false },
    { id: 'combo_king', name: 'Combo King', description: 'Reach a 5x combo', icon: '👑', condition: '5x combo', unlocked: false },
    { id: 'polyglot', name: 'Polyglot', description: 'Learn words from all categories', icon: '🌍', condition: 'All categories used', unlocked: false },
];
