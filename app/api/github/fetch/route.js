import { NextResponse } from 'next/server';
import { fetchGitHubRepo } from '@/lib/github';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'GitHub URL is required' }, { status: 400 });
  }

  try {
    const data = await fetchGitHubRepo(url);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
