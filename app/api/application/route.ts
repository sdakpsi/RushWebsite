import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Adjust the import path as necessary

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { message: 'Method Not Allowed' },
      { status: 405 }
    );
  }
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
    .eq('id', user.id);

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }


  if (userData[0].application === null) {
    const { data: newApplication, error: newApplicationError } = await supabase
      .from('applications')
      .insert([
        {
          name: user.user_metadata.name,
          user_id: user.id,
        },
      ])
      .single();
    if (newApplicationError) {
      return NextResponse.json(
        { error: newApplicationError.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { application: newApplication },
        { status: 200 }
      );
    }
  } else {
    const userApplication = userData[0].application;
    if (userApplication) {
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', userApplication)
        .single();

      if (applicationError || !applicationData) {
        return NextResponse.json(
          { error: applicationError?.message || 'Application not found' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { application: applicationData },
        { status: 200 }
      );
    } else {
    }
  }
}

export async function PUT(req: NextRequest) {
  if (req.method !== 'PUT') {
    return NextResponse.json(
      { message: 'Method Not Allowed' },
      { status: 405 }
    );
  }

  const supabase = createClient();
  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;

  if (!user) {
    return NextResponse.json({ message: 'No user signed in' }, { status: 401 });
  }

  const {
    applicationId,
    firstName,
    lastName,
    pronouns,
    phoneNumber,
    yearInCollege,
    graduationYear,
    graduationQuarter,
    major,
    minor,
    cumulativeGPA,
    currentClasses,
    extracurricularActivities,
    proudAccomplishment,
    joinReason,
    lifeGoals,
    comfortZone,
    businessType,
    additionalDetails,
    resumeFileUrl,
    coverLetterFileUrl,
    isSubmitting,
    college,
    facebook,
    instagram,
    linkedIn,
    tiktok,
  } = await req.json();
  let socialMediasObject: Record<string, string> | undefined = undefined;
  const socialFields = { facebook, instagram, linkedIn, tiktok };
  const hasSocialMedia = Object.values(socialFields).some((value) => value);

  if (hasSocialMedia) {
    socialMediasObject = {};
    for (const [key, value] of Object.entries(socialFields)) {
      if (value) {
        socialMediasObject[key] = value;
      }
    }
  }

  const name = firstName + ' ' + lastName;
  const submitted = isSubmitting ? new Date() : null;
  let updateObject = {
    name,
    pronouns,
    phone_number: phoneNumber,
    year: yearInCollege,
    graduation_qtr: graduationQuarter,
    graduation_year: graduationYear || null,
    major,
    minors: minor || '',
    gpa: cumulativeGPA || null,
    classes: currentClasses,
    extracirriculars: extracurricularActivities,
    accomplishment: proudAccomplishment,
    why_akpsi: joinReason,
    goals: lifeGoals,
    comfort_zone: comfortZone,
    social_media: socialMediasObject,
    business: businessType,
    additional: additionalDetails,
    resume: resumeFileUrl,
    cover_letter: coverLetterFileUrl,
    college,
    submitted,
    last_updated: new Date(),
  };

  if (isSubmitting) {
    updateObject.submitted = submitted;
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('application')
    .eq('id', user.id);

  if (applicationId) {
    const { data, error } = await supabase
      .from('applications')
      .update(updateObject)
      .eq('id', applicationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Application updated successfully', data },
      { status: 200 }
    );
  } else {
    const { data, error } = await supabase
      .from('applications')
      .update(updateObject)
      .eq('id', userData![0].application);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Application updated successfully', data },
      { status: 200 }
    );
  }
}
