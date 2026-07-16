import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || 'all';
  const sort     = searchParams.get('sort')      || 'newest';
  const page     = parseInt(searchParams.get('page')  || '1');
  const limit    = parseInt(searchParams.get('limit') || '12');
  const skip     = (page - 1) * limit;

  try {
    // Build where clause
    const where = {
      status: { in: ['APPROVED', 'FEATURED'] },
      NOT: {
        contributor: { bio: '__BANNED__' }
      },
      ...(search && {
        OR: [
          { title:       { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { use_case:    { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category !== 'all' && {
        category: { slug: category },
      }),
    };

    // Build orderBy
    const orderBy =
      sort === 'stars'    ? { github_stars: 'desc' }  :
      sort === 'featured' ? { status: 'asc' }          :
                            { created_at: 'desc' };

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        include: {
          category:    true,
          contributor: { select: { username: true, avatar_url: true } },
          tags:        { include: { tag: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.resource.count({ where }),
    ]);

    return NextResponse.json({ resources, total, page, limit });
  } catch (error) {
    console.error('Resources API error:', error);
    return NextResponse.json({ resources: [], total: 0, error: error.message }, { status: 500 });
  }
}
