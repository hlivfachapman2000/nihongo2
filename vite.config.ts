import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// API middleware plugin for Vite dev server
function apiMiddlewarePlugin(env: Record<string, string>) {
  return {
    name: 'api-middleware',
    configureServer(server: any) {
      // TTS API endpoint - Using Gemini 2.5 Flash native audio
      server.middlewares.use('/api/tts', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const { text, lang = 'en', systemInstruction, voice = 'Zephyr', model = 'gemini-2.5-flash-preview-tts' } = JSON.parse(body);
            const apiKey = env.GEMINI_API_KEY;

            console.log('[TTS Server] Request:', { text, lang, voice, model, hasApiKey: !!apiKey });

            if (!text) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Text required' }));
              return;
            }

            if (!apiKey) {
              console.error('[TTS Server] No GEMINI_API_KEY found in env');
              res.statusCode = 503;
              res.end(JSON.stringify({ error: 'Gemini API key not configured' }));
              return;
            }

            // Use specified model or default to Gemini 2.5 Flash Preview TTS
            const prompt = lang === 'ja'
              ? `${text}`
              : `${text}`;

            const defaultSystemInstruction = lang === 'ja'
              ? 'You are a Japanese language pronunciation assistant. Speak the given Japanese word clearly and naturally. Say only the word, nothing else.'
              : 'Say the given word clearly. Say only the word, nothing else.';

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
                    parts: [{ text: prompt }]
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
              res.statusCode = response.status;
              res.end(JSON.stringify({ error: 'TTS error', details: err }));
              return;
            }

            const data = await response.json();

            // Extract audio from Gemini response
            const audioPart = data.candidates?.[0]?.content?.parts?.find(
              (p: any) => p.inlineData?.mimeType?.startsWith('audio/')
            );

            if (audioPart?.inlineData?.data) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                audioContent: audioPart.inlineData.data,
                mimeType: audioPart.inlineData.mimeType
              }));
            } else {
              console.error('No audio in response:', data);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'No audio generated' }));
            }
          } catch (error) {
            console.error('TTS error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Server error' }));
            res.end(JSON.stringify({ error: 'Server error' }));
          }
        });
      });

      // Gemini API endpoint
      server.middlewares.use('/api/gemini', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const { prompt } = JSON.parse(body);
            const apiKey = env.GEMINI_API_KEY;

            if (!prompt) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Prompt required' }));
              return;
            }

            if (!apiKey) {
              res.statusCode = 503;
              res.end(JSON.stringify({ error: 'Gemini not configured' }));
              return;
            }

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                })
              }
            );

            if (!response.ok) {
              const err = await response.json();
              res.statusCode = response.status;
              res.end(JSON.stringify({ error: 'Gemini error', details: err }));
              return;
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ response: textResponse }));
          } catch (error) {
            console.error('Gemini error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Server error' }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        apiMiddlewarePlugin(env)
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
