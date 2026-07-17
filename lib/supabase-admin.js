import { createClient } from '@supabase/supabase-js';

const globalForSupabase = globalThis;

export const supabaseAdmin = new Proxy({}, {
  get(target, prop) {
    if (!globalForSupabase.supabaseAdmin) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        const msg = `
============================================================
🚨 CRITICAL ERROR: MISSING SUPABASE ENVIRONMENT VARIABLES 🚨
============================================================
You are missing the 'SUPABASE_SERVICE_ROLE_KEY' in your .env file!

To fix this immediately:
1. Go to your Supabase Dashboard -> Project Settings -> API.
2. Find the 'Project API keys' section.
3. Copy the 'service_role' (secret) key.
4. Open your .env file and add this line:
   SUPABASE_SERVICE_ROLE_KEY=your_copied_secret_key_here
5. Restart your server (Ctrl+C, then npm run dev).
============================================================
`;
        console.error(msg);
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in .env file');
      }

      globalForSupabase.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
    return globalForSupabase.supabaseAdmin[prop];
  }
});
