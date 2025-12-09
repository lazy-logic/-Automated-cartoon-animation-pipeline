import { NextRequest, NextResponse } from 'next/server';
import { generateAIStory } from '@/lib/ai-service';
import { AIStoryRequest } from '@/lib/ai-types';

export async function POST(request: NextRequest) {
  try {
    const body: AIStoryRequest = await request.json();

    // Validate request
    if (!body.prompt && !body.genre) {
      return NextResponse.json(
        { error: 'Please provide a prompt or genre' },
        { status: 400 }
      );
    }

    // Generate story with AI
    const story = await generateAIStory({
      prompt: body.prompt || '',
      genre: body.genre,
      characters: body.characters,
      sceneCount: body.sceneCount || 3,
      targetAudience: body.targetAudience || 'child',
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate story', details: String(error) },
      { status: 500 }
    );
  }
}
