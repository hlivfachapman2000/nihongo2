/**
 * Nihongo Sprinter - Express Server
 * Serves static files and provides TTS API endpoint
 */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || '';

// In-memory audio cache
const audioCache = new Map();
const CACHE_MAX_SIZE = 500;

app.use(cors());
app.use(compression());
app.use(express.json());

// Serve static files
const distPath = join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// TTS API Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, lang = 'en' } = req.body;

    if (!text) return res.status(400).json({ error: 'Text required' });
    if (!TTS_API_KEY) return res.status(503).json({ error: 'TTS not configured' });

    const cacheKey = `${lang}:${text}`;
    if (audioCache.has(cacheKey)) {
      return res.json({ audioContent: audioCache.get(cacheKey) });
    }

    const voiceConfig = lang === 'ja' 
      ? { languageCode: 'ja-JP', name: 'ja-JP-Neural2-B', ssmlGender: 'FEMALE' }
      : { languageCode: 'en-US', name: 'en-US-Neural2-J', ssmlGender: 'MALE' };

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${TTS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: voiceConfig,
          audioConfig: { audioEncoding: 'MP3', speakingRate: lang === 'ja' ? 0.9 : 1.0 }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: 'TTS error', details: err });
    }

    const { audioContent } = await response.json();

    // Cache with size limit
    if (audioCache.size >= CACHE_MAX_SIZE) {
      audioCache.delete(audioCache.keys().next().value);
    }
    audioCache.set(cacheKey, audioContent);

    res.json({ audioContent });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  fs.existsSync(indexPath) 
    ? res.sendFile(indexPath) 
    : res.status(404).send('Run npm run build first');
});

app.listen(PORT, () => console.log(`🎮 Nihongo Sprinter running on port ${PORT}`));
