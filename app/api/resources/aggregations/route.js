import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Fetch only the necessary fields to compute aggregations across all approved resources.
    const { data: dbResources, error } = await supabaseAdmin
      .from('resources')
      .select('category:categories!inner(slug), resource_tags(tag:tags(name))')
      .in('status', ['APPROVED', 'FEATURED']);

    if (error) throw error;

    const categoryCounts = {};
    const tagCounts = {};
    let totalCount = 0;

    (dbResources || []).forEach(r => {
      totalCount++;
      
      // Category count
      if (r.category && r.category.slug) {
        categoryCounts[r.category.slug] = (categoryCounts[r.category.slug] || 0) + 1;
      }
      
      // Tag count
      if (r.resource_tags) {
        r.resource_tags.forEach(rt => {
          if (rt.tag && rt.tag.name) {
            tagCounts[rt.tag.name] = (tagCounts[rt.tag.name] || 0) + 1;
          }
        });
      }
    });

    return NextResponse.json({ 
      categoryCounts, 
      tagCounts,
      totalCount
    });
  } catch (error) {
    console.error('Aggregations API error:', error);
    return NextResponse.json({ categoryCounts: {}, tagCounts: {}, totalCount: 0, error: error.message }, { status: 500 });
  }
}
