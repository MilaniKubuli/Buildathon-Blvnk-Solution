import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    framework: 'Next.js 15 App Router',
    hasGroqKey: Boolean(process.env.GROQ_API_KEY),
    groqModel: process.env.GROQ_MODEL || 'qwen-2.5-32b',
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
    timestamp: new Date().toISOString(),
  });
}
