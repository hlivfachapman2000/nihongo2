/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Motivation {
  jp: string;
  en: string;
}

export const MOTIVATION_PHRASES: Motivation[] = [
  { jp: 'すごい！', en: 'Amazing!' },
  { jp: 'やった！', en: 'You did it!' },
  { jp: 'いいね！', en: 'Nice!' },
  { jp: 'かっこいい！', en: 'Cool!' },
  { jp: '完璧！', en: 'Perfect!' },
  { jp: '上手！', en: 'Skillful!' },
  { jp: '最高！', en: 'The best!' },
  { jp: 'ナイス！', en: 'Nice one!' },
];

export const getRandomMotivation = (): Motivation => {
  if (MOTIVATION_PHRASES.length === 0) {
    return { jp: 'いいね！', en: 'Nice!' };
  }

  const index = Math.floor(Math.random() * MOTIVATION_PHRASES.length);
  return MOTIVATION_PHRASES[index];
};
