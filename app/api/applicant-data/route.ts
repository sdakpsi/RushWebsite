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

    // user_avatar is optional; many prospects only have users.photo_url
    const [avatarRow, userRow, casesResult, interviewsResult] = await Promise.all([
      supabase
        .from("user_avatar")
        .select("avatar_url")
        .eq("user_id", userId)
        .maybeSingle(),

      supabase
        .from("users")
        .select("total_score, photo_url")
        .eq("id", userId)
        .maybeSingle(),

      supabase
        .from("case_studies")
        .select("active_name")
        .eq("prospect", userId),

      supabase
        .from("interviews")
        .select("active_name")
        .eq("prospect_id", userId),
    ]);

    const avatarUrl =
      avatarRow.data?.avatar_url?.trim() ||
      userRow.data?.photo_url?.trim() ||
      null;

    return NextResponse.json({
      avatarUrl,
      caseStudies: casesResult.data || [],
      interviews: interviewsResult.data || [],
      totalScore: userRow.data?.total_score ?? 0,
    });
  } catch (error) {
    console.error("Error fetching batched applicant data:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicant data" },
      { status: 500 }
    );
  }
}
