import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QueueStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  const supabase = createClient();

  try {
    // Get the current user
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is active (both actives and PICs can view queue)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_active, is_pic')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'Failed to verify user status' }, { status: 400 });
    }

    if (!userData?.is_active) {
      return NextResponse.json({ error: 'Only active members can view the queue' }, { status: 403 });
    }

    // Get queue entries with user information
    const { data: queue, error: queueError } = await supabase
      .from('delib_queue')
      .select(`
        *,
        user:users!user_id (
          full_name,
          email
        )
      `)
      .in('status', [QueueStatus.PENDING, QueueStatus.SPEAKING])
      .order('created_at', { ascending: true });

    if (queueError) {
      return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 400 });
    }

    return NextResponse.json({ 
      queue: queue || [],
      total_pending: queue?.filter(entry => entry.status === QueueStatus.PENDING).length || 0,
      total_speaking: queue?.filter(entry => entry.status === QueueStatus.SPEAKING).length || 0
    }, { status: 200 });

  } catch (error) {
    console.error('Queue list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}