/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useStore } from '../../store';

// Audio cache for TTS responses
const ttsCache = new Map<string, AudioBuffer>();

export class AudioController {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  ttsEnabled: boolean = true;

  constructor() {}

  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.6;
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        console.error("Audio initialization failed", e);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  startMusic() {}
  stopMusic() {}

  /**
   * Speak text using Gemini 2.5 Flash native audio
   * No fallback to browser TTS to ensure quality
   */
  async speak(text: string, lang: 'en' | 'ja' = 'en'): Promise<void> {
    if (!this.ttsEnabled || !text) return;

    if (!this.ctx || !this.masterGain) this.init();

    const cacheKey = `${lang}:${text}`;

    try {
      // Check local cache first
      if (ttsCache.has(cacheKey) && this.ctx && this.masterGain) {
        this.playBuffer(ttsCache.get(cacheKey)!);
        return;
      }

      // Try Gemini TTS API
      console.log('[TTS] Requesting audio for:', text, lang);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[TTS] API error:', errorData);
        useStore.getState().setAudioError(`TTS Error: ${errorData.error?.message || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      console.log('[TTS] Got response, audioContent length:', data.audioContent?.length, 'mimeType:', data.mimeType);

      if (data.audioContent) {
        const mimeType = data.mimeType || 'audio/mp3';

        // Use HTML Audio element for better format compatibility
        const audioDataUrl = `data:${mimeType};base64,${data.audioContent}`;
        const audioElement = new Audio(audioDataUrl);
        audioElement.volume = 0.8;

        // Also decode and cache for future use if possible
        if (this.ctx) {
           try {
             const binaryString = atob(data.audioContent);
             const bytes = new Uint8Array(binaryString.length);
             for (let i = 0; i < binaryString.length; i++) {
               bytes[i] = binaryString.charCodeAt(i);
             }
             const audioBuffer = await this.ctx.decodeAudioData(bytes.buffer);
             if (ttsCache.size < 500) {
               ttsCache.set(cacheKey, audioBuffer);
             }
           } catch (e) {
             console.warn('[TTS] Failed to cache audio buffer', e);
           }
        }

        audioElement.play().catch(err => {
          console.error('[TTS] Audio playback failed:', err);
        });

        console.log('[TTS] Playing Gemini audio');
        return;
      }

      console.warn('[TTS] No audio content received');

    } catch (error) {
      console.error('[TTS] Error:', error);
    }
  }

  private playBuffer(buffer: AudioBuffer): void {
    if (!this.ctx || !this.masterGain) return;

    const source = this.ctx.createBufferSource();
    const gainNode = this.ctx.createGain();

    source.buffer = buffer;
    gainNode.gain.value = 0.8;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start(0);
  }

  /**
   * Preload audio for a list of words to avoid latency during gameplay
   */
  async preloadWords(words: Array<{ id: string; jp: string; en: string; hiragana: string }>): Promise<void> {
    if (!this.ttsEnabled) return;

    console.log(`[TTS] Preloading ${words.length} words...`);

    // Process in small batches to avoid overwhelming the API/browser
    const batchSize = 3;
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      await Promise.all(batch.flatMap(w => [
        this.fetchAndCache(w.jp, 'ja'),
        this.fetchAndCache(w.en, 'en')
      ]));
      // Small delay between batches
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`[TTS] Preloading complete.`);
  }

  /**
   * Internal helper to fetch and cache audio without playing it
   */
  private async fetchAndCache(text: string, lang: 'en' | 'ja'): Promise<void> {
    const cacheKey = `${lang}:${text}`;
    if (ttsCache.has(cacheKey)) return;

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioContent && this.ctx) {
          const binaryString = atob(data.audioContent);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const audioBuffer = await this.ctx.decodeAudioData(bytes.buffer);
          if (ttsCache.size < 500) {
            ttsCache.set(cacheKey, audioBuffer);
          }
        }
      }
    } catch (e) {
      console.warn(`[TTS] Failed to preload: ${text}`, e);
    }
  }

  playGemCollect() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playCorrectMatch() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 1046.50].forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        const start = t + (i * 0.05);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(start);
        osc.stop(start + 0.2);
    });
  }

  playWrongMatch() {
     if (!this.ctx || !this.masterGain) this.init();
     if (!this.ctx || !this.masterGain) return;
     const t = this.ctx.currentTime;
     const osc = this.ctx.createOscillator();
     const gain = this.ctx.createGain();
     osc.type = 'triangle';
     osc.frequency.setValueAtTime(150, t);
     osc.frequency.linearRampToValueAtTime(60, t + 0.2);
     gain.gain.setValueAtTime(0.3, t);
     gain.gain.linearRampToValueAtTime(0.01, t + 0.2);
     osc.connect(gain);
     gain.connect(this.masterGain);
     osc.start(t);
     osc.stop(t + 0.2);
  }

  playJump(isDouble = false) {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isDouble ? 300 : 180, t);
    osc.frequency.linearRampToValueAtTime(isDouble ? 500 : 320, t + 0.08);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.08);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playDamage() {
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.linearRampToValueAtTime(40, t + 0.2);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }
}

export const audio = new AudioController();
