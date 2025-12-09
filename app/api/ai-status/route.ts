import { NextResponse } from 'next/server';

export async function GET() {
  const gemini = !!process.env.GEMINI_API_KEY;
  const openai = !!process.env.OPENAI_API_KEY;

  return NextResponse.json({
    gemini,
    openai,
    any: gemini || openai,
  });
}
