
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { Heart, Activity, Brain, Globe, Play, XCircle, CheckCircle2, Gamepad2, Volume2 } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, NIHON_COLORS } from '../../types';
import { audio } from '../System/Audio';

const QuizScreen: React.FC = () => {
    const { quizQuestion, quizOptions, answerQuiz } = useStore();

    if (!quizQuestion) return null;

    return (
        <div className="absolute inset-0 z-[100] bg-black/95 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full text-center">
                <div className="mb-2 text-red-500 font-mono tracking-widest text-xl">QUIZ MODE</div>
                <h2 className="text-4xl font-bold mb-8">What is <span className="text-cyan-400">"{quizQuestion.en}"</span> in Japanese?</h2>
                
                <div className="grid gap-4">
                    {quizOptions.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => answerQuiz(opt)}
                            className="p-6 bg-gray-800 border-2 border-gray-700 hover:border-red-500 rounded-xl text-3xl font-bold transition-all hover:scale-105 active:scale-95"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const HUD: React.FC = () => {
  const { score, lives, maxLives, status, level, restartGame, startGame, holdingWord, matchesMade } = useStore();

  if (status === GameStatus.QUIZ) return <QuizScreen />;

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-black text-white p-6">
              
              {/* Logo Section */}
              <div className="text-center mb-8">
                <div className="w-32 h-32 rounded-full bg-red-600 mx-auto mb-6 shadow-[0_0_50px_red] flex items-center justify-center">
                    <span className="text-5xl font-black">JP</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-2">NIHONGO</h1>
                <h2 className="text-2xl md:text-3xl text-red-500 font-mono tracking-[1em]">SPRINTER</h2>
              </div>
              
              {/* Mission Briefing */}
              <div className="max-w-md w-full bg-gray-900/80 border border-red-500/30 p-6 rounded-lg mb-8 backdrop-blur-sm">
                  <h3 className="text-red-400 font-mono text-lg mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5" /> MISSION BRIEFING
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-300 font-mono">
                      <li className="flex gap-2">
                          <span className="text-cyan-400">1.</span> Collect Japanese Orb (e.g. <span className="text-red-400">猫</span>).
                      </li>
                      <li className="flex gap-2">
                          <span className="text-cyan-400">2.</span> Find English meaning (e.g. <span className="text-blue-400">Cat</span>).
                      </li>
                      <li className="flex gap-2">
                          <span className="text-cyan-400">3.</span> Fill the mastery bar to level up!
                      </li>
                  </ul>
                  
                  <div className="mt-6 border-t border-gray-800 pt-4">
                      <h3 className="text-red-400 font-mono text-lg mb-2 flex items-center gap-2">
                          <Gamepad2 className="w-5 h-5" /> CONTROLS
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                           <div className="flex items-center gap-2">
                               <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">A</span> / <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">D</span> Move
                           </div>
                           <div className="flex items-center gap-2">
                               <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">W</span> Jump
                           </div>
                           <div className="flex items-center gap-2">
                               <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">S</span> Drop
                           </div>
                           <div className="flex items-center gap-2">
                               <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">SPACE</span> Ability
                           </div>
                      </div>
                  </div>
              </div>

              <button 
                  onClick={() => { audio.init(); startGame(); }}
                  className="group relative px-12 py-4 bg-white text-black font-black text-xl hover:bg-red-600 hover:text-white transition-all duration-300 clip-path-slant"
              >
                  START RUN
              </button>
          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-black/90 text-white">
              <h1 className="text-6xl font-black text-red-600 mb-4">GAME OVER</h1>
              <p className="text-2xl mb-8">SCORE: {score}</p>
              <button 
                  onClick={restartGame}
                  className="px-8 py-3 bg-white text-black font-bold hover:bg-gray-200"
              >
                  TRY AGAIN
              </button>
          </div>
      );
  }

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-50">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
            <div>
                <div className="text-red-500 font-mono text-sm tracking-wider">SCORE</div>
                <div className="text-4xl font-black italic">{score.toLocaleString()}</div>
            </div>

            <div className="flex flex-col items-center">
                 <div className="bg-red-600 text-white px-4 py-1 font-bold text-sm mb-2 rounded-sm">
                     LEVEL {level}
                 </div>
                 {/* Progress to next level */}
                 <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-cyan-400 transition-all duration-500" 
                        style={{ width: `${(matchesMade / 5) * 100}%` }}
                     />
                 </div>
            </div>

            <div className="flex gap-1">
                {[...Array(maxLives)].map((_, i) => (
                    <Heart 
                        key={i} 
                        className={`w-8 h-8 ${i < lives ? 'fill-red-500 text-red-500' : 'fill-gray-900 text-gray-800'}`} 
                    />
                ))}
            </div>
        </div>

        {/* Center: Current Word Status */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center">
            {holdingWord ? (
                <div className="animate-pulse">
                    <div className="text-gray-400 text-xs mb-1">LOOKING FOR MATCH</div>
                    <div className="bg-black/80 border border-white/20 backdrop-blur-md px-6 py-3 rounded-xl flex flex-col items-center shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                        <span className="text-3xl font-bold text-white mb-1">{holdingWord.text}</span>
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide">
                            <Globe className={`w-3 h-3 ${holdingWord.lang === 'en' ? 'text-blue-400' : 'text-red-400'}`} />
                            <span className={holdingWord.lang === 'en' ? 'text-blue-400' : 'text-red-400'}>
                                {holdingWord.lang === 'en' ? 'ENGLISH' : 'JAPANESE'}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-gray-500 text-sm font-mono bg-black/50 px-3 py-1 rounded">
                    PICK UP AN ORB
                </div>
            )}
        </div>

    </div>
  );
};
