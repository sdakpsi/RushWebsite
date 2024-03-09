import { createClient } from '@/utils/supabase/server'; // Ensure this points to your server-side Supabase client
import { NextRequest, NextResponse } from 'next/server';

/**
 * Signs the current user out of the application
 */
export async function POST(req: NextRequest) {
  if (req.method === 'POST') {
    const supabase = createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ message: 'Signed out!' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Error' }, { status: 400 });
  }
}
