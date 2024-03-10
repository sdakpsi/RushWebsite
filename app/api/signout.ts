import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/server'; // Ensure this points to your server-side Supabase client

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const supabase = createClient();
    await supabase.auth.signOut();
    res.status(200).json({ message: 'Signed out successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}
