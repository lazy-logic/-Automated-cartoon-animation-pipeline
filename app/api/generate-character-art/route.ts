import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface GenerateCharacterArtBody {
  name: string;
  description?: string;
  styleHint?: string;
}

export async function POST(request: NextRequest) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    const body: GenerateCharacterArtBody = await request.json();
    const name = body.name?.trim();
    const description = body.description?.trim() || '';
    const styleHint =
      body.styleHint?.trim() ||
      'cute colourful 2D cartoon character, thick outlines, flat shading, kid-friendly, simple shapes';

    if (!name) {
      return NextResponse.json(
        { error: 'Missing character name' },
        { status: 400 }
      );
    }

    const prompt = `Cute 2D cartoon character portrait of ${name}. ${description}. ${styleHint}. Centered, pastel plain background.`;

    let lastError: unknown = null;

    // Try Gemini first, if configured
    if (geminiKey) {
      try {
        const client = new GoogleGenAI({ apiKey: geminiKey });
        const result = await client.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt,
          config: {
            numberOfImages: 1,
          },
        });

        const generated = (result as any)?.generatedImages?.[0];
        const imageBytes = generated?.image?.imageBytes as string | undefined;

        if (imageBytes) {
          return NextResponse.json({ imageBase64: imageBytes });
        }

        lastError = new Error('No image returned from Gemini');
      } catch (error) {
        console.error('Gemini character art generation failed, will try OpenAI if available:', error);
        lastError = error;
      }
    }

    // Fallback to OpenAI images API if configured
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt,
            size: '1024x1024',
            n: 1,
          }),
        });

        if (!response.ok) {
          let message = 'Image generation failed';
          try {
            const errJson = await response.json();
            const openaiError = errJson?.error;
            if (openaiError?.code === 'billing_hard_limit_reached') {
              message = 'Image generation is disabled because the OpenAI billing limit has been reached.';
            } else if (typeof openaiError?.message === 'string') {
              message = openaiError.message;
            }
          } catch {
            // ignore parse errors
          }
          throw new Error(message);
        }

        const data = await response.json();
        const url = data?.data?.[0]?.url as string | undefined;

        if (!url) {
          throw new Error('OpenAI did not return an image URL');
        }

        return NextResponse.json({ imageUrl: url });
      } catch (error) {
        console.error('OpenAI character art generation failed:', error);
        lastError = error;
      }
    }

    // No providers configured
    if (!geminiKey && !openaiKey) {
      return NextResponse.json(
        { error: 'No image provider configured (missing GEMINI_API_KEY and OPENAI_API_KEY).' },
        { status: 500 }
      );
    }

    const message =
      typeof lastError === 'object' && lastError && 'message' in lastError && (lastError as any).message
        ? (lastError as any).message
        : 'Failed to generate character art with all providers.';

    return NextResponse.json(
      { error: message },
      { status: 502 }
    );
  } catch (error) {
    console.error('Character art generation error:', error);

    let message = 'Failed to generate character art';
    if (typeof error === 'object' && error && 'message' in error) {
      const err = error as { message?: string }; 
      if (err.message) {
        message = err.message;
      }
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
