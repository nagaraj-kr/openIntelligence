import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.]/g, '');
    
    // Upload to Supabase Storage
    let { data: uploadData, error } = await supabaseAdmin
      .storage
      .from('events') // We use an 'events' bucket
      .upload(filename, file, {
        contentType: file.type,
        upsert: false
      });

    // Fallback: If bucket doesn't exist, try creating it
    if (error && error.message.includes('bucket') && error.message.includes('not found')) {
      await supabaseAdmin.storage.createBucket('events', { public: true });
      const retry = await supabaseAdmin.storage.from('events').upload(filename, file, { contentType: file.type, upsert: false });
      error = retry.error;
      uploadData = retry.data;
    }

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from('events')
      .getPublicUrl(filename);

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
