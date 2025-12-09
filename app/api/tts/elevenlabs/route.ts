import { NextRequest, NextResponse } from 'next/server';

/**
 * ElevenLabs Text-to-Speech API Route
 * Converts text to speech using ElevenLabs API
 */

interface TTSRequestBody {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

// ElevenLabs voice IDs mapping
const VOICE_MAP: Record<string, string> = {
  rachel: '21m00Tcm4TlvDq8ikWAM',
  josh: 'TxGEqnHWrfWFTfGW9XjX',
  bella: 'EXAVITQu4vr4xnSDxMaL',
  adam: 'pNInz6obpgDQGcFmaJgB',
  sam: 'yoZ06aMxZJJ28mfd3POQ',
  emily: 'LcfcDJNUP1GQjkzn1xUU',
  thomas: 'GBv7mTt0atIp3Br8iCZE',
  charlie: 'IKne3meq5aSn9XLyUdCD',
  // Default kids-friendly voices
  'luna-voice': '21m00Tcm4TlvDq8ikWAM',
  'max-voice': 'TxGEqnHWrfWFTfGW9XjX',
  'narrator': 'EXAVITQu4vr4xnSDxMaL',
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured', code: 'NO_API_KEY' },
        { status: 503 }
      );
    }

    const body: TTSRequestBody = await request.json();
    const { text, voiceId = 'rachel', modelId = 'eleven_monolingual_v1', stability = 0.5, similarityBoost = 0.75 } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Resolve voice ID from name or use directly
    const resolvedVoiceId = VOICE_MAP[voiceId.toLowerCase()] || voiceId;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text.slice(0, 5000), // Limit text length
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid ElevenLabs API key', code: 'INVALID_API_KEY' },
          { status: 401 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'ElevenLabs TTS failed', details: errorText },
        { status: response.status }
      );
    }

    // Get the audio buffer
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      audio: base64Audio,
      contentType: 'audio/mpeg',
      voiceId: resolvedVoiceId,
    });
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return NextResponse.json(
      { error: 'TTS generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to list available voices
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      available: false,
      voices: Object.keys(VOICE_MAP),
    });
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        available: true,
        voices: Object.keys(VOICE_MAP),
      });
    }

    const data = await response.json();
    const voices = data.voices?.map((v: any) => ({
      id: v.voice_id,
      name: v.name,
      category: v.category,
    })) || [];

    return NextResponse.json({
      available: true,
      voices,
    });
  } catch (error) {
    return NextResponse.json({
      available: false,
      voices: Object.keys(VOICE_MAP),
      error: String(error),
    });
  }
}
