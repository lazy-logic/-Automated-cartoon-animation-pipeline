import { NextRequest, NextResponse } from 'next/server';

/**
 * Google Cloud Text-to-Speech API Route
 * Converts text to speech using Google Cloud TTS
 */

interface TTSRequestBody {
  text: string;
  voiceName?: string;
  languageCode?: string;
  ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  speakingRate?: number;
  pitch?: number;
}

// Predefined kid-friendly voices
const VOICE_PRESETS: Record<string, { name: string; languageCode: string; ssmlGender: string }> = {
  'en-us-wavenet-f': { name: 'en-US-Wavenet-F', languageCode: 'en-US', ssmlGender: 'FEMALE' },
  'en-us-wavenet-d': { name: 'en-US-Wavenet-D', languageCode: 'en-US', ssmlGender: 'MALE' },
  'en-us-wavenet-a': { name: 'en-US-Wavenet-A', languageCode: 'en-US', ssmlGender: 'MALE' },
  'en-us-wavenet-c': { name: 'en-US-Wavenet-C', languageCode: 'en-US', ssmlGender: 'FEMALE' },
  'en-us-standard-c': { name: 'en-US-Standard-C', languageCode: 'en-US', ssmlGender: 'FEMALE' },
  'en-us-standard-d': { name: 'en-US-Standard-D', languageCode: 'en-US', ssmlGender: 'MALE' },
  // Neural2 voices (higher quality)
  'en-us-neural2-c': { name: 'en-US-Neural2-C', languageCode: 'en-US', ssmlGender: 'FEMALE' },
  'en-us-neural2-d': { name: 'en-US-Neural2-D', languageCode: 'en-US', ssmlGender: 'MALE' },
  // Kids-friendly mapping
  'luna-voice': { name: 'en-US-Wavenet-F', languageCode: 'en-US', ssmlGender: 'FEMALE' },
  'max-voice': { name: 'en-US-Wavenet-D', languageCode: 'en-US', ssmlGender: 'MALE' },
  'narrator': { name: 'en-US-Neural2-C', languageCode: 'en-US', ssmlGender: 'FEMALE' },
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Cloud TTS API key not configured', code: 'NO_API_KEY' },
        { status: 503 }
      );
    }

    const body: TTSRequestBody = await request.json();
    const {
      text,
      voiceName = 'en-us-wavenet-f',
      languageCode = 'en-US',
      ssmlGender = 'FEMALE',
      speakingRate = 1.0,
      pitch = 0,
    } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Resolve voice preset or use custom settings
    const voicePreset = VOICE_PRESETS[voiceName.toLowerCase()];
    const voice = voicePreset
      ? {
          name: voicePreset.name,
          languageCode: voicePreset.languageCode,
          ssmlGender: voicePreset.ssmlGender,
        }
      : {
          name: voiceName,
          languageCode,
          ssmlGender,
        };

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: text.slice(0, 5000) }, // Limit text length
          voice,
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: Math.max(0.25, Math.min(4.0, speakingRate)),
            pitch: Math.max(-20, Math.min(20, pitch)),
            effectsProfileId: ['small-bluetooth-speaker-class-device'], // Optimized for clarity
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Cloud TTS error:', response.status, errorData);

      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Google Cloud TTS not authorized', code: 'UNAUTHORIZED' },
          { status: 403 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Google Cloud TTS failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    if (!audioContent) {
      return NextResponse.json(
        { error: 'No audio content returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audio: audioContent,
      contentType: 'audio/mpeg',
      voice: voice.name,
    });
  } catch (error) {
    console.error('Google Cloud TTS error:', error);
    return NextResponse.json(
      { error: 'TTS generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to list available voices
export async function GET() {
  const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      available: false,
      voices: Object.keys(VOICE_PRESETS),
    });
  }

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}`
    );

    if (!response.ok) {
      return NextResponse.json({
        available: true,
        voices: Object.keys(VOICE_PRESETS),
      });
    }

    const data = await response.json();
    const voices = data.voices
      ?.filter((v: any) => v.languageCodes?.includes('en-US'))
      ?.map((v: any) => ({
        name: v.name,
        gender: v.ssmlGender,
        languageCodes: v.languageCodes,
      }))
      .slice(0, 20) || [];

    return NextResponse.json({
      available: true,
      voices,
    });
  } catch (error) {
    return NextResponse.json({
      available: false,
      voices: Object.keys(VOICE_PRESETS),
      error: String(error),
    });
  }
}
