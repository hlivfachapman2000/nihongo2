/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AI Tutor - Gemini-powered learning assistant
 * Provides contextual explanations and example sentences for learned words
 */

import { BookOpen, Loader2, MessageCircle, Sparkles, Volume2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { WordData } from '../../types';
import { audio } from '../System/Audio';

interface AITutorProps {
    word: WordData;
    onClose: () => void;
}

interface AIResponse {
    explanation: string;
    exampleSentence: string;
    exampleTranslation: string;
    funFact: string;
    encouragement: string;
}

export const AITutor: React.FC<AITutorProps> = ({ word, onClose }) => {
    const [response, setResponse] = useState<AIResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAIExplanation();
    }, [word.id]);

    const fetchAIExplanation = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `You are a friendly Japanese language tutor for young learners.
                    Explain this Japanese word in an engaging, simple way:

                    Word: ${word.jp} (${word.hiragana})
                    Reading: ${word.romaji}
                    Meaning: ${word.en}
                    Category: ${word.category}

                    Please provide:
                    1. A simple explanation of when/how this word is used (1-2 sentences)
                    2. One example sentence in Japanese using the word
                    3. The English translation of that example
                    4. A fun fact or memory tip about this word
                    5. A short encouraging message for the learner

                    Format your response as JSON:
                    {
                        "explanation": "...",
                        "exampleSentence": "...",
                        "exampleTranslation": "...",
                        "funFact": "...",
                        "encouragement": "..."
                    }`
                })
            });

            if (!res.ok) {
                throw new Error('AI service unavailable');
            }

            const data = await res.json();

            // Parse the response
            if (data.response) {
                try {
                    // Try to extract JSON from the response
                    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        setResponse(JSON.parse(jsonMatch[0]));
                    } else {
                        throw new Error('Invalid response format');
                    }
                } catch {
                    // Fallback to a generated response
                    setResponse(generateFallbackResponse(word));
                }
            } else {
                setResponse(generateFallbackResponse(word));
            }
        } catch (err) {
            console.log('AI Tutor: Using fallback response');
            setResponse(generateFallbackResponse(word));
        } finally {
            setLoading(false);
        }
    };

    const generateFallbackResponse = (w: WordData): AIResponse => {
        const explanations: Record<string, string> = {
            animals: `"${w.romaji}" is the Japanese word for "${w.en}". It's commonly used when talking about pets, wildlife, or in children's stories!`,
            food: `"${w.romaji}" means "${w.en}" in Japanese. You'll hear this word at restaurants and when talking about meals!`,
            colors: `"${w.romaji}" is the Japanese word for the color "${w.en}". Colors are fun to learn because you can practice anywhere!`,
            numbers: `"${w.romaji}" is the number "${w.en}" in Japanese. Numbers are super useful for shopping and telling time!`,
            nature: `"${w.romaji}" means "${w.en}" and is related to nature. Japanese culture has deep appreciation for nature!`,
            body: `"${w.romaji}" means "${w.en}". Body parts are useful for going to the doctor or describing people!`,
            greetings: `"${w.romaji}" is an important greeting meaning "${w.en}". Using proper greetings shows respect in Japanese culture!`,
            people: `"${w.romaji}" refers to "${w.en}". Family and social terms are important in Japanese society!`,
            objects: `"${w.romaji}" means "${w.en}". Everyday object words help you navigate daily life in Japan!`,
            verbs: `"${w.romaji}" means "${w.en}". Verbs are the action words that bring sentences to life!`,
        };

        const examples: Record<string, [string, string]> = {
            animals: [`${w.jp}がかわいいです。`, `The ${w.en.toLowerCase()} is cute.`],
            food: [`${w.jp}が好きです。`, `I like ${w.en.toLowerCase()}.`],
            colors: [`${w.jp}が好きな色です。`, `${w.en} is my favorite color.`],
            numbers: [`${w.jp}つください。`, `${w.en}, please.`],
            nature: [`${w.jp}がきれいです。`, `The ${w.en.toLowerCase()} is beautiful.`],
            body: [`${w.jp}が痛いです。`, `My ${w.en.toLowerCase()} hurts.`],
            greetings: [`${w.jp}、お元気ですか?`, `${w.en}, how are you?`],
            people: [`あの${w.jp}は親切です。`, `That ${w.en.toLowerCase()} is kind.`],
            objects: [`${w.jp}はどこですか?`, `Where is the ${w.en.toLowerCase()}?`],
            verbs: [`毎日${w.jp}ます。`, `I ${w.en.toLowerCase()} every day.`],
        };

        const example = examples[w.category] || [`${w.jp}です。`, `It is ${w.en.toLowerCase()}.`];

        return {
            explanation: explanations[w.category] || `"${w.romaji}" means "${w.en}" in Japanese!`,
            exampleSentence: example[0],
            exampleTranslation: example[1],
            funFact: `The character ${w.jp} is made up of strokes that tell a story. Practice writing it!`,
            encouragement: `You're doing amazing! Every word you learn brings you closer to fluency! 🌟`
        };
    };

    const speakJapanese = (text: string) => {
        audio.speak(text, 'ja');
    };

    return (
        <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-lg w-full shadow-2xl border border-purple-500/30 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-yellow-300" />
                        <span className="font-bold text-lg">AI Tutor</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Word Display */}
                <div className="p-6 text-center border-b border-gray-700">
                    <div className="text-5xl font-bold mb-2">{word.jp}</div>
                    <div className="text-xl text-gray-400 mb-1">{word.hiragana}</div>
                    <div className="text-lg text-purple-400 font-mono">{word.romaji}</div>
                    <div className="text-2xl text-white mt-2">{word.en}</div>
                    <button
                        onClick={() => speakJapanese(word.jp)}
                        className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                        <Volume2 className="w-4 h-4" />
                        Listen
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                            <span className="ml-3 text-gray-400">Thinking...</span>
                        </div>
                    ) : response ? (
                        <>
                            {/* Explanation */}
                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-purple-400 text-sm font-mono mb-2">
                                    <BookOpen className="w-4 h-4" />
                                    EXPLANATION
                                </div>
                                <p className="text-gray-200">{response.explanation}</p>
                            </div>

                            {/* Example */}
                            <div className="bg-gray-800/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-cyan-400 text-sm font-mono mb-2">
                                    <MessageCircle className="w-4 h-4" />
                                    EXAMPLE
                                </div>
                                <div
                                    className="text-xl text-white mb-1 cursor-pointer hover:text-cyan-300 transition-colors"
                                    onClick={() => speakJapanese(response.exampleSentence)}
                                >
                                    {response.exampleSentence} 🔊
                                </div>
                                <div className="text-gray-400">{response.exampleTranslation}</div>
                            </div>

                            {/* Fun Fact */}
                            <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-4">
                                <div className="text-yellow-400 text-sm font-mono mb-2">💡 FUN FACT</div>
                                <p className="text-yellow-100/80">{response.funFact}</p>
                            </div>

                            {/* Encouragement */}
                            <div className="text-center text-lg text-green-400 py-2">
                                {response.encouragement}
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-400 py-4">
                            Unable to load explanation. Keep practicing! 🌸
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
                    >
                        Got it! 👍
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper component to show AI Tutor after successful quiz
export const AITutorTrigger: React.FC = () => {
    const { quizQuestion, status } = useStore();
    const [showTutor, setShowTutor] = useState(false);
    const [tutorWord, setTutorWord] = useState<WordData | null>(null);

    // This could be triggered after quiz completion
    // For now, it's a standalone component that can be called when needed

    if (!showTutor || !tutorWord) return null;

    return <AITutor word={tutorWord} onClose={() => setShowTutor(false)} />;
};
