import React, { useState } from 'react';

const VOICES = ['Zephyr', 'Puck', 'Charon', 'Aoede', 'Fenrir'];

export const AudioDebugPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [inputWord, setInputWord] = useState('Cat');
  const [promptTemplate, setPromptTemplate] = useState('Translate "{word}" to Japanese and speak it.');
  const [systemInstruction, setSystemInstruction] = useState(
    'You are a Japanese language pronunciation assistant. Speak the translation clearly and naturally. Say only the Japanese word, nothing else.'
  );
  const [voice, setVoice] = useState('Zephyr');
  const [model, setModel] = useState('gemini-2.5-flash-preview-tts');
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setLastError(null);
    try {
      // Construct the full prompt
      const fullText = promptTemplate.replace('{word}', inputWord);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          lang: 'ja',
          systemInstruction,
          voice,
          model
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Unknown error');
      }

      const data = await response.json();
      if (data.audioContent) {
        const mimeType = data.mimeType || 'audio/mp3';
        const audioDataUrl = `data:${mimeType};base64,${data.audioContent}`;
        const audioElement = new Audio(audioDataUrl);
        audioElement.volume = 1.0;
        await audioElement.play();
      } else {
        throw new Error('No audio content received');
      }

    } catch (e: any) {
      console.error(e);
      setLastError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">🔊 Audio Playground</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          {/* Input Word */}
          <div>
            <label className="block text-xs text-cyan-400 mb-1 font-mono">INPUT WORD</label>
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-cyan-500 outline-none font-bold text-lg"
            />
          </div>

          {/* Prompt Template */}
          <div>
            <label className="block text-xs text-cyan-400 mb-1 font-mono">PROMPT TEMPLATE ({'{word}'} will be replaced)</label>
            <input
              type="text"
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-gray-300 focus:border-cyan-500 outline-none text-sm font-mono"
            />
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs text-cyan-400 mb-1 font-mono">MODEL ID</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-yellow-300 focus:border-cyan-500 outline-none text-xs font-mono"
            />
            <div className="text-[10px] text-gray-500 mt-1">
              Try: gemini-2.5-flash-preview-tts OR gemini-2.5-flash-native-audio-preview-12-2025
            </div>
          </div>

          {/* Voice Selector */}
          <div>
            <label className="block text-xs text-cyan-400 mb-1 font-mono">VOICE MODEL</label>
            <div className="flex gap-2 flex-wrap">
              {VOICES.map(v => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    voice === v
                      ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(0,255,255,0.3)]'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* System Instruction */}
          <div>
            <label className="block text-xs text-cyan-400 mb-1 font-mono">SYSTEM INSTRUCTION</label>
            <textarea
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded p-2 text-gray-300 text-xs font-mono focus:border-cyan-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {lastError && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded text-sm font-mono">
              Error: {lastError}
            </div>
          )}

          <button
            onClick={handleTest}
            disabled={loading}
            className={`w-full py-4 rounded-lg font-black text-white transition-all transform active:scale-95 ${
              loading
                ? 'bg-gray-600 cursor-wait'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg'
            }`}
          >
            {loading ? 'GENERATING...' : '▶️ GENERATE & SPEAK'}
          </button>

          <div className="text-[10px] text-gray-500 text-center font-mono">
            Using gemini-2.5-flash-preview-tts
          </div>
        </div>
      </div>
    </div>
  );
};
