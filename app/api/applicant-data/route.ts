import { createClient } from "@/utils/supabase/server";
import { averagePacketScore, calculatePacketScoreComponents } from "@/lib/packetScore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_active, is_pic")
      .eq("id", user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: "Failed to verify user status" },
        { status: 400 }
      );
    }

    if (!userData?.is_active && !userData?.is_pic) {
      return NextResponse.json(
        { error: "Only active members can view applicant data" },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // user_avatar is optional; many prospects only have users.photo_url
    const [
      avatarRow,
      userRow,
      applicationResult,
      casesResult,
      interviewsResult,
      packetScoresResult,
    ] = await Promise.all([
      supabase
        .from("user_avatar")
        .select("avatar_url")
        .eq("user_id", userId)
        .maybeSingle(),

      supabase
        .from("users")
        .select("photo_url, resume_score")
        .eq("id", userId)
        .maybeSingle(),

      supabase
        .from("applications")
        .select("cover_letter")
        .eq("user_id", userId)
        .not("submitted", "is", null)
        .limit(1)
        .maybeSingle(),

      supabase
        .from("case_studies")
        .select("active_name, leadership_score, teamwork_score, analytical_score")
        .eq("prospect", userId),

      supabase
        .from("interviews")
        .select("active_name, pledgeable, open_minded, motivated, events_attended")
        .eq("prospect_id", userId),

      supabase
        .from("packet_scores")
        .select("score_type, score")
        .eq("prospect_id", userId),
    ]);

    const avatarUrl =
      avatarRow.data?.avatar_url?.trim() ||
      userRow.data?.photo_url?.trim() ||
      null;
    const packetScores = packetScoresResult.data || [];
    const packetScore = calculatePacketScoreComponents({
      applicationProfessionalismScore: averagePacketScore(
        packetScores,
        "application_professionalism"
      ),
      applicationBrotherhoodScore: averagePacketScore(
        packetScores,
        "application_brotherhood"
      ),
      resumeScore:
        averagePacketScore(packetScores, "resume") ??
        (userRow.data?.resume_score != null ? Number(userRow.data.resume_score) : null),
      caseStudies: casesResult.data || [],
      interviews: interviewsResult.data || [],
      hasCoverLetter: Boolean(applicationResult.data?.cover_letter),
    }).totalScore;

    return NextResponse.json({
      avatarUrl,
      caseStudies: casesResult.data || [],
      interviews: interviewsResult.data || [],
      totalScore: Number(packetScore.toFixed(2)),
    });
  } catch (error) {
    console.error("Error fetching batched applicant data:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicant data" },
      { status: 500 }
    );
  }
}
