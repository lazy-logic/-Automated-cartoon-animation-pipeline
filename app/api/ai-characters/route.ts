import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface AICharactersRequestBody {
  storyType?: string;
  prompt?: string;
  maxCharacters?: number;
}

interface AICharacterSuggestion {
  id: string; // should match one of the known character ids
  name: string;
  description: string;
}

interface AICharactersResponseBody {
  characters: AICharacterSuggestion[];
}

const AVAILABLE_CHARACTER_IDS = ['Luna', 'Max', 'Whiskers'];

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 },
      );
    }

    const body: AICharactersRequestBody = await request.json();
    const storyType = body.storyType || 'adventure';
    const idea = body.prompt || `A ${storyType} story for young children`;
    const maxCharacters = body.maxCharacters && body.maxCharacters > 0 && body.maxCharacters <= 3
      ? body.maxCharacters
      : 2;

    const systemPrompt = `You are helping design a small cast of characters for a kids' cartoon studio.
You must only use these character ids, which map to existing 2D rigs:
- Luna: curious, brave human child
- Max: friendly, adventurous human child
- Whiskers: playful cat sidekick

CRITICAL: Return ONLY valid JSON. No markdown, no backticks, no extra text.
Use double quotes only. No trailing commas. No special characters.

JSON format (follow exactly):
{"characters":[{"id":"Luna","name":"Luna","description":"Short role description"}]}

Pick ${maxCharacters} distinct characters that best fit the story idea.`;

    const userPrompt = `Story type: ${storyType}\nStory idea: ${idea}`;

    const client = new GoogleGenAI({ apiKey });

    const result = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\n${userPrompt}`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    });

    const text = (result as any).text as string | undefined;

    if (!text) {
      return NextResponse.json(
        { error: 'No response from Gemini for character suggestions' },
        { status: 502 },
      );
    }

    let parsed: AICharactersResponseBody | null = null;

    try {
      let clean = text.trim();
      if (clean.startsWith('```json')) {
        clean = clean.slice(7);
      } else if (clean.startsWith('```')) {
        clean = clean.slice(3);
      }
      if (clean.endsWith('```')) {
        clean = clean.slice(0, -3);
      }
      clean = clean.trim();

      // Try to extract the first JSON object block if extra text is present
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        clean = clean.slice(firstBrace, lastBrace + 1);
      }
      
      // Remove trailing commas before closing brackets
      clean = clean.replace(/,(\s*[\]}])/g, '$1');

      parsed = JSON.parse(clean) as AICharactersResponseBody;
    } catch (error) {
      console.error('Failed to parse AI character suggestions, falling back to defaults:', error, text);

      const fallback: AICharacterSuggestion[] = AVAILABLE_CHARACTER_IDS.slice(0, maxCharacters).map((id) => ({
        id,
        name: id,
        description: `A fun ${id} character for this story`,
      }));

      return NextResponse.json({ characters: fallback });
    }

    const safeCharacters: AICharacterSuggestion[] = Array.isArray(parsed?.characters)
      ? parsed!.characters
          .map((c) => {
            const id = AVAILABLE_CHARACTER_IDS.includes(c.id) ? c.id : AVAILABLE_CHARACTER_IDS[0];
            return {
              id,
              name: c.name && c.name.trim() ? c.name.trim() : id,
              description:
                c.description && c.description.trim()
                  ? c.description.trim()
                  : `A fun ${id} character for this story` ,
            };
          })
          .slice(0, maxCharacters)
      : [];

    if (!safeCharacters.length) {
      // Fallback: simple default cast
      const fallback: AICharacterSuggestion[] = [
        {
          id: 'Luna',
          name: 'Luna',
          description: 'Curious and brave main character for this story.',
        },
      ];
      return NextResponse.json({ characters: fallback });
    }

    return NextResponse.json({ characters: safeCharacters });
  } catch (error) {
    console.error('AI character suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI character suggestions' },
      { status: 500 },
    );
  }
}
