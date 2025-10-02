import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();

  try {
    // First get all case studies
    const { data: caseStudies, error: caseError } = await supabase
      .from("case_studies")
      .select("*")
      .order("created_at", { ascending: false });

    if (caseError) {
      console.error("Error fetching case studies:", caseError);
      throw caseError;
    }

    if (!caseStudies || caseStudies.length === 0) {
      return NextResponse.json([]);
    }

    // Get unique prospect IDs
    const prospectIds = [...new Set(caseStudies.map((cs: any) => cs.prospect))];

    // Fetch user data for all prospects
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, photo_url")
      .in("id", prospectIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
    }

    // Create a map of user data
    const userMap = new Map();
    users?.forEach((user: any) => {
      userMap.set(user.id, user);
    });

    // Combine case studies with user data
    const enrichedCaseStudies = caseStudies.map((cs: any) => ({
      ...cs,
      users: userMap.get(cs.prospect) || null
    }));

    return NextResponse.json(enrichedCaseStudies);
  } catch (error: any) {
    console.error("Error in case studies API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch case studies" },
      { status: 500 }
    );
  }
}
