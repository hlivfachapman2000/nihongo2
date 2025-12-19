import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// In-memory audio cache for dev server
const ttsCache = new Map<string, { audioContent: string; mimeType: string }>();
const CACHE_MAX_SIZE = 500;

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
            const parsed = JSON.parse(body);
            const { text, lang = 'en', systemInstruction, model = 'gemini-2.5-flash-preview-tts' } = parsed;
            // Use Kore for all languages (reliable multilingual voice)
            const voice = parsed.voice || 'Kore';
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

            // Check cache first
            const cacheKey = `${lang}:${text}:${voice}:${model}`;
            if (ttsCache.has(cacheKey)) {
              console.log('[TTS Server] Cache hit for:', text);
              const cached = ttsCache.get(cacheKey)!;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(cached));
              return;
            }

            // Use the text as-is - the client already builds the appropriate prompt
            // with style and speed wrappers from Audio.ts
            const ttsPrompt = text;
            
            // Retry logic for API calls
            const maxRetries = 3;
            let lastError: any = null;
            
            for (let attempt = 0; attempt < maxRetries; attempt++) {
              try {
                // Use header-based authentication as per docs
                const response = await fetch(
                  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                  {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'x-goog-api-key': apiKey
                    },
                    body: JSON.stringify({
                      contents: [{
                        parts: [{ text: ttsPrompt }]
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
                  console.error(`Gemini Audio API Error (attempt ${attempt + 1}):`, err);
                  lastError = err;
                  
                  // If it's a 500 error, retry after a short delay
                  if (response.status >= 500 && attempt < maxRetries - 1) {
                    await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
                    continue;
                  }
                  
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
                  const result = {
                    audioContent: audioPart.inlineData.data,
                    mimeType: audioPart.inlineData.mimeType
                  };
                  
                  // Cache the result
                  if (ttsCache.size >= CACHE_MAX_SIZE) {
                    // Remove oldest entry
                    const firstKey = ttsCache.keys().next().value;
                    if (firstKey) ttsCache.delete(firstKey);
                  }
                  ttsCache.set(cacheKey, result);
                  console.log('[TTS Server] Cached audio for:', text);
                  
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(result));
                  return; // Success, exit the retry loop
                } else {
                  console.error('No audio in response (attempt ' + (attempt + 1) + '):', data);
                  if (attempt < maxRetries - 1) {
                    await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
                    continue;
                  }
                }
              } catch (retryError) {
                console.error(`TTS fetch error (attempt ${attempt + 1}):`, retryError);
                lastError = retryError;
                if (attempt < maxRetries - 1) {
                  await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
                  continue;
                }
              }
            }
            
            // All retries failed
            console.error('All TTS retries failed');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'No audio generated after retries' }));
          } catch (error) {
            console.error('TTS error:', error);
            res.statusCode = 500;
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
        allowedHosts: true,
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
