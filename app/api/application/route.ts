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

export async function PUT(req: NextRequest) {
  if (req.method !== 'PUT') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  console.log("updating")

  const supabase = createClient();
  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;

  if (!user) {
    return NextResponse.json({ message: 'No user signed in' }, { status: 401 });
  }
  const { id, firstName, lastName, pronouns, email, phoneNumber, yearInCollege, graduationYear, graduationQuarter, major, minor, cumulativeGPA, currentClasses, extracurricularActivities, proudAccomplishment, joinReason, lifeGoals, comfortZone, businessType, additionalDetails, resumeFileUrl, coverLetterFileUrl } = await req.json();
  const name = firstName + " " + lastName
  const { data, error } = await supabase
    .from('applications')
    .update({ 
      name,
      pronouns, 
      phone_number: phoneNumber,
      //social media
      year: yearInCollege,
      graduation_qtr: graduationQuarter,
      graduation_year: graduationYear || null,
      major, 
      minor, 
      gpa: cumulativeGPA || null, 
      classes: currentClasses, 
      extracirriculars: extracurricularActivities, 
      accomplishment: proudAccomplishment, 
      why_akpsi: joinReason, 
      goals: lifeGoals, 
      comfort_zone: comfortZone, 
      business: businessType, 
      additional: additionalDetails,
      resume: resumeFileUrl,
      cover_letter: coverLetterFileUrl,
      last_updated: new Date()
    })
    .eq('id', id);
    console.log("hi", data, error)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Application updated successfully', data }, { status: 200 });
}