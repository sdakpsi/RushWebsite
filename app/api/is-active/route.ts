import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  if (req.method === 'POST') {
    console.log("hiiii");
    const supabase = createClient();

    // Retrieve the current user
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;

    console.log(user);

    if (user) {
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: true })
        .match({ id: user.id }); 


      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ message: 'User activated successfully', data }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No user signed in' }, { status: 401 });
    }
  } else {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }
}

/**
 * 
 * @param req n/a
 * @returns {isActive: boolean}, JSON representing whether the user is an active. 
 */
export async function GET(req: NextRequest){
  if (req.method === 'GET') {
    const supabase = createClient();

    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;

    if (user) {
      const { data, error } = await supabase
        .from('users')
        .select('is_active')
        .eq('id', user.id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (data && data.is_active) {
        return NextResponse.json({ isActive: true }, { status: 200 });
      } else {
        return NextResponse.json({ isActive: false }, { status: 200 });
      }
    } else {
      return NextResponse.json({ message: 'No user signed in' }, { status: 401 });
    }
  } else {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }
}