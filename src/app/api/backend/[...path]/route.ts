import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://social-media-ai-agent-team-backend.onrender.com';

async function forwardRequest(req: NextRequest, { params }: { params: { path: string[] } }) {
  const targetPath = params.path ? params.path.join('/') : '';
  const url = new URL(req.url);
  const targetUrl = `${BACKEND_BASE}/${targetPath}${url.search}`;

  const incomingHeaders = Object.fromEntries(req.headers.entries());
  delete incomingHeaders['host'];
  delete incomingHeaders['connection'];
  delete incomingHeaders['content-length'];

  // Add default tenant context if missing
  if (!incomingHeaders['x-workspace-id']) {
    incomingHeaders['x-workspace-id'] = '00000000-0000-0000-0000-000000000001';
  }
  if (!incomingHeaders['x-user-id']) {
    incomingHeaders['x-user-id'] = '00000000-0000-0000-0000-000000000001';
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: incomingHeaders,
    cache: 'no-store',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.arrayBuffer();
    fetchOptions.body = body;
  }

  try {
    const upstreamRes = await fetch(targetUrl, fetchOptions);

    // If SSE streaming
    const contentType = upstreamRes.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream')) {
      return new NextResponse(upstreamRes.body, {
        status: upstreamRes.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    const data = await upstreamRes.arrayBuffer();
    const resHeaders = new Headers();
    upstreamRes.headers.forEach((val, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        resHeaders.set(key, val);
      }
    });

    return new NextResponse(data, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BACKEND_GATEWAY_ERROR',
          message: error.message || 'Failed to reach upstream AI Agent service.',
        },
      },
      { status: 502 }
    );
  }
}

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PATCH = forwardRequest;
export const PUT = forwardRequest;
export const DELETE = forwardRequest;

