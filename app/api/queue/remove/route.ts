import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QueueStatus } from '@/lib/types';

export async function POST(req: NextRequest) {
  const supabase = createClient();

  try {
    // Get the current user
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const { entry_id, self_remove } = await req.json();

    if (self_remove) {
      const { data: activeEntries, error: activeError } = await supabase
        .from('delib_queue')
        .select('id')
        .eq('user_id', user.id)
        .in('status', [QueueStatus.PENDING, QueueStatus.SPEAKING])
        .limit(1);

      if (activeError) {
        return NextResponse.json({ error: 'Failed to check queue status' }, { status: 400 });
      }

      const entryToUpdate = activeEntries?.[0];
      if (!entryToUpdate) {
        return NextResponse.json({ error: 'You are not currently in the queue' }, { status: 404 });
      }

      const { data: updatedEntry, error: updateError } = await supabase
        .from('delib_queue')
        .update({
          status: QueueStatus.COMPLETED,
          completed_at: new Date().toISOString()
        })
        .eq('id', entryToUpdate.id)
        .select('*')
        .single();

      if (updateError) {
        return NextResponse.json({ error: 'Failed to remove yourself from queue' }, { status: 400 });
      }

      return NextResponse.json({ 
        message: 'Successfully removed yourself from queue',
        entry: updatedEntry
      }, { status: 200 });
    }

    // Check if user is PIC (only PICs can remove others from queue)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_pic')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'Failed to verify user status' }, { status: 400 });
    }

    if (!userData?.is_pic) {
      return NextResponse.json({ error: 'Only PIC members can remove from queue' }, { status: 403 });
    }

    if (!entry_id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Update the queue entry to completed status instead of deleting
    const { data: updatedEntry, error: updateError } = await supabase
      .from('delib_queue')
      .update({ 
        status: QueueStatus.COMPLETED,
        completed_at: new Date().toISOString()
      })
      .eq('id', entry_id)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to remove from queue' }, { status: 400 });
    }

    if (!updatedEntry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Successfully removed from queue',
      entry: updatedEntry 
    }, { status: 200 });

  } catch (error) {
    console.error('Queue remove error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
