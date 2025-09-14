# Whisper Walls Platform

A location-based emotional connection platform that blends digital intimacy with physical spaces. Users can leave anonymous, heartfelt messages tied to specific real-world locations while the system provides intelligent mood-based recommendations, playlist generation, and relationship insights.

## Project Structure

```
whisper-walls-platform/
├── whisper-walls-frontend/     # React TypeScript frontend
├── whisper-walls-backend/      # Node.js Express backend
└── .kiro/specs/               # Project specifications
```

## Features

- 🌍 **Location-Based Messaging**: Leave anonymous love notes at real-world locations
- 🎭 **Mood Detection**: AI-powered emotion analysis from text and voice
- 🎵 **Smart Playlists**: Spotify integration with mood-based music recommendations
- 💕 **Couple Mode**: Blend moods and discover shared activities
- 🎨 **Emotional UI**: Beautiful, romantic interface with dreamy animations
- 🔊 **Voice Features**: Speech-to-text and AI narration
- 📱 **AR Visualizations**: Augmented reality mood displays
- 📝 **Shared Journals**: Collaborative emotional diaries

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Redis (optional, for caching)

### Backend Setup

```bash
cd whisper-walls-backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd whisper-walls-frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## API Keys Required

- OpenAI API (for GPT-4 and Whisper)
- Spotify Web API
- ElevenLabs TTS API
- Google Maps API

## Development

The platform is built with:

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript, MongoDB, Redis
- **AI/ML**: OpenAI GPT-4, Whisper API, ElevenLabs TTS
- **External APIs**: Spotify Web API, Google Maps API

## Architecture

The system follows a microservices approach with:
- Location Service (geospatial queries)
- Mood Analysis Service (emotion detection)
- Message Service (anonymous messaging)
- User Service (authentication & profiles)
- Playlist Service (Spotify integration)
- Voice Service (speech processing)

## Contributing

This project follows the Kiro spec-driven development methodology. See `.kiro/specs/whisper-walls-platform/` for detailed requirements, design, and implementation tasks.

## License

MIT License - see LICENSE file for details.