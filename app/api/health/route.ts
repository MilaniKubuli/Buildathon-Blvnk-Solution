import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    framework: 'Next.js 15 App Router',
    hasGroqKey: Boolean(process.env.GROQ_API_KEY),
    groqModel: process.env.GROQ_MODEL || 'qwen-2.5-32b',
    hasNeonDb: Boolean(process.env.NEON_CONNECTION_STRING),
    hasCloudTranslateKey: Boolean(process.env.CLOUD_TRANSLATE_API_KEY),
    hasHfToken: Boolean(process.env.HF_API_TOKEN),
    nllbModel: process.env.NLLB_MODEL || 'facebook/nllb-200-distilled-600M',
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    timestamp: new Date().toISOString(),
  });
}
