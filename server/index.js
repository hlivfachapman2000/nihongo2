/**
 * Nihongo Sprinter - Express Server
 * Serves static files and provides TTS API endpoint
 */

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_API_KEY || '';

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

// TTS API Endpoint - Using Gemini 2.5 Flash native audio
app.post('/api/tts', async (req, res) => {
  try {
    const { text, lang = 'en', systemInstruction, voice = 'Zephyr', model = 'gemini-2.5-flash-preview-tts' } = req.body;

    if (!text) return res.status(400).json({ error: 'Text required' });
    if (!GEMINI_API_KEY) return res.status(503).json({ error: 'Gemini API key not configured' });

    const cacheKey = `${lang}:${text}:${voice}:${model}`;
    if (audioCache.has(cacheKey)) {
      return res.json({ audioContent: audioCache.get(cacheKey) });
    }

    console.log('[TTS Server] Request:', { text, lang, voice, model });

    const defaultSystemInstruction = lang === 'ja'
      ? 'You are a Japanese language pronunciation assistant. Speak the given Japanese word clearly and naturally. Say only the word, nothing else.'
      : 'Say the given word clearly. Say only the word, nothing else.';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: systemInstruction || defaultSystemInstruction
            }]
          },
          contents: [{
            parts: [{ text: lang === 'ja' ? text : text }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice
                }
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('Gemini Audio API Error:', err);
      return res.status(response.status).json({ error: 'TTS error', details: err });
    }

    const data = await response.json();

    // Extract audio from Gemini response
    const audioPart = data.candidates?.[0]?.content?.parts?.find(
      p => p.inlineData?.mimeType?.startsWith('audio/')
    );

    if (audioPart?.inlineData?.data) {
      const audioContent = audioPart.inlineData.data;

      // Cache with size limit
      if (audioCache.size >= CACHE_MAX_SIZE) {
        audioCache.delete(audioCache.keys().next().value);
      }
      audioCache.set(cacheKey, audioContent);

      res.json({
        audioContent,
        mimeType: audioPart.inlineData.mimeType
      });
    } else {
      console.error('No audio in response:', data);
      res.status(500).json({ error: 'No audio generated' });
    }
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Gemini AI API Endpoint for AI Tutor
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: 'Prompt required' });
    if (!GEMINI_API_KEY) return res.status(503).json({ error: 'Gemini not configured' });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: 'Gemini error', details: err });
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    res.json({ response: textResponse });
  } catch (error) {
    console.error('Gemini error:', error);
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
