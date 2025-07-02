"use server";

import { createClient } from "@/utils/supabase/server";

export async function getSimpleAnalytics() {
  const supabase = createClient();

  try {
    console.log("Starting simple analytics test...");

    // Test basic connection with a simple query
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, is_active, is_pic")
      .limit(5);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return { error: "Failed to fetch users", details: usersError };
    }

    console.log("Users query successful:", users?.length || 0, "users found");

    // Test comments table
    const { count: commentsCount, error: commentsError } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true });

    if (commentsError) {
      console.error("Error fetching comments count:", commentsError);
      return { error: "Failed to fetch comments", details: commentsError };
    }

    console.log("Comments count:", commentsCount);

    // Test case studies table
    const { count: caseStudiesCount, error: caseStudiesError } = await supabase
      .from("case_studies")
      .select("*", { count: "exact", head: true });

    if (caseStudiesError) {
      console.error("Error fetching case studies count:", caseStudiesError);
      return { error: "Failed to fetch case studies", details: caseStudiesError };
    }

    console.log("Case studies count:", caseStudiesCount);

    // Test interviews table
    const { count: interviewsCount, error: interviewsError } = await supabase
      .from("interviews")
      .select("*", { count: "exact", head: true });

    if (interviewsError) {
      console.error("Error fetching interviews count:", interviewsError);
      return { error: "Failed to fetch interviews", details: interviewsError };
    }

    console.log("Interviews count:", interviewsCount);

    return {
      success: true,
      usersCount: users?.length || 0,
      commentsCount: commentsCount || 0,
      caseStudiesCount: caseStudiesCount || 0,
      interviewsCount: interviewsCount || 0,
      sampleUser: users?.[0] || null
    };

  } catch (error) {
    console.error("Unexpected error in simple analytics:", error);
    return { 
      error: "Unexpected error", 
      details: error instanceof Error ? error.message : String(error) 
    };
  }
}