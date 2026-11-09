import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-zernio-key') ||
      process.env.ZERNIO_API_KEY ||
      process.env.NEXT_PUBLIC_ZERNIO_API_KEY;

    if (apiKey && !apiKey.includes('demo')) {
      try {
        const res = await fetch('https://zernio.com/api/v1/accounts', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fallback below
      }
    }

    return NextResponse.json([
      {
        id: 'acc_ig_9921',
        platform: 'instagram',
        accountHandle: '@socialix_creative',
        displayName: 'Socialix Creative Studio',
        avatarUrl: '/images/socialix-avatar.png',
        status: 'active',
        connectedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'acc_tt_4412',
        platform: 'tiktok',
        accountHandle: '@socialix.ai',
        displayName: 'Socialix AI',
        status: 'active',
        connectedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'acc_li_1190',
        platform: 'linkedin',
        accountHandle: 'company/socialix-agent-office',
        displayName: 'Socialix AI Agent Office',
        status: 'active',
        connectedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'acc_yt_8801',
        platform: 'youtube',
        accountHandle: '@SocialixAI',
        displayName: 'Socialix AI Studio',
        status: 'active',
        connectedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

