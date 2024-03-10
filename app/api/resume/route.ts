import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Adjust the import path as necessary

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }
  console.log("Posting..")
  const supabase = createClient();
  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;

  if (!user) {
    return NextResponse.json({ message: 'No user signed in' }, { status: 401 });
  }

  // Check if the user has an application field set
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('application')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return NextResponse.json({ error: userError?.message || 'User not found' }, { status: 400 });
  }

  if (userData.application) {
    const { data: applicationData, error: applicationError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', userData.application)
      .single();

    if (applicationError || !applicationData) {
      return NextResponse.json({ error: applicationError?.message || 'Application not found' }, { status: 400 });
    }

    console.log("found, returning", applicationData);
    return NextResponse.json({ application: applicationData }, { status: 200 });
  } else {
    // No application exists, create a new one with default values
    const { data: newApplication, error: newApplicationError } = await supabase
    .from('applications')
    .insert([{ 
        name: user.user_metadata.name,
        user_id: user.id }])
    .single();
  
  if (newApplicationError) {
    console.error('Error creating application:', newApplicationError);
    // Handle the error appropriately
  } else {
    console.log('Application created successfully:', newApplication);   
  }
    // Return the new application data
    return NextResponse.json({ application: newApplication }, { status: 200 });
  }
}
