import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

//Successfull case, where add data to the database successfully  -> return NextResponse
// Failed case, where add data to the database failed -> throw new Error
export async function POST(req: NextRequest) {
  const supabase = createClient();

  try {
    // Parse request body
    const { email, name, phone } = await req.json();

    // Prepare data for insertion
    const insertData = {
      full_name: name,
      email,
      phone: phone || null,
    };

    // Insert into the database
    const { data, error } = await supabase
      .from('interests')
      .insert([insertData]);

    // Handle database errors
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Email already exists' },
          { status: 409 }
        );
      }
      console.log(error);
      return NextResponse.json(
        { message: 'Failed to add data to the database' },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json(data);
  } catch (err) {
    // Handle unexpected errors
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
