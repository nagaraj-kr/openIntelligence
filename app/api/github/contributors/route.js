import { NextResponse } from 'next/server';
import { buildResourceContributors } from '@/lib/githubContributors';

// No ISR revalidate in dev — always fresh
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await buildResourceContributors();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[GET /api/github/contributors]', err.message);
    return NextResponse.json({
      resources:  [],
      leaderboard: [],
      summary:    { total_resources: 0, total_forks: 0, unique_forkers: 0 },
      error:      err.message,
    });
  }
}
