import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QueueType, QueueStatus } from '@/lib/types';

export async function POST(req: NextRequest) {
  const supabase = createClient();

  try {
    // Get the current user
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is active
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_active, full_name')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'Failed to verify user status' }, { status: 400 });
    }

    if (!userData?.is_active) {
      return NextResponse.json({ error: 'Only active members can join the queue' }, { status: 403 });
    }

    // Parse request body
    const { queue_type } = await req.json();

    if (!queue_type || !Object.values(QueueType).includes(queue_type)) {
      return NextResponse.json({ error: 'Invalid queue type' }, { status: 400 });
    }

    // Check if user is already in queue
    const { data: existingEntry, error: checkError } = await supabase
      .from('delib_queue')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', [QueueStatus.PENDING, QueueStatus.SPEAKING])
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: 'Failed to check queue status' }, { status: 400 });
    }

    if (existingEntry) {
      return NextResponse.json({ 
        error: 'You are already in the queue', 
        existing_entry: existingEntry 
      }, { status: 409 });
    }

    // Add user to queue
    const { data: queueEntry, error: insertError } = await supabase
      .from('delib_queue')
      .insert([{
        user_id: user.id,
        queue_type: queue_type,
        status: QueueStatus.PENDING
      }])
      .select('*')
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to join queue' }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Successfully joined queue',
      entry: queueEntry 
    }, { status: 200 });

  } catch (error) {
    console.error('Queue join error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}