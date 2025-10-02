import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all applicant data in parallel
    const [avatarResult, casesResult, interviewsResult, scoreResult] = await Promise.all([
      supabase
        .from("user_avatar")
        .select("avatar_url")
        .eq("user_id", userId)
        .single(),

      supabase
        .from("case_studies")
        .select("active_name")
        .eq("prospect", userId),

      supabase
        .from("interviews")
        .select("active_name")
        .eq("prospect_id", userId),

      supabase
        .from("users")
        .select("total_score")
        .eq("id", userId)
        .single()
    ]);

    return NextResponse.json({
      avatarUrl: avatarResult.data?.avatar_url || null,
      caseStudies: casesResult.data || [],
      interviews: interviewsResult.data || [],
      totalScore: scoreResult.data?.total_score || 0
    });
  } catch (error) {
    console.error("Error fetching batched applicant data:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicant data" },
      { status: 500 }
    );
  }
}
