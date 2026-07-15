import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const buffer = Buffer.from('test image content');
  const filename = 'test-upload-' + Date.now() + '.txt';

  const { data, error } = await supabase
    .storage
    .from('events')
    .upload(filename, buffer, {
      contentType: 'text/plain',
      upsert: false
    });

  return NextResponse.json({ uploadData: data, error: error ? error.message : null });
}
