import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
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

    const { data: profile } = await supabaseAdmin.from('users').select('*').eq('id', user.id).single();
    
    // Find linked GitHub account's user ID (if they logged in with Google and linked GitHub)
    let linkedUserId = null;
    if (profile?.github_username) {
      const { data: linkedUser } = await supabaseAdmin.from('users').select('id').eq('username', profile.github_username).single();
      if (linkedUser) {
        linkedUserId = linkedUser.id;
      }
    }
    const userIdsToSearch = [user.id];
    if (linkedUserId) userIdsToSearch.push(linkedUserId);

    // Get emails to search for meetings
    const emailsToSearch = [user.email];
    if (profile?.alternate_email) {
      emailsToSearch.push(profile.alternate_email);
    }

    const [resourcesRes, registrationsRes] = await Promise.all([
      supabaseAdmin.from('resources').select('*, category:categories(*), resource_tags(tag:tags(*))').in('contributor_id', userIdsToSearch).order('created_at', { ascending: false }),
      supabaseAdmin.from('event_registrations').select('*').in('email', emailsToSearch)
    ]);

    const resources = (resourcesRes.data || []).map(r => ({
      ...r,
      tags: r.resource_tags || []
    }));

    // Manually join meetings since there's no FK constraint
    let attendedMeetings = [];
    const registrations = registrationsRes.data || [];
    if (registrations.length > 0) {
      const meetingIds = registrations.map(r => r.meeting_id);
      const { data: meetingsData } = await supabaseAdmin.from('meetings').select('*').in('id', meetingIds).order('date', { ascending: false });
      
      // Fix timezone 'Z' issue
      const fixedMeetings = (meetingsData || []).map(m => ({
        ...m,
        date: m.date.endsWith('Z') ? m.date : m.date + 'Z'
      }));

      // Combine registration data with meeting data
      attendedMeetings = registrations.map(reg => {
        const meeting = fixedMeetings.find(m => m.id === reg.meeting_id);
        return { ...reg, meeting };
      }).filter(r => r.meeting); // Only keep ones where meeting exists
    }

    return NextResponse.json({ profile, resources, attended_meetings: attendedMeetings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
