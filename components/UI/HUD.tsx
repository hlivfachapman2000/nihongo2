/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Brain, Check, Flame, Gamepad2, Globe, Heart, X, Zap } from 'lucide-react';
import React from 'react';
import { useStore } from '../../store';
import { GameStatus, WordCategory, WritingMode } from '../../types';
import { CATEGORY_INFO } from '../../vocabularyData';
import { audio } from '../System/Audio';


// Achievement Popup Component
const AchievementPopup: React.FC = () => {
    const { newAchievement, clearNewAchievement } = useStore();

    if (!newAchievement) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-bounce">
            <div className="bg-gradient-to-r from-yellow-600 to-amber-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border-2 border-yellow-300">
                <div className="text-4xl">{newAchievement.icon}</div>
                <div>
                    <div className="text-xs font-mono text-yellow-200 uppercase tracking-wider">Achievement Unlocked!</div>
                    <div className="text-xl font-black">{newAchievement.name}</div>
                    <div className="text-sm text-yellow-100">{newAchievement.description}</div>
                </div>
                <button
                    onClick={clearNewAchievement}
                    className="ml-4 p-1 hover:bg-white/20 rounded pointer-events-auto"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// Combo Display Component
const ComboDisplay: React.FC<{ combo: number; streak: number }> = ({ combo, streak }) => {
    if (combo <= 1) return null;

    return (
        <div className="absolute top-40 right-6 text-right">
            <div className={`text-5xl font-black transition-all duration-300 ${
                combo >= 5 ? 'text-yellow-400 animate-pulse scale-125' :
                combo >= 3 ? 'text-orange-400' : 'text-cyan-400'
            }`}>
                {combo}x
            </div>
            <div className="text-sm font-mono text-gray-400 flex items-center justify-end gap-1">
                <Flame className={`w-4 h-4 ${combo >= 3 ? 'text-orange-500' : 'text-gray-500'}`} />
                COMBO
            </div>
            {streak >= 5 && (
                <div className="mt-2 text-xs font-mono text-green-400 flex items-center justify-end gap-1">
                    <Zap className="w-3 h-3" />
                    {streak} STREAK
                </div>
            )}
        </div>
    );
};

// Category Selector for Menu
const CategorySelector: React.FC = () => {
    const { selectedCategories, toggleCategory } = useStore();
    const categories = Object.entries(CATEGORY_INFO) as [WordCategory, typeof CATEGORY_INFO[WordCategory]][];

    return (
        <div className="mt-4">
            <div className="text-sm font-mono text-gray-400 mb-2">SELECT CATEGORIES:</div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {categories.map(([key, info]) => {
                    const isSelected = selectedCategories.includes(key);
                    return (
                        <button
                            key={key}
                            onClick={() => toggleCategory(key)}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all pointer-events-auto flex items-center gap-1 ${
                                isSelected
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                            style={isSelected ? { backgroundColor: info.color } : {}}
                        >
                            <span>{info.icon}</span>
                            <span>{info.name}</span>
                            {isSelected && <Check className="w-3 h-3 ml-1" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Writing Mode Selector
const WritingModeSelector: React.FC = () => {
    const { writingMode, setWritingMode } = useStore();

    const modes = [
        { mode: WritingMode.KANJI, label: '漢字 Kanji', desc: 'Full kanji' },
        { mode: WritingMode.HIRAGANA, label: 'ひらがな', desc: 'Hiragana only' },
        { mode: WritingMode.ROMAJI, label: 'Romaji', desc: 'Latin letters' },
    ];

    return (
        <div className="mt-4">
            <div className="text-sm font-mono text-gray-400 mb-2">WRITING DISPLAY:</div>
            <div className="flex gap-2 justify-center">
                {modes.map(({ mode, label, desc }) => (
                    <button
                        key={mode}
                        onClick={() => setWritingMode(mode)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all pointer-events-auto ${
                            writingMode === mode
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const QuizScreen: React.FC = () => {
    const { quizQuestion, quizOptions, answerQuiz, writingMode } = useStore();

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
  const {
    score, lives, maxLives, status, level, restartGame, startGame,
    holdingWord, matchesMade, combo, streak, maxCombo, achievements,
    playerStats
  } = useStore();

  const [showDebug, setShowDebug] = React.useState(false);

  // Achievement popup is always rendered
  const achievementPopup = <AchievementPopup />;

  // Debug Panel
  const debugPanel = showDebug ? <AudioDebugPanel onClose={() => setShowDebug(false)} /> : null;

  // Blocking Audio Loading Screen
  const { isAudioLoading, audioError } = useStore();

  if (audioError) {
      return (
          <div className="absolute inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center text-white p-8 text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-500 mb-2">AUDIO ERROR</h2>
              <p className="text-gray-300 font-mono mb-6">{audioError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200"
              >
                RELOAD
              </button>
          </div>
      );
  }

  if (isAudioLoading) {
      return (
          <div className="absolute inset-0 z-[200] bg-black flex flex-col items-center justify-center text-white">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-2xl font-bold animate-pulse">LOADING AUDIO...</h2>
              <p className="text-gray-500 font-mono text-sm mt-2">Preparing native pronunciation</p>
          </div>
      );
  }

  if (status === GameStatus.QUIZ) return <>{achievementPopup}<QuizScreen /></>;

  if (status === GameStatus.MENU) {
      const unlockedCount = achievements.filter(a => a.unlocked).length;

      return (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-black text-white p-6 overflow-y-auto">
              {achievementPopup}
              {debugPanel}

              {/* Logo Section */}
              <div className="text-center mb-6">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-600 to-red-800 mx-auto mb-4 shadow-[0_0_50px_red] flex items-center justify-center animate-pulse">
                    <span className="text-4xl font-black">JP</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-1">NIHONGO</h1>
                <h2 className="text-xl md:text-2xl text-red-500 font-mono tracking-[0.8em]">SPRINTER</h2>
              </div>

              {/* Stats Bar */}
              {playerStats.totalMatches > 0 && (
                  <div className="flex gap-4 mb-4 text-xs font-mono text-gray-500">
                      <span>🎯 {playerStats.totalMatches} matches</span>
                      <span>🔥 {playerStats.highestCombo}x best combo</span>
                      <span>🏆 {unlockedCount}/{achievements.length} badges</span>
                  </div>
              )}

              {/* Mission Briefing */}
              <div className="max-w-md w-full bg-gray-900/80 border border-red-500/30 p-5 rounded-lg mb-4 backdrop-blur-sm">
                  <h3 className="text-red-400 font-mono text-base mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4" /> MISSION BRIEFING
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300 font-mono">
                      <li className="flex gap-2">
                          <span className="text-cyan-400">1.</span> Collect Japanese Orb (e.g. <span className="text-red-400">猫</span>).
                      </li>
                      <li className="flex gap-2">
                          <span className="text-cyan-400">2.</span> Find English meaning (e.g. <span className="text-blue-400">Cat</span>).
                      </li>
                      <li className="flex gap-2">
                          <span className="text-cyan-400">3.</span> Chain matches for <span className="text-yellow-400">COMBO</span> multipliers!
                      </li>
                  </ul>

                  <div className="mt-4 border-t border-gray-800 pt-3">
                      <h3 className="text-red-400 font-mono text-sm mb-2 flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4" /> CONTROLS
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
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

              {/* Category & Writing Mode Selectors */}
              <div className="max-w-lg w-full">
                  <CategorySelector />
                  <WritingModeSelector />
              </div>

              <button
                  onClick={() => setShowDebug(true)}
                  className="mt-4 text-xs text-gray-500 hover:text-white underline"
              >
                  🔊 Open Audio Debugger
              </button>

              <button
                  onClick={() => { audio.init(); startGame(); }}
                  className="mt-6 group relative px-12 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-xl hover:from-red-500 hover:to-red-600 transition-all duration-300 rounded-lg shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:shadow-[0_0_50px_rgba(255,0,0,0.5)]"
              >
                  🏃‍♂️ START RUN
              </button>
          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      const unlockedAchievements = achievements.filter(a => a.unlocked);

      return (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-black/90 text-white">
              {achievementPopup}
              <h1 className="text-6xl font-black text-red-600 mb-4">GAME OVER</h1>
              <p className="text-2xl mb-2">SCORE: {score.toLocaleString()}</p>

              {/* Stats Summary */}
              <div className="flex gap-6 mb-6 text-sm font-mono text-gray-400">
                  <span>Level {level}</span>
                  <span>Max Combo: {maxCombo}x</span>
                  <span>Streak: {streak}</span>
              </div>

              {/* Show unlocked achievements */}
              {unlockedAchievements.length > 0 && (
                  <div className="mb-6">
                      <div className="text-xs text-gray-500 mb-2 font-mono">BADGES EARNED THIS RUN:</div>
                      <div className="flex gap-2">
                          {unlockedAchievements.slice(0, 5).map(a => (
                              <div key={a.id} className="text-2xl" title={a.name}>{a.icon}</div>
                          ))}
                      </div>
                  </div>
              )}

              <button
                  onClick={restartGame}
                  className="px-8 py-3 bg-white text-black font-bold hover:bg-gray-200 rounded-lg"
              >
                  TRY AGAIN
              </button>
          </div>
      );
  }

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-50">
        {achievementPopup}

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
                        className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-500"
                        style={{ width: `${(matchesMade / 5) * 100}%` }}
                     />
                 </div>
                 <div className="text-xs text-gray-500 mt-1 font-mono">{matchesMade}/5 to quiz</div>
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

        {/* Combo Display */}
        <ComboDisplay combo={combo} streak={streak} />

        {/* Center: Current Word Status */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center">
            {holdingWord ? (
                <div className="animate-pulse">
                    <div className="text-gray-400 text-xs mb-1">LOOKING FOR MATCH</div>
                    <div className={`bg-black/80 border backdrop-blur-md px-6 py-3 rounded-xl flex flex-col items-center shadow-[0_0_20px_rgba(0,255,255,0.3)] ${
                        combo > 1 ? 'border-yellow-500/50' : 'border-white/20'
                    }`}>
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
