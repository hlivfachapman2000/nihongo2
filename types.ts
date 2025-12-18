
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
  WORD_ORB = 'WORD_ORB', // Replaces LETTER
  SHOP_PORTAL = 'SHOP_PORTAL',
  ALIEN = 'ALIEN',
  MISSILE = 'MISSILE'
}

export interface WordData {
    id: string;
    en: string;
    jp: string; // Kanji or Kana
    romaji: string;
    mastery: number; // 0 to 3
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
  isMatch?: boolean; // If true, this is the match for what player is holding
  
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
    RED: '#ff0033', // Sun red
    WHITE: '#ffffff',
    BLACK: '#0a0a0a',
    GOLD: '#ffd700',
    CYAN: '#00ffff', // Cyber accent
    PINK: '#ff69b4'  // Sakura
};

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any; 
    oneTime?: boolean; 
}
