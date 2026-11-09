import { NextRequest, NextResponse } from 'next/server';
import { Zernio } from '@zernio/node';

export async function GET(req: NextRequest) {
  try {
    const apiKey =
      req.headers.get('x-zernio-key') ||
      process.env.ZERNIO_API_KEY ||
      process.env.NEXT_PUBLIC_ZERNIO_API_KEY;

    if (apiKey) {
      try {
        const client = new Zernio({ apiKey });
        const res = await client.accounts.listAccounts().catch(() => null);
        const liveAccounts = (res as any)?.data?.accounts;

        if (Array.isArray(liveAccounts) && liveAccounts.length > 0) {
          const normalized = liveAccounts.map((a: any) => ({
            id: a._id || a.id,
            platform: a.platform,
            accountHandle: a.username ? `@${a.username}` : (a.accountHandle || ''),
            displayName: a.displayName || a.username || 'Connected Account',
            avatarUrl: a.profilePicture || a.avatarUrl || '/images/socialix-avatar.png',
            status: a.isActive !== false ? 'active' : 'disconnected',
            connectedAt: a.createdAt || new Date().toISOString(),
          }));

          // Complement with other social channel stubs if not yet linked
          const defaultChannels = [
            { platform: 'tiktok', accountHandle: '@socialix.ai', displayName: 'TikTok Studio' },
            { platform: 'youtube', accountHandle: '@SocialixAI', displayName: 'YouTube Studio' },
          ];

          for (const ch of defaultChannels) {
            if (!normalized.some((n: any) => n.platform === ch.platform)) {
              normalized.push({
                id: `stub_${ch.platform}`,
                platform: ch.platform,
                accountHandle: ch.accountHandle,
                displayName: ch.displayName,
                avatarUrl: '',
                status: 'disconnected',
                connectedAt: new Date().toISOString(),
              });
            }
          }

          return NextResponse.json(normalized);
        }
      } catch (err) {
        console.warn('Zernio SDK accounts note:', err);
      }
    }

    // Default mock accounts if user has not yet connected social profiles on Zernio dashboard
    return NextResponse.json([
      {
        id: 'acc_ig_9921',
        platform: 'instagram',
        accountHandle: '@itsidealcoder',
        displayName: 'itsidealcoder',
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
