/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
   * Speak text using Google Cloud TTS via backend API
   * Non-blocking async with caching
   */
  async speak(text: string, lang: 'en' | 'ja' = 'en'): Promise<void> {
    if (!this.ttsEnabled || !text) return;
    
    if (!this.ctx || !this.masterGain) this.init();
    if (!this.ctx || !this.masterGain) return;

    const cacheKey = `${lang}:${text}`;
    
    try {
      // Check local cache first
      if (ttsCache.has(cacheKey)) {
        this.playBuffer(ttsCache.get(cacheKey)!);
        return;
      }

      // Fetch from TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang })
      });

      if (!response.ok) return;

      const data = await response.json();
      if (!data.audioContent) return;

      // Decode base64 audio
      const audioData = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
      const audioBuffer = await this.ctx.decodeAudioData(audioData.buffer);

      // Cache decoded buffer
      if (ttsCache.size < 200) {
        ttsCache.set(cacheKey, audioBuffer);
      }

      this.playBuffer(audioBuffer);
      
    } catch (error) {
      console.debug('TTS unavailable:', error);
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

  async preloadVocabulary(words: Array<{ japanese: string; english: string }>): Promise<void> {
    if (!this.ttsEnabled) return;
    
    const batchSize = 5;
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);
      await Promise.all([
        ...batch.map(w => this.speak(w.japanese, 'ja').catch(() => {})),
        ...batch.map(w => this.speak(w.english, 'en').catch(() => {}))
      ]);
      await new Promise(r => setTimeout(r, 100));
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
