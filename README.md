# Automated Cartoon Animation Pipeline

A web-based application that enables users to create short animated cartoon stories with minimal manual effort. The system uses artificial intelligence to generate stories, characters, and scenes, producing children-style animations similar to popular shows like Dora the Explorer or Peppa Pig. No prior animation experience, sprite design skills, or frame-by-frame animation knowledge is required.

## Screenshots

### Landing Page
![Landing Page](./public/landing-page.png)

### Creator Canvas
![Creator Canvas](./public/creator-canvas.png)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [System Requirements](#system-requirements)
4. [Installation Guide](#installation-guide)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Running the Application](#running-the-application)
8. [Project Structure](#project-structure)
9. [API Reference](#api-reference)
10. [Available Assets](#available-assets)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)
13. [Contributing](#contributing)
14. [License](#license)

---

## Overview

This application provides an end-to-end pipeline for creating animated cartoon videos. Users can describe a story idea in plain text, and the system will automatically generate a complete animated video with characters, backgrounds, narration, and scene transitions.

The pipeline consists of four main stages:
1. Story input and AI-powered story generation
2. Character and scene configuration
3. Animation rendering with automatic movements and expressions
4. Video export in multiple formats

---

## Features

### Story Creation
- AI-powered story generation using Google Gemini (primary) or OpenAI (fallback)
- Support for custom story prompts and themes
- Automatic scene breakdown with dialogue and actions

### Character and Scene Generation
- Pre-built character rigs with multiple expressions and poses
- AI-generated background images using the Imagine.art API
- Library of built-in backgrounds for common scenes

### Animation Engine
- Automatic character movement and positioning
- Expression changes synchronized with dialogue
- Smooth scene transitions (fade, slide, zoom, dissolve)
- Camera movements and keyframe-based animation

### Audio System
- Text-to-speech narration with multiple voice options
- Lip-sync animation synchronized with speech
- Support for Google Cloud TTS and ElevenLabs voice APIs
- Background music and sound effects

### Editing Tools
- Interactive scene editor for repositioning characters
- Timeline view for adjusting timing and duration
- Storyboard view for scene overview and reordering
- Undo/redo functionality for all edits

### Export Options
- Video export in WebM, MP4, and GIF formats
- Multiple quality presets (low, medium, high)
- Configurable resolution and frame rate

### Project Management
- Save and load projects to PostgreSQL database
- Project history and version management
- Share projects via unique URLs

---

## System Requirements

Before installing the application, ensure your system meets the following requirements:

### Software Requirements

| Software | Minimum Version | Purpose |
|----------|-----------------|---------|
| Node.js | 18.0.0 or higher | JavaScript runtime environment |
| npm | 9.0.0 or higher | Package manager (included with Node.js) |
| Git | 2.0.0 or higher | Version control (for cloning the repository) |
| PostgreSQL | 14.0 or higher | Database for project storage |

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4 GB | 8 GB or more |
| Storage | 500 MB | 1 GB or more |
| Internet | Required | Broadband recommended |

### Checking Your Node.js Version

Open a terminal or command prompt and run:

```bash
node --version
```

If the version displayed is below 18.0.0, download and install the latest version from https://nodejs.org/

---

## Installation Guide

Follow these steps to install and set up the application on your local machine.

### Step 1: Clone the Repository

Open a terminal or command prompt and navigate to the directory where you want to install the project. Then run:

```bash
git clone https://github.com/lazy-logic/-Automated-cartoon-animation-pipeline.git
```

After cloning, navigate into the project directory:

```bash
cd -Automated-cartoon-animation-pipeline
```

### Step 2: Install Dependencies

Install all required packages by running:

```bash
npm install
```

This command reads the package.json file and downloads all necessary dependencies. The installation may take several minutes depending on your internet connection.

### Step 3: Verify Installation

After installation completes, verify that the node_modules folder was created:

On Windows:
```bash
dir node_modules
```

On macOS/Linux:
```bash
ls node_modules
```

You should see a list of installed packages.

---

## Environment Configuration

The application requires several API keys and configuration values to function properly. These are stored in a file called `.env.local` which you must create.

### Step 1: Create the Environment File

Copy the example environment file to create your local configuration:

On Windows (Command Prompt):
```bash
copy .env.example .env.local
```

On Windows (PowerShell):
```bash
Copy-Item .env.example .env.local
```

On macOS/Linux:
```bash
cp .env.example .env.local
```

### Step 2: Obtain API Keys

You will need to obtain the following API keys:

#### Google Gemini API Key (Required - Free)

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

#### OpenAI API Key (Optional - Paid)

This is used as a fallback if the Gemini API is unavailable.

1. Visit https://platform.openai.com/api-keys
2. Sign in or create an OpenAI account
3. Click "Create new secret key"
4. Copy the generated key

Note: OpenAI requires a paid account with available credits.

#### Imagine.art API Key (Optional - For AI Backgrounds)

1. Visit https://www.imagine.art/dashboard/api
2. Sign in or create an account
3. Generate an API key from the dashboard
4. Copy the generated key

### Step 3: Configure the Environment File

Open the `.env.local` file in a text editor and replace the placeholder values with your actual API keys:

```
# AI Story Generation (at least one required)
GEMINI_API_KEY=your_actual_gemini_api_key_here
OPENAI_API_KEY=your_actual_openai_api_key_here

# AI Image Generation (optional)
IMAGINE_API_KEY=your_actual_imagine_api_key_here

# Database
DATABASE_URL=your_database_connection_string_here

# Environment
NODE_ENV=development
```

Important: Never commit the `.env.local` file to version control. It contains sensitive API keys that should remain private.

---

## Database Setup

The application uses PostgreSQL to store project data. You have two options for setting up the database.

### Option 1: Using a Cloud Database Provider (Recommended for Beginners)

Cloud database providers offer free tiers that are sufficient for development and small-scale use.

#### Using Supabase (Recommended)

1. Visit https://supabase.com and create a free account
2. Click "New Project" and fill in the project details
3. Wait for the project to be created (this may take a few minutes)
4. Go to Settings > Database
5. Find the "Connection string" section and copy the URI
6. Replace `[YOUR-PASSWORD]` in the connection string with your database password
7. Add the connection string to your `.env.local` file as `DATABASE_URL`

#### Using Neon

1. Visit https://neon.tech and create a free account
2. Create a new project
3. Copy the connection string from the dashboard
4. Add it to your `.env.local` file as `DATABASE_URL`

### Option 2: Using a Local PostgreSQL Installation

If you prefer to run PostgreSQL locally:

1. Download and install PostgreSQL from https://www.postgresql.org/download/
2. During installation, note the password you set for the postgres user
3. Create a new database:

```bash
psql -U postgres
CREATE DATABASE cartoon_studio;
\q
```

4. Add the connection string to `.env.local`:

```
DATABASE_URL=postgres://postgres:your_password@localhost:5432/cartoon_studio
```

### Initialize the Database Schema

After configuring the database connection, run the following commands to set up the database tables:

```bash
npx prisma generate
npx prisma db push
```

The first command generates the Prisma client based on the schema. The second command creates the necessary tables in your database.

To verify the database setup was successful:

```bash
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can view your database tables.

---

## Running the Application

### Development Mode

To start the application in development mode with hot-reloading:

```bash
npm run dev
```

The application will start and display output similar to:

```
> cartoon-studio@2.0.0 dev
> next dev

  - Local:        http://localhost:3000
  - Environments: .env.local

 Ready in 3.2s
```

Open your web browser and navigate to http://localhost:3000

If port 3000 is already in use, the application will automatically try ports 3001, 3002, and so on.

### Production Mode

To build and run the application in production mode:

```bash
npm run build
npm run start
```

The build command compiles the application for optimal performance. The start command runs the compiled application.

### Stopping the Application

To stop the running application, press `Ctrl + C` in the terminal where it is running.

---

## Project Structure

Understanding the project structure helps when making modifications or troubleshooting issues.

```
project-root/
|
|-- app/                          # Next.js application routes
|   |-- api/                      # Backend API endpoints
|   |   |-- ai-characters/        # AI character suggestion endpoint
|   |   |-- ai-status/            # Check AI service availability
|   |   |-- generate-story/       # AI story generation endpoint
|   |   |-- generate-character-art/ # AI character image generation
|   |   |-- health/               # Application health check
|   |   |-- imagine/              # Imagine.art API integration
|   |   |-- projects/             # Project CRUD operations
|   |   |   |-- [id]/             # Single project operations
|   |   |-- share/                # Project sharing endpoint
|   |   |-- tts/                  # Text-to-speech endpoints
|   |       |-- elevenlabs/       # ElevenLabs TTS integration
|   |       |-- google/           # Google Cloud TTS integration
|   |-- demo/                     # Demo page
|   |-- view/                     # Shared project viewer
|   |   |-- [id]/                 # View specific shared project
|   |-- globals.css               # Global styles
|   |-- layout.tsx                # Root layout component
|   |-- page.tsx                  # Main application page
|
|-- components/                   # React UI components
|   |-- AnimatedCharacter.tsx     # Character animation component
|   |-- AnimationStage.tsx        # Main animation canvas
|   |-- CameraKeyframeEditor.tsx  # Camera movement editor
|   |-- CharacterCreatorModal.tsx # Character creation dialog
|   |-- EnhancedTimeline.tsx      # Timeline with advanced features
|   |-- InteractiveSceneEditor.tsx # Scene editing interface
|   |-- PlaybackViewer.tsx        # Animation playback component
|   |-- SceneEditor.tsx           # Scene configuration panel
|   |-- StoryGenerator.tsx        # Story creation wizard
|   |-- StoryboardView.tsx        # Storyboard overview
|   |-- Timeline.tsx              # Basic timeline component
|   |-- VideoExporter.tsx         # Video export dialog
|   |-- ... (additional components)
|
|-- lib/                          # Utility libraries and services
|   |-- ai-service.ts             # AI integration service
|   |-- ai-story-generator.ts     # Story generation logic
|   |-- animation-engine.ts       # Animation system
|   |-- audio-manager.ts          # Audio playback management
|   |-- camera-system.ts          # Camera controls
|   |-- character-creator.ts      # Character generation
|   |-- cloud-tts.ts              # Text-to-speech service
|   |-- lip-sync.ts               # Lip synchronization
|   |-- scene-transitions.ts      # Transition effects
|   |-- store.ts                  # Application state (Zustand)
|   |-- types.ts                  # TypeScript type definitions
|   |-- video-export-engine.ts    # Video rendering engine
|   |-- ... (additional utilities)
|
|-- prisma/                       # Database configuration
|   |-- schema.prisma             # Database schema definition
|   |-- migrations/               # Database migration files
|
|-- public/                       # Static assets
|   |-- (character SVG files)     # Character sprite images
|
|-- .env.example                  # Example environment variables
|-- .env.local                    # Local environment variables (not in git)
|-- .gitignore                    # Git ignore rules
|-- next.config.mjs               # Next.js configuration
|-- package.json                  # Project dependencies
|-- tailwind.config.js            # Tailwind CSS configuration
|-- tsconfig.json                 # TypeScript configuration
```

---

## API Reference

The application exposes several REST API endpoints for integration and automation.

### Health Check

Check the application status and service availability.

```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "database": "connected",
  "ai": {
    "gemini": true,
    "openai": false
  }
}
```

### AI Status

Check which AI services are available.

```
GET /api/ai-status
```

Response:
```json
{
  "gemini": true,
  "openai": false,
  "imagine": true
}
```

### Generate Story

Generate an AI-powered story from a prompt.

```
POST /api/generate-story
Content-Type: application/json

{
  "prompt": "A brave mouse who wants to become a knight",
  "theme": "adventure",
  "duration": "short"
}
```

Response:
```json
{
  "title": "Sir Squeaks the Brave",
  "scenes": [
    {
      "id": "scene-1",
      "title": "The Dream",
      "narration": "Once upon a time...",
      "characters": ["mouse"],
      "background": "castle",
      "duration": 5000
    }
  ]
}
```

### Projects

#### List All Projects

```
GET /api/projects
```

#### Get Specific Project

```
GET /api/projects/{id}
```

#### Save Project

```
POST /api/projects
Content-Type: application/json

{
  "id": "optional-existing-id",
  "title": "My Animation",
  "scenes": [...],
  "characters": [...]
}
```

#### Delete Project

```
DELETE /api/projects/{id}
```

### AI Image Generation

Generate background images using AI.

```
POST /api/imagine
Content-Type: application/json

{
  "prompt": "magical forest with glowing mushrooms",
  "style": "cartoon",
  "aspectRatio": "16:9"
}
```

---

## Available Assets

### Built-in Characters

The application includes the following pre-built character rigs:

| Character | Description |
|-----------|-------------|
| Luna | Girl with brown hair |
| Max | Boy with spiky hair |
| Emma | Girl with pigtails |
| Whiskers | Orange cat |
| Buddy | Brown dog |
| Cotton | White rabbit |
| Milo | Gray mouse |
| Coco | Brown monkey |
| Pip | Yellow bird |
| Ruby | Red fox |
| Oliver | Brown owl |
| Daisy | White cow |
| Felix | Black cat |
| Bella | Brown bear |
| Charlie | Tan hamster |
| Rosie | Pink pig |

### Built-in Backgrounds

| Background | Description |
|------------|-------------|
| Meadow | Green grass field with flowers |
| Forest | Trees and woodland setting |
| Beach | Sandy shore with ocean |
| Night | Starry night sky |
| Bedroom | Child's bedroom interior |
| Park | Public park with playground |
| Castle | Medieval castle exterior |
| Space | Outer space with stars |
| Underwater | Ocean floor with coral |
| Mountain | Mountain landscape |
| City | Urban cityscape |
| Farm | Farmhouse with barn |
| Playground | School playground |
| Library | Library interior |
| Kitchen | Home kitchen interior |
| Garden | Flower garden |

### Character Actions

Characters can perform the following actions:

Idle, Walk, Run, Wave, Dance, Jump, Talk, Surprised, Sit, Sleep, Eat, Read, Play, Think, Laugh, Cry, Hug, Point, Clap, Spin

---

## Deployment

### Deploying to Vercel (Recommended)

Vercel provides the easiest deployment experience for Next.js applications.

1. Create an account at https://vercel.com

2. Install the Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

3. Push your code to a GitHub repository

4. In the Vercel dashboard:
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - GEMINI_API_KEY
     - OPENAI_API_KEY (optional)
     - IMAGINE_API_KEY (optional)
     - DATABASE_URL
   - Click "Deploy"

5. Vercel will automatically build and deploy your application

### Deploying to Netlify

1. Create an account at https://netlify.com

2. In the Netlify dashboard:
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables in Site settings > Environment variables
   - Click "Deploy"

### Deploying to Railway

1. Create an account at https://railway.app

2. Create a new project and select "Deploy from GitHub repo"

3. Select your repository

4. Add environment variables in the Variables tab

5. Railway will automatically detect Next.js and deploy

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "npm install" fails with permission errors

Solution: On Windows, run Command Prompt or PowerShell as Administrator. On macOS/Linux, avoid using sudo with npm. Instead, fix npm permissions:

```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

#### Issue: "ENOENT: no such file or directory" for .env.local

Solution: Create the .env.local file by copying the example:

```bash
cp .env.example .env.local
```

#### Issue: Database connection fails

Solutions:
1. Verify your DATABASE_URL is correct in .env.local
2. Ensure your database server is running
3. Check that the database user has proper permissions
4. For cloud databases, verify IP whitelisting if required

#### Issue: "Invalid API key" errors

Solutions:
1. Verify the API key is copied correctly without extra spaces
2. Check that the key is active in the provider's dashboard
3. Ensure the key has not expired or been revoked

#### Issue: Port 3000 is already in use

Solution: Either stop the process using port 3000, or start the application on a different port:

```bash
npm run dev -- -p 3001
```

#### Issue: Build fails with TypeScript errors

Solution: Run the following command to check for type errors:

```bash
npx tsc --noEmit
```

Review and fix any reported errors before building again.

#### Issue: Prisma client not generated

Solution: Run the Prisma generate command:

```bash
npx prisma generate
```

### Getting Help

If you encounter issues not covered here:

1. Check the existing GitHub issues for similar problems
2. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Error messages (if any)
   - Your environment (OS, Node version, etc.)

---

## Contributing

Contributions to this project are welcome. Please follow these guidelines:

### Reporting Bugs

1. Search existing issues to avoid duplicates
2. Create a new issue with the "bug" label
3. Include reproduction steps and error messages

### Suggesting Features

1. Create a new issue with the "enhancement" label
2. Describe the feature and its use case
3. Discuss implementation approach if applicable

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear commit messages
4. Ensure all tests pass: `npm run lint`
5. Submit a pull request

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Add comments for complex logic
- Update documentation for API changes

---

## License

This project is licensed under the MIT License.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
