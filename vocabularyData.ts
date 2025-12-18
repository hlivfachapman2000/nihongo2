/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WordData, WordCategory } from './types';

// Comprehensive Japanese vocabulary database organized by category
export const VOCABULARY_DATABASE: WordData[] = [
  // ========== ANIMALS (動物) ==========
  { id: 'a1', en: 'Cat', jp: '猫', hiragana: 'ねこ', romaji: 'neko', category: 'animals', difficulty: 1, mastery: 0 },
  { id: 'a2', en: 'Dog', jp: '犬', hiragana: 'いぬ', romaji: 'inu', category: 'animals', difficulty: 1, mastery: 0 },
  { id: 'a3', en: 'Bird', jp: '鳥', hiragana: 'とり', romaji: 'tori', category: 'animals', difficulty: 1, mastery: 0 },
  { id: 'a4', en: 'Fish', jp: '魚', hiragana: 'さかな', romaji: 'sakana', category: 'animals', difficulty: 1, mastery: 0 },
  { id: 'a5', en: 'Rabbit', jp: '兎', hiragana: 'うさぎ', romaji: 'usagi', category: 'animals', difficulty: 2, mastery: 0 },
  { id: 'a6', en: 'Horse', jp: '馬', hiragana: 'うま', romaji: 'uma', category: 'animals', difficulty: 1, mastery: 0 },
  { id: 'a7', en: 'Cow', jp: '牛', hiragana: 'うし', romaji: 'ushi', category: 'animals', difficulty: 1, mastery: 0 },
  { id: 'a8', en: 'Pig', jp: '豚', hiragana: 'ぶた', romaji: 'buta', category: 'animals', difficulty: 2, mastery: 0 },
  { id: 'a9', en: 'Monkey', jp: '猿', hiragana: 'さる', romaji: 'saru', category: 'animals', difficulty: 2, mastery: 0 },
  { id: 'a10', en: 'Bear', jp: '熊', hiragana: 'くま', romaji: 'kuma', category: 'animals', difficulty: 2, mastery: 0 },
  { id: 'a11', en: 'Tiger', jp: '虎', hiragana: 'とら', romaji: 'tora', category: 'animals', difficulty: 2, mastery: 0 },
  { id: 'a12', en: 'Elephant', jp: '象', hiragana: 'ぞう', romaji: 'zou', category: 'animals', difficulty: 2, mastery: 0 },
  { id: 'a13', en: 'Mouse', jp: '鼠', hiragana: 'ねずみ', romaji: 'nezumi', category: 'animals', difficulty: 2, mastery: 0 },
  { id: 'a14', en: 'Frog', jp: '蛙', hiragana: 'かえる', romaji: 'kaeru', category: 'animals', difficulty: 2, mastery: 0 },
  { id: 'a15', en: 'Snake', jp: '蛇', hiragana: 'へび', romaji: 'hebi', category: 'animals', difficulty: 2, mastery: 0 },

  // ========== FOOD (食べ物) ==========
  { id: 'f1', en: 'Rice', jp: '米', hiragana: 'こめ', romaji: 'kome', category: 'food', difficulty: 1, mastery: 0 },
  { id: 'f2', en: 'Water', jp: '水', hiragana: 'みず', romaji: 'mizu', category: 'food', difficulty: 1, mastery: 0 },
  { id: 'f3', en: 'Tea', jp: 'お茶', hiragana: 'おちゃ', romaji: 'ocha', category: 'food', difficulty: 1, mastery: 0 },
  { id: 'f4', en: 'Meat', jp: '肉', hiragana: 'にく', romaji: 'niku', category: 'food', difficulty: 1, mastery: 0 },
  { id: 'f5', en: 'Egg', jp: '卵', hiragana: 'たまご', romaji: 'tamago', category: 'food', difficulty: 2, mastery: 0 },
  { id: 'f6', en: 'Bread', jp: 'パン', hiragana: 'パン', romaji: 'pan', category: 'food', difficulty: 1, mastery: 0 },
  { id: 'f7', en: 'Apple', jp: '林檎', hiragana: 'りんご', romaji: 'ringo', category: 'food', difficulty: 2, mastery: 0 },
  { id: 'f8', en: 'Orange', jp: 'オレンジ', hiragana: 'オレンジ', romaji: 'orenji', category: 'food', difficulty: 1, mastery: 0 },
  { id: 'f9', en: 'Banana', jp: 'バナナ', hiragana: 'バナナ', romaji: 'banana', category: 'food', difficulty: 1, mastery: 0 },
  { id: 'f10', en: 'Sushi', jp: '寿司', hiragana: 'すし', romaji: 'sushi', category: 'food', difficulty: 2, mastery: 0 },
  { id: 'f11', en: 'Ramen', jp: 'ラーメン', hiragana: 'ラーメン', romaji: 'raamen', category: 'food', difficulty: 1, mastery: 0 },
  { id: 'f12', en: 'Milk', jp: '牛乳', hiragana: 'ぎゅうにゅう', romaji: 'gyuunyuu', category: 'food', difficulty: 3, mastery: 0 },
  { id: 'f13', en: 'Vegetable', jp: '野菜', hiragana: 'やさい', romaji: 'yasai', category: 'food', difficulty: 2, mastery: 0 },
  { id: 'f14', en: 'Fruit', jp: '果物', hiragana: 'くだもの', romaji: 'kudamono', category: 'food', difficulty: 2, mastery: 0 },
  { id: 'f15', en: 'Cake', jp: 'ケーキ', hiragana: 'ケーキ', romaji: 'keeki', category: 'food', difficulty: 1, mastery: 0 },

  // ========== COLORS (色) ==========
  { id: 'c1', en: 'Red', jp: '赤', hiragana: 'あか', romaji: 'aka', category: 'colors', difficulty: 1, mastery: 0 },
  { id: 'c2', en: 'Blue', jp: '青', hiragana: 'あお', romaji: 'ao', category: 'colors', difficulty: 1, mastery: 0 },
  { id: 'c3', en: 'Green', jp: '緑', hiragana: 'みどり', romaji: 'midori', category: 'colors', difficulty: 1, mastery: 0 },
  { id: 'c4', en: 'Yellow', jp: '黄色', hiragana: 'きいろ', romaji: 'kiiro', category: 'colors', difficulty: 2, mastery: 0 },
  { id: 'c5', en: 'White', jp: '白', hiragana: 'しろ', romaji: 'shiro', category: 'colors', difficulty: 1, mastery: 0 },
  { id: 'c6', en: 'Black', jp: '黒', hiragana: 'くろ', romaji: 'kuro', category: 'colors', difficulty: 1, mastery: 0 },
  { id: 'c7', en: 'Orange', jp: 'オレンジ', hiragana: 'オレンジ', romaji: 'orenji', category: 'colors', difficulty: 1, mastery: 0 },
  { id: 'c8', en: 'Pink', jp: 'ピンク', hiragana: 'ピンク', romaji: 'pinku', category: 'colors', difficulty: 1, mastery: 0 },
  { id: 'c9', en: 'Purple', jp: '紫', hiragana: 'むらさき', romaji: 'murasaki', category: 'colors', difficulty: 2, mastery: 0 },
  { id: 'c10', en: 'Brown', jp: '茶色', hiragana: 'ちゃいろ', romaji: 'chairo', category: 'colors', difficulty: 2, mastery: 0 },
  { id: 'c11', en: 'Gray', jp: '灰色', hiragana: 'はいいろ', romaji: 'haiiro', category: 'colors', difficulty: 2, mastery: 0 },
  { id: 'c12', en: 'Gold', jp: '金色', hiragana: 'きんいろ', romaji: 'kiniro', category: 'colors', difficulty: 2, mastery: 0 },

  // ========== NUMBERS (数字) ==========
  { id: 'n1', en: 'One', jp: '一', hiragana: 'いち', romaji: 'ichi', category: 'numbers', difficulty: 1, mastery: 0 },
  { id: 'n2', en: 'Two', jp: '二', hiragana: 'に', romaji: 'ni', category: 'numbers', difficulty: 1, mastery: 0 },
  { id: 'n3', en: 'Three', jp: '三', hiragana: 'さん', romaji: 'san', category: 'numbers', difficulty: 1, mastery: 0 },
  { id: 'n4', en: 'Four', jp: '四', hiragana: 'よん', romaji: 'yon', category: 'numbers', difficulty: 1, mastery: 0 },
  { id: 'n5', en: 'Five', jp: '五', hiragana: 'ご', romaji: 'go', category: 'numbers', difficulty: 1, mastery: 0 },
  { id: 'n6', en: 'Six', jp: '六', hiragana: 'ろく', romaji: 'roku', category: 'numbers', difficulty: 1, mastery: 0 },
  { id: 'n7', en: 'Seven', jp: '七', hiragana: 'なな', romaji: 'nana', category: 'numbers', difficulty: 1, mastery: 0 },
  { id: 'n8', en: 'Eight', jp: '八', hiragana: 'はち', romaji: 'hachi', category: 'numbers', difficulty: 1, mastery: 0 },
  { id: 'n9', en: 'Nine', jp: '九', hiragana: 'きゅう', romaji: 'kyuu', category: 'numbers', difficulty: 1, mastery: 0 },
  { id: 'n10', en: 'Ten', jp: '十', hiragana: 'じゅう', romaji: 'juu', category: 'numbers', difficulty: 1, mastery: 0 },
  { id: 'n11', en: 'Hundred', jp: '百', hiragana: 'ひゃく', romaji: 'hyaku', category: 'numbers', difficulty: 2, mastery: 0 },
  { id: 'n12', en: 'Thousand', jp: '千', hiragana: 'せん', romaji: 'sen', category: 'numbers', difficulty: 2, mastery: 0 },

  // ========== NATURE (自然) ==========
  { id: 'na1', en: 'Sun', jp: '太陽', hiragana: 'たいよう', romaji: 'taiyou', category: 'nature', difficulty: 2, mastery: 0 },
  { id: 'na2', en: 'Moon', jp: '月', hiragana: 'つき', romaji: 'tsuki', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na3', en: 'Star', jp: '星', hiragana: 'ほし', romaji: 'hoshi', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na4', en: 'Mountain', jp: '山', hiragana: 'やま', romaji: 'yama', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na5', en: 'River', jp: '川', hiragana: 'かわ', romaji: 'kawa', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na6', en: 'Ocean', jp: '海', hiragana: 'うみ', romaji: 'umi', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na7', en: 'Tree', jp: '木', hiragana: 'き', romaji: 'ki', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na8', en: 'Flower', jp: '花', hiragana: 'はな', romaji: 'hana', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na9', en: 'Fire', jp: '火', hiragana: 'ひ', romaji: 'hi', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na10', en: 'Rain', jp: '雨', hiragana: 'あめ', romaji: 'ame', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na11', en: 'Snow', jp: '雪', hiragana: 'ゆき', romaji: 'yuki', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na12', en: 'Wind', jp: '風', hiragana: 'かぜ', romaji: 'kaze', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na13', en: 'Sky', jp: '空', hiragana: 'そら', romaji: 'sora', category: 'nature', difficulty: 1, mastery: 0 },
  { id: 'na14', en: 'Earth', jp: '地球', hiragana: 'ちきゅう', romaji: 'chikyuu', category: 'nature', difficulty: 3, mastery: 0 },
  { id: 'na15', en: 'Forest', jp: '森', hiragana: 'もり', romaji: 'mori', category: 'nature', difficulty: 2, mastery: 0 },

  // ========== BODY (体) ==========
  { id: 'b1', en: 'Head', jp: '頭', hiragana: 'あたま', romaji: 'atama', category: 'body', difficulty: 2, mastery: 0 },
  { id: 'b2', en: 'Eye', jp: '目', hiragana: 'め', romaji: 'me', category: 'body', difficulty: 1, mastery: 0 },
  { id: 'b3', en: 'Ear', jp: '耳', hiragana: 'みみ', romaji: 'mimi', category: 'body', difficulty: 1, mastery: 0 },
  { id: 'b4', en: 'Nose', jp: '鼻', hiragana: 'はな', romaji: 'hana', category: 'body', difficulty: 2, mastery: 0 },
  { id: 'b5', en: 'Mouth', jp: '口', hiragana: 'くち', romaji: 'kuchi', category: 'body', difficulty: 1, mastery: 0 },
  { id: 'b6', en: 'Hand', jp: '手', hiragana: 'て', romaji: 'te', category: 'body', difficulty: 1, mastery: 0 },
  { id: 'b7', en: 'Foot', jp: '足', hiragana: 'あし', romaji: 'ashi', category: 'body', difficulty: 1, mastery: 0 },
  { id: 'b8', en: 'Heart', jp: '心', hiragana: 'こころ', romaji: 'kokoro', category: 'body', difficulty: 2, mastery: 0 },
  { id: 'b9', en: 'Face', jp: '顔', hiragana: 'かお', romaji: 'kao', category: 'body', difficulty: 2, mastery: 0 },
  { id: 'b10', en: 'Finger', jp: '指', hiragana: 'ゆび', romaji: 'yubi', category: 'body', difficulty: 2, mastery: 0 },

  // ========== GREETINGS (挨拶) ==========
  { id: 'g1', en: 'Hello', jp: 'こんにちは', hiragana: 'こんにちは', romaji: 'konnichiwa', category: 'greetings', difficulty: 1, mastery: 0 },
  { id: 'g2', en: 'Good morning', jp: 'おはよう', hiragana: 'おはよう', romaji: 'ohayou', category: 'greetings', difficulty: 1, mastery: 0 },
  { id: 'g3', en: 'Good evening', jp: 'こんばんは', hiragana: 'こんばんは', romaji: 'konbanwa', category: 'greetings', difficulty: 2, mastery: 0 },
  { id: 'g4', en: 'Goodbye', jp: 'さようなら', hiragana: 'さようなら', romaji: 'sayounara', category: 'greetings', difficulty: 2, mastery: 0 },
  { id: 'g5', en: 'Thank you', jp: 'ありがとう', hiragana: 'ありがとう', romaji: 'arigatou', category: 'greetings', difficulty: 1, mastery: 0 },
  { id: 'g6', en: 'Sorry', jp: 'ごめんなさい', hiragana: 'ごめんなさい', romaji: 'gomen nasai', category: 'greetings', difficulty: 2, mastery: 0 },
  { id: 'g7', en: 'Please', jp: 'お願いします', hiragana: 'おねがいします', romaji: 'onegaishimasu', category: 'greetings', difficulty: 3, mastery: 0 },
  { id: 'g8', en: 'Yes', jp: 'はい', hiragana: 'はい', romaji: 'hai', category: 'greetings', difficulty: 1, mastery: 0 },
  { id: 'g9', en: 'No', jp: 'いいえ', hiragana: 'いいえ', romaji: 'iie', category: 'greetings', difficulty: 1, mastery: 0 },
  { id: 'g10', en: 'Nice to meet you', jp: 'はじめまして', hiragana: 'はじめまして', romaji: 'hajimemashite', category: 'greetings', difficulty: 2, mastery: 0 },

  // ========== PEOPLE & FAMILY (人・家族) ==========
  { id: 'p1', en: 'Person', jp: '人', hiragana: 'ひと', romaji: 'hito', category: 'people', difficulty: 1, mastery: 0 },
  { id: 'p2', en: 'Friend', jp: '友達', hiragana: 'ともだち', romaji: 'tomodachi', category: 'people', difficulty: 2, mastery: 0 },
  { id: 'p3', en: 'Mother', jp: 'お母さん', hiragana: 'おかあさん', romaji: 'okaasan', category: 'people', difficulty: 2, mastery: 0 },
  { id: 'p4', en: 'Father', jp: 'お父さん', hiragana: 'おとうさん', romaji: 'otousan', category: 'people', difficulty: 2, mastery: 0 },
  { id: 'p5', en: 'Child', jp: '子供', hiragana: 'こども', romaji: 'kodomo', category: 'people', difficulty: 2, mastery: 0 },
  { id: 'p6', en: 'Teacher', jp: '先生', hiragana: 'せんせい', romaji: 'sensei', category: 'people', difficulty: 2, mastery: 0 },
  { id: 'p7', en: 'Student', jp: '学生', hiragana: 'がくせい', romaji: 'gakusei', category: 'people', difficulty: 2, mastery: 0 },
  { id: 'p8', en: 'Boy', jp: '男の子', hiragana: 'おとこのこ', romaji: 'otokonoko', category: 'people', difficulty: 2, mastery: 0 },
  { id: 'p9', en: 'Girl', jp: '女の子', hiragana: 'おんなのこ', romaji: 'onnanoko', category: 'people', difficulty: 2, mastery: 0 },
  { id: 'p10', en: 'Family', jp: '家族', hiragana: 'かぞく', romaji: 'kazoku', category: 'people', difficulty: 2, mastery: 0 },

  // ========== OBJECTS (物) ==========
  { id: 'o1', en: 'Book', jp: '本', hiragana: 'ほん', romaji: 'hon', category: 'objects', difficulty: 1, mastery: 0 },
  { id: 'o2', en: 'Car', jp: '車', hiragana: 'くるま', romaji: 'kuruma', category: 'objects', difficulty: 2, mastery: 0 },
  { id: 'o3', en: 'House', jp: '家', hiragana: 'いえ', romaji: 'ie', category: 'objects', difficulty: 1, mastery: 0 },
  { id: 'o4', en: 'Door', jp: 'ドア', hiragana: 'ドア', romaji: 'doa', category: 'objects', difficulty: 1, mastery: 0 },
  { id: 'o5', en: 'Window', jp: '窓', hiragana: 'まど', romaji: 'mado', category: 'objects', difficulty: 2, mastery: 0 },
  { id: 'o6', en: 'Table', jp: 'テーブル', hiragana: 'テーブル', romaji: 'teeburu', category: 'objects', difficulty: 1, mastery: 0 },
  { id: 'o7', en: 'Chair', jp: '椅子', hiragana: 'いす', romaji: 'isu', category: 'objects', difficulty: 2, mastery: 0 },
  { id: 'o8', en: 'Phone', jp: '電話', hiragana: 'でんわ', romaji: 'denwa', category: 'objects', difficulty: 2, mastery: 0 },
  { id: 'o9', en: 'Computer', jp: 'パソコン', hiragana: 'パソコン', romaji: 'pasokon', category: 'objects', difficulty: 1, mastery: 0 },
  { id: 'o10', en: 'Clock', jp: '時計', hiragana: 'とけい', romaji: 'tokei', category: 'objects', difficulty: 2, mastery: 0 },

  // ========== VERBS (動詞) ==========
  { id: 'v1', en: 'To eat', jp: '食べる', hiragana: 'たべる', romaji: 'taberu', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v2', en: 'To drink', jp: '飲む', hiragana: 'のむ', romaji: 'nomu', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v3', en: 'To go', jp: '行く', hiragana: 'いく', romaji: 'iku', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v4', en: 'To come', jp: '来る', hiragana: 'くる', romaji: 'kuru', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v5', en: 'To see', jp: '見る', hiragana: 'みる', romaji: 'miru', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v6', en: 'To hear', jp: '聞く', hiragana: 'きく', romaji: 'kiku', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v7', en: 'To speak', jp: '話す', hiragana: 'はなす', romaji: 'hanasu', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v8', en: 'To read', jp: '読む', hiragana: 'よむ', romaji: 'yomu', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v9', en: 'To write', jp: '書く', hiragana: 'かく', romaji: 'kaku', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v10', en: 'To run', jp: '走る', hiragana: 'はしる', romaji: 'hashiru', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v11', en: 'To sleep', jp: '寝る', hiragana: 'ねる', romaji: 'neru', category: 'verbs', difficulty: 2, mastery: 0 },
  { id: 'v12', en: 'To play', jp: '遊ぶ', hiragana: 'あそぶ', romaji: 'asobu', category: 'verbs', difficulty: 2, mastery: 0 },
];

// Category metadata for UI
export const CATEGORY_INFO: Record<WordCategory, { name: string; nameJp: string; icon: string; color: string }> = {
  animals: { name: 'Animals', nameJp: '動物', icon: '🐱', color: '#ff6b6b' },
  food: { name: 'Food', nameJp: '食べ物', icon: '🍣', color: '#ffa94d' },
  colors: { name: 'Colors', nameJp: '色', icon: '🎨', color: '#9775fa' },
  numbers: { name: 'Numbers', nameJp: '数字', icon: '🔢', color: '#4dabf7' },
  nature: { name: 'Nature', nameJp: '自然', icon: '🌸', color: '#69db7c' },
  body: { name: 'Body', nameJp: '体', icon: '👋', color: '#f783ac' },
  greetings: { name: 'Greetings', nameJp: '挨拶', icon: '👋', color: '#ffd43b' },
  people: { name: 'People', nameJp: '人', icon: '👨‍👩‍👧', color: '#a9e34b' },
  objects: { name: 'Objects', nameJp: '物', icon: '📦', color: '#74c0fc' },
  verbs: { name: 'Verbs', nameJp: '動詞', icon: '🏃', color: '#e599f7' },
};

// Helper function to get words by category
export const getWordsByCategory = (category: WordCategory): WordData[] => {
  return VOCABULARY_DATABASE.filter(w => w.category === category);
};

// Helper function to get words by difficulty
export const getWordsByDifficulty = (difficulty: 1 | 2 | 3): WordData[] => {
  return VOCABULARY_DATABASE.filter(w => w.difficulty <= difficulty);
};

// Helper to get random words from selected categories
export const getRandomWords = (categories: WordCategory[], count: number, maxDifficulty: number = 3): WordData[] => {
  const pool = VOCABULARY_DATABASE.filter(w =>
    categories.includes(w.category) && w.difficulty <= maxDifficulty
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
