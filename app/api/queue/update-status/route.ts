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

    // Check if user is PIC (only PICs can update queue status)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_pic')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'Failed to verify user status' }, { status: 400 });
    }

    if (!userData?.is_pic) {
      return NextResponse.json({ error: 'Only PIC members can update queue status' }, { status: 403 });
    }

    // Parse request body
    const { entry_id, status } = await req.json();

    if (!entry_id || !status) {
      return NextResponse.json({ error: 'Entry ID and status are required' }, { status: 400 });
    }

    if (!Object.values(QueueStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // If setting to speaking, first set all other entries back to pending
    if (status === QueueStatus.SPEAKING) {
      await supabase
        .from('delib_queue')
        .update({ status: QueueStatus.PENDING })
        .eq('status', QueueStatus.SPEAKING);
    }

    // Update the queue entry status
    const updateData: any = { status };
    if (status === QueueStatus.COMPLETED) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updatedEntry, error: updateError } = await supabase
      .from('delib_queue')
      .update(updateData)
      .eq('id', entry_id)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update queue status' }, { status: 400 });
    }

    if (!updatedEntry) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Successfully updated queue status',
      entry: updatedEntry 
    }, { status: 200 });

  } catch (error) {
    console.error('Queue status update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}