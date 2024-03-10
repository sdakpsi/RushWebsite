import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/server'; // Ensure this points to your server-side Supabase client
import { NextResponse } from 'next/server';

export async function POST(req: NextApiRequest) {
  if (req.method === 'POST') {
    const supabase = createClient();
    await supabase.auth.signOut();
    console.log('Signed out!!!');
    return NextResponse.json({ message: 'Signed out!' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Error' }, { status: 400 });
  }
}
