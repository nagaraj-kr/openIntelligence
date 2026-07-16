import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { github_url, categorySlug, tags = [], use_case, title, description, github_stars, github_language, github_last_updated } = body;

    if (!github_url || !categorySlug || !use_case || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get category
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) return NextResponse.json({ error: 'Invalid category' }, { status: 400 });

    // Get or create user profile
    let profile = await prisma.user.findUnique({ where: { id: user.id } });
    if (profile?.bio === '__BANNED__') {
      return NextResponse.json({ error: 'Your account has been banned. You cannot submit resources.' }, { status: 403 });
    }
    if (!profile) {
      profile = await prisma.user.create({
        data: {
          id:         user.id,
          username:   user.user_metadata?.user_name || user.email || 'user',
          full_name:  user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          role:       'CONTRIBUTOR',
        },
      });
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    let slug     = baseSlug;
    let counter  = 1;
    while (await prisma.resource.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Get or create tags
    const tagRecords = await Promise.all(
      tags.map((name) =>
        prisma.tag.upsert({
          where:  { name },
          update: {},
          create: { name },
        })
      )
    );

    // Create resource
    const resource = await prisma.resource.create({
      data: {
        title,
        slug,
        description:         description || '',
        github_url,
        category_id:         category.id,
        contributor_id:      profile.id,
        status:              'PENDING',
        github_stars:        github_stars || 0,
        github_language:     github_language || null,
        github_last_updated: github_last_updated ? new Date(github_last_updated) : null,
        use_case,
        tags: {
          create: tagRecords.map((tag) => ({ tag_id: tag.id })),
        },
      },
    });

    return NextResponse.json({ success: true, resource }, { status: 201 });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
