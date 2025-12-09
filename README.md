# Cartoon Story Studio 🎬

An automated cartoon animation pipeline that allows users to create short animated stories with minimal manual work. Produces simple children's-style animations (similar to Dora the Explorer or Peppa Pig) without requiring users to design sprites, rig characters, or animate frame-by-frame.

## ✨ Features

- **Story Creation**: AI-powered story generation using Gemini or OpenAI
- **Character & Scene Generation**: Pre-built character rigs and backgrounds
- **Animation Engine**: Automatic movement, expressions, transitions, and camera changes
- **Optional Editing**: Reposition characters, change expressions, adjust timing
- **Audio**: Text-to-speech narration with lip-sync support
- **Playback**: Full animation viewer with scene controls
- **Export**: WebM/MP4/GIF video export with quality presets
- **Project Saving**: Save, load, and regenerate animations (PostgreSQL)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (for project persistence)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cartoon-studio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
- `GEMINI_API_KEY` - Get free at [Google AI Studio](https://aistudio.google.com/app/apikey)
- `OPENAI_API_KEY` - (Optional fallback) from [OpenAI](https://platform.openai.com/api-keys)
- `DATABASE_URL` - PostgreSQL connection string

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `OPENAI_API_KEY` (optional)
   - `DATABASE_URL`
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import the project in [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables
6. Deploy!

### Database Setup

You can use any PostgreSQL provider:
- [Supabase](https://supabase.com) - Free tier available
- [Neon](https://neon.tech) - Free tier available
- [Railway](https://railway.app)
- [PlanetScale](https://planetscale.com)

## 📁 Project Structure

```
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── generate-story/  # AI story generation
│   │   ├── projects/        # Project CRUD
│   │   └── health/          # Health check endpoint
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── StoryGenerator.tsx   # Story creation UI
│   ├── VideoExporter.tsx    # Export modal
│   └── ...
├── lib/                   # Utilities and services
│   ├── ai-service.ts        # AI integration
│   ├── audio-manager.ts     # Audio system
│   ├── video-export-engine.ts # Video rendering
│   └── ...
└── prisma/               # Database schema
```

## 🔧 API Endpoints

- `GET /api/health` - Health check with database and AI status
- `POST /api/generate-story` - Generate AI story
- `GET /api/projects` - List saved projects
- `POST /api/projects` - Save/update project
- `GET /api/projects/[id]` - Load specific project

## 🎨 Available Assets

### Characters
Luna, Max, Emma, Whiskers, Buddy, Cotton, Milo, Coco, Pip, Ruby, Oliver, Daisy, Felix, Bella, Charlie, Rosie

### Backgrounds
Meadow, Forest, Beach, Night, Bedroom, Park, Castle, Space, Underwater, Mountain, City, Farm, Playground, Library, Kitchen, Garden

### Actions
Idle, Walk, Run, Wave, Dance, Jump, Talk, Surprised, Sit, Sleep, Eat, Read, Play, Think, Laugh, Cry, Hug, Point, Clap, Spin

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.
