/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_AUDIO_SETTINGS, type AudioSettingsState, type VoiceSpeedOption, type VoiceStyleOption } from '../../audioConfig';
import { useStore } from '../../store';

// Audio cache for TTS responses
const ttsCache = new Map<string, AudioBuffer>();

const CACHE_LIMIT = 500;

const STYLE_WRAPPERS: Record<VoiceStyleOption, (text: string) => string> = {
  Cheerful: (text) => `Say cheerfully: ${text}`,
  Calm: (text) => `Say calmly and clearly: ${text}`,
  Excited: (text) => `Say with excitement: ${text}`,
  Professional: (text) => `Say professionally: ${text}`,
  Friendly: (text) => `Say in a friendly tone: ${text}`,
};

const SPEED_WRAPPERS: Record<VoiceSpeedOption, (text: string) => string> = {
  slow: (text) => `Speak slowly: ${text}`,
  normal: (text) => text,
  fast: (text) => `Speak quickly: ${text}`,
};

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
  async speak(
    text: string,
    lang: 'en' | 'ja' = 'en',
    overrides?: Partial<AudioSettingsState>
  ): Promise<void> {
    if (!this.ttsEnabled || !text) return;

    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const settings = this.resolveSettings(overrides);
    const cacheKey = this.getCacheKey(text, lang, settings);

    try {
      let buffer = ttsCache.get(cacheKey);

      if (!buffer) {
        buffer = await this.fetchAndCache(text, lang, settings);
      }

      if (buffer) {
        this.playBuffer(buffer);
      } else {
        console.warn('[TTS] No audio content received for playback');
      }
    } catch (error) {
      console.error('[TTS] Error during speak:', error);
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
  async preloadWords(
    words: Array<{ id: string; jp: string; en: string; hiragana: string }>,
    overrides?: Partial<AudioSettingsState>
  ): Promise<void> {
    if (!this.ttsEnabled || words.length === 0) return;

    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx) return;

    const settings = this.resolveSettings(overrides);

    console.log(`[TTS] Preloading ${words.length} words with voice ${settings.voice}...`);

    const entries: Array<{ text: string; lang: 'en' | 'ja' }> = [];
    const seen = new Set<string>();

    for (const word of words) {
      const jpKey = this.getCacheKey(word.jp, 'ja', settings);
      if (!seen.has(jpKey)) {
        entries.push({ text: word.jp, lang: 'ja' });
        seen.add(jpKey);
      }

      const enKey = this.getCacheKey(word.en, 'en', settings);
      if (!seen.has(enKey)) {
        entries.push({ text: word.en, lang: 'en' });
        seen.add(enKey);
      }
    }

    // Rate limit: API allows ~10 requests per minute
    // Use smaller batches with delays to avoid 429 errors
    const batchSize = 2;
    const delayBetweenBatches = 1500; // 1.5 seconds between batches
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize).map((entry) =>
        this.fetchAndCache(entry.text, entry.lang, settings)
      );
      await Promise.all(batch);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < entries.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    console.log('[TTS] Preloading complete.');
  }

  /**
   * Internal helper to fetch and cache audio without playing it
   */
  private async fetchAndCache(
    text: string,
    lang: 'en' | 'ja',
    settings: AudioSettingsState
  ): Promise<AudioBuffer | null> {
    const cacheKey = this.getCacheKey(text, lang, settings);
    if (ttsCache.has(cacheKey)) {
      return ttsCache.get(cacheKey)!;
    }

    try {
      const prompt = this.buildPrompt(text, settings);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: prompt,
          lang,
          voice: settings.voice,
          style: settings.style,
          speed: settings.speed,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[TTS] API error:', errorData);
        
        // Don't block the game for rate limit errors (429) - just skip this audio
        // The game can continue without TTS for this word
        if (response.status === 429) {
          console.warn('[TTS] Rate limited - continuing without audio for:', text);
          return null;
        }
        
        // For other errors, also don't block - just log and continue
        console.warn('[TTS] Continuing without audio due to error:', response.status);
        return null;
      }

      const data = await response.json();
      const buffer = await this.decodeToBuffer(data.audioContent);

      if (buffer) {
        this.cacheBuffer(cacheKey, buffer);
      }

      return buffer ?? null;
    } catch (error) {
      console.warn(`[TTS] Failed to preload: ${text}`, error);
      return null;
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

  private cacheBuffer(cacheKey: string, buffer: AudioBuffer): void {
    if (ttsCache.size >= CACHE_LIMIT) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) {
        ttsCache.delete(firstKey);
      }
    }
    ttsCache.set(cacheKey, buffer);
  }

  private async decodeToBuffer(audioContent: string | undefined): Promise<AudioBuffer | null> {
    if (!audioContent) {
      return null;
    }

    if (!this.ctx) {
      this.init();
    }

    if (!this.ctx) {
      return null;
    }

    const binaryString = atob(audioContent);
    const pcmBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      pcmBytes[i] = binaryString.charCodeAt(i);
    }

    const sampleRate = 24000;
    const numChannels = 1;
    const bytesPerSample = 2;
    const numSamples = pcmBytes.length / bytesPerSample;

    const audioBuffer = this.ctx.createBuffer(numChannels, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    const dataView = new DataView(pcmBytes.buffer);

    for (let i = 0; i < numSamples; i++) {
      const sample = dataView.getInt16(i * bytesPerSample, true);
      channelData[i] = sample / 32768.0;
    }

    return audioBuffer;
  }

  private buildPrompt(text: string, settings: AudioSettingsState): string {
    const styleWrapper = STYLE_WRAPPERS[settings.style] ?? ((value: string) => value);
    const speedWrapper = SPEED_WRAPPERS[settings.speed] ?? ((value: string) => value);

    const styled = styleWrapper(text);
    return speedWrapper(styled);
  }

  private getCacheKey(
    text: string,
    lang: 'en' | 'ja',
    settings: AudioSettingsState
  ): string {
    return `${lang}:${settings.voice}:${settings.style}:${settings.speed}:${text}`;
  }

  private resolveSettings(
    overrides?: Partial<AudioSettingsState>
  ): AudioSettingsState {
    const storeSettings = useStore.getState().audioSettings ?? DEFAULT_AUDIO_SETTINGS;

    return {
      voice: overrides?.voice ?? storeSettings.voice ?? DEFAULT_AUDIO_SETTINGS.voice,
      style: (overrides?.style ?? storeSettings.style ?? DEFAULT_AUDIO_SETTINGS.style) as VoiceStyleOption,
      speed: (overrides?.speed ?? storeSettings.speed ?? DEFAULT_AUDIO_SETTINGS.speed) as VoiceSpeedOption,
    };
  }
}

export const audio = new AudioController();
