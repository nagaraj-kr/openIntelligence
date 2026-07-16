import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
    const { data: category } = await supabaseAdmin.from('categories').select('id').eq('slug', categorySlug).single();
    if (!category) return NextResponse.json({ error: 'Invalid category' }, { status: 400 });

    // Get or create user profile
    let { data: profile } = await supabaseAdmin.from('users').select('id, bio').eq('id', user.id).single();
    if (profile?.bio === '__BANNED__') {
      return NextResponse.json({ error: 'Your account has been banned. You cannot submit resources.' }, { status: 403 });
    }
    if (!profile) {
      const { data: newProfile, error: profileErr } = await supabaseAdmin.from('users').insert({
        id:         user.id,
        username:   user.user_metadata?.user_name || user.email || 'user',
        full_name:  user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        role:       'CONTRIBUTOR',
      }).select().single();
      if (profileErr) throw profileErr;
      profile = newProfile;
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    let slug     = baseSlug;
    let counter  = 1;
    let isSlugTaken = true;
    while (isSlugTaken) {
      const { data: existing } = await supabaseAdmin.from('resources').select('id').eq('slug', slug).single();
      if (existing) {
        slug = `${baseSlug}-${counter++}`;
      } else {
        isSlugTaken = false;
      }
    }

    // Get or create tags manually
    const tagIds = [];
    for (const name of tags) {
      let { data: tag } = await supabaseAdmin.from('tags').select('id').eq('name', name).single();
      if (!tag) {
        const { data: newTag, error: tagErr } = await supabaseAdmin.from('tags').insert({ name }).select('id').single();
        if (!tagErr && newTag) tag = newTag;
      }
      if (tag) tagIds.push(tag.id);
    }

    // Create resource
    const { data: resource, error: resErr } = await supabaseAdmin.from('resources').insert({
      title,
      slug,
      description:         description || '',
      github_url,
      category_id:         category.id,
      contributor_id:      profile.id,
      status:              'PENDING',
      github_stars:        github_stars || 0,
      github_language:     github_language || null,
      github_last_updated: github_last_updated ? new Date(github_last_updated).toISOString() : null,
      use_case,
    }).select().single();
    
    if (resErr) throw resErr;

    // Attach tags
    if (tagIds.length > 0) {
      await supabaseAdmin.from('resource_tags').insert(
        tagIds.map(tag_id => ({ resource_id: resource.id, tag_id }))
      );
    }

    return NextResponse.json({ success: true, resource }, { status: 201 });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
