import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const supabase = createClient();

  try {
    // Get the current user
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is active or PIC
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_pic, is_active')
      .eq('id', user.id)
      .single();

    if (userError || (!userData?.is_pic && !userData?.is_active)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Parse request body
    const { prospect_id } = await req.json();

    if (!prospect_id) {
      return NextResponse.json({ error: 'Prospect ID is required' }, { status: 400 });
    }

    // Delete the case study (only the one created by this active user)
    const { error: deleteError } = await supabase
      .from('case_studies')
      .delete()
      .eq('prospect', prospect_id)
      .eq('active', user.id);

    if (deleteError) {
      console.error('Error deleting case study:', deleteError);
      return NextResponse.json({ error: 'Failed to delete case study' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete case study endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}