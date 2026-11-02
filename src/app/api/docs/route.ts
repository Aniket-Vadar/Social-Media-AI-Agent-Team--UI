import { NextResponse } from 'next/server';

const BACKEND_DOCS_URL =
  process.env.NEXT_PUBLIC_BACKEND_DOCS_URL ||
  'https://social-media-ai-agent-team-backend.onrender.com/docs';

export async function GET() {
  return NextResponse.redirect(BACKEND_DOCS_URL);
}

