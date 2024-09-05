import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

//Successfull case, where add data to the database successfully  -> return NextResponse
// Failed case, where add data to the database failed -> throw new Error
export async function POST(req: NextRequest)  {
    const supabase = createClient();
    // req is the data that is sent from the frontend
    // Parse the JSON body once
    const { email, name, phone } = await req.json();
    
    // Prepare the data for insertion
    const insertData = {
        full_name: name,
        email,
        phone: phone || null // Use null if phone is an empty string
    };

    // Insert data into the database
    const { data, error } = await supabase
        .from('interests')
        .insert([insertData]);

    if(error != null) {
        if(error.code === '23505') {
            throw new Error('Email already exists');
        } else {
        console.log(error);
        throw new Error('Failed to add data to the database');
        }
    }
    return NextResponse.json(data);

}