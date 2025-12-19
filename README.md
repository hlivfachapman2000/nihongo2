# 🎮 Nihongo Sprinter

A fun Japanese language learning game built with React, Three.js, and Gemini TTS.

## 🚀 Quick Start

### Run in Browser (StackBlitz)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/hlivfachapman2000/nihongo2)

### Run Locally
```bash
# Clone the repo
git clone https://github.com/hlivfachapman2000/nihongo2.git
cd nihongo2

# Install dependencies
npm install

# Create .env.local with your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Start development server
npm run dev
```

## 🎯 Features

- **Learn Japanese vocabulary** through an endless runner game
- **Native TTS pronunciation** powered by Gemini 2.5 Flash
- **Multiple categories**: Animals, Food, Nature, Colors, Numbers, and more
- **Writing modes**: Kanji, Hiragana, or Romaji
- **Combo system** with motivational Japanese phrases
- **Achievement system** to track progress

## 🎮 How to Play

1. **Collect Japanese orbs** (e.g., 猫)
2. **Find the English match** (e.g., Cat)
3. **Chain matches** for combo multipliers!
4. **Complete quizzes** to level up

### Controls
- **A/D** - Move left/right
- **W** - Jump
- **S** - Drop
- **SPACE** - Use ability

## 🔊 Audio Setup

The game uses Gemini 2.5 Flash Preview TTS for native Japanese pronunciation.

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/)
2. Create `.env.local` in the project root:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **3D Graphics**: Three.js, React Three Fiber
- **State**: Zustand
- **TTS**: Gemini 2.5 Flash Preview
- **Build**: Vite

## 📝 License

Apache-2.0
