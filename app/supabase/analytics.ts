"use server";

import { createClient } from "@/utils/supabase/server";

export interface ActiveParticipationMetrics {
  activeId: string;
  activeName: string;
  commentsCount: number;
  caseStudiesCount: number;
  interviewsCount: number;
  totalEvaluations: number;
  lastActivity: string | null;
}

export interface EvaluationTimelineData {
  date: string;
  commentsCount: number;
  caseStudiesCount: number;
  interviewsCount: number;
  totalEvaluations: number;
}

export interface ProspectCoverageData {
  prospectId: string;
  prospectName: string;
  commentsCount: number;
  caseStudiesCount: number;
  interviewsCount: number;
  totalEvaluations: number;
  needsMoreEvaluations: boolean;
}

export interface AnalyticsSummary {
  totalActiveMembers: number;
  participatingActives: number;
  participationRate: number;
  totalEvaluations: number;
  averageEvaluationsPerActive: number;
  totalComments: number;
  totalCaseStudies: number;
  totalInterviews: number;
  prospectsNeedingEvaluations: number;
}

export async function getActiveParticipationMetrics(): Promise<ActiveParticipationMetrics[]> {
  const supabase = createClient();

  try {
    // Get all active members
    const { data: activeMembers, error: activesError } = await supabase
      .from("users")
      .select("id, full_name")
      .or("is_active.eq.true,is_pic.eq.true");

    if (activesError) {
      console.error("Error fetching active members:", activesError);
      return [];
    }

    // Get participation data for each active
    const participationData = await Promise.all(
      activeMembers.map(async (active) => {
        // Get comments count
        const { count: commentsCount, error: commentsError } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("active_id", active.id);

        if (commentsError) {
          console.error("Error fetching comments count:", commentsError);
        }

        // Get case studies count
        const { count: caseStudiesCount, error: caseStudiesError } = await supabase
          .from("case_studies")
          .select("*", { count: "exact", head: true })
          .eq("active", active.id);

        if (caseStudiesError) {
          console.error("Error fetching case studies count:", caseStudiesError);
        }

        // Get interviews count
        const { count: interviewsCount, error: interviewsError } = await supabase
          .from("interviews")
          .select("*", { count: "exact", head: true })
          .eq("active_id", active.id);

        if (interviewsError) {
          console.error("Error fetching interviews count:", interviewsError);
        }

        // Skip last activity for now to avoid column errors
        const lastActivity = null;

        return {
          activeId: active.id,
          activeName: active.full_name || "Unknown",
          commentsCount: commentsCount || 0,
          caseStudiesCount: caseStudiesCount || 0,
          interviewsCount: interviewsCount || 0,
          totalEvaluations: (commentsCount || 0) + (caseStudiesCount || 0) + (interviewsCount || 0),
          lastActivity
        };
      })
    );

    return participationData;
  } catch (error) {
    console.error("Error fetching participation metrics:", error);
    return [];
  }
}

export async function getEvaluationTimeline(): Promise<EvaluationTimelineData[]> {
  const supabase = createClient();

  try {
    // Get last 7 days of activity
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateFilter = sevenDaysAgo.toISOString();

    // Get comments by date (only working timestamp query)
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("created_at")
      .gte("created_at", dateFilter);

    if (commentsError) {
      console.error("Error fetching comments for timeline:", commentsError);
    }

    // Create timeline for last 7 days
    const today = new Date();
    const dateMap = new Map<string, EvaluationTimelineData>();

    // Initialize all 7 days with zeros
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dateMap.set(dateStr, {
        date: dateStr,
        commentsCount: 0,
        caseStudiesCount: 0, // Disabled due to column issues
        interviewsCount: 0, // Disabled due to column issues
        totalEvaluations: 0
      });
    }

    // Process comments data
    comments?.forEach(comment => {
      if (comment.created_at) {
        const date = new Date(comment.created_at).toISOString().split('T')[0];
        const dayData = dateMap.get(date);
        if (dayData) {
          dayData.commentsCount++;
          dayData.totalEvaluations++;
        }
      }
    });

    // Return sorted timeline
    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching evaluation timeline:", error);
    return [];
  }
}

export async function getProspectCoverage(): Promise<ProspectCoverageData[]> {
  const supabase = createClient();

  try {
    // Get all prospects with submitted applications
    const { data: prospects, error: prospectsError } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("is_active", false)
      .eq("is_pic", false);

    if (prospectsError) {
      console.error("Error fetching prospects:", prospectsError);
      return [];
    }

    if (!prospects) return [];

    const coverageData = await Promise.all(
      prospects.map(async (prospect) => {
        // Check if they have a submitted application
        const { data: application, error: applicationError } = await supabase
          .from("applications")
          .select("id")
          .eq("user_id", prospect.id)
          .not("submitted", "is", null)
          .limit(1);

        if (applicationError) {
          console.error("Error fetching application:", applicationError);
          return null;
        }

        if (!application?.length) return null;

        // Get evaluation counts
        const { count: commentsCount, error: commentsError } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("prospect_id", prospect.id);

        if (commentsError) {
          console.error("Error fetching prospect comments count:", commentsError);
        }

        const { count: caseStudiesCount, error: caseStudiesError } = await supabase
          .from("case_studies")
          .select("*", { count: "exact", head: true })
          .eq("prospect", prospect.id);

        if (caseStudiesError) {
          console.error("Error fetching prospect case studies count:", caseStudiesError);
        }

        const { count: interviewsCount, error: interviewsError } = await supabase
          .from("interviews")
          .select("*", { count: "exact", head: true })
          .eq("prospect_id", prospect.id);

        if (interviewsError) {
          console.error("Error fetching prospect interviews count:", interviewsError);
        }

        const totalEvaluations = (commentsCount || 0) + (caseStudiesCount || 0) + (interviewsCount || 0);
        const needsMoreEvaluations = (caseStudiesCount || 0) < 3 || (interviewsCount || 0) < 3;

        return {
          prospectId: prospect.id,
          prospectName: prospect.full_name || "Unknown",
          commentsCount: commentsCount || 0,
          caseStudiesCount: caseStudiesCount || 0,
          interviewsCount: interviewsCount || 0,
          totalEvaluations,
          needsMoreEvaluations
        };
      })
    );

    return coverageData.filter(Boolean) as ProspectCoverageData[];
  } catch (error) {
    console.error("Error fetching prospect coverage:", error);
    return [];
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = createClient();

  try {
    // Get total active members
    const { count: totalActiveMembers, error: activeMembersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .or("is_active.eq.true,is_pic.eq.true");

    if (activeMembersError) {
      console.error("Error fetching active members count:", activeMembersError);
    }

    // Get total evaluations
    const { count: totalComments, error: totalCommentsError } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true });

    if (totalCommentsError) {
      console.error("Error fetching total comments count:", totalCommentsError);
    }

    const { count: totalCaseStudies, error: totalCaseStudiesError } = await supabase
      .from("case_studies")
      .select("*", { count: "exact", head: true });

    if (totalCaseStudiesError) {
      console.error("Error fetching total case studies count:", totalCaseStudiesError);
    }

    const { count: totalInterviews, error: totalInterviewsError } = await supabase
      .from("interviews")
      .select("*", { count: "exact", head: true });

    if (totalInterviewsError) {
      console.error("Error fetching total interviews count:", totalInterviewsError);
    }

    // Get participating actives (those with at least one evaluation)
    const [commentsActives, caseStudyActives, interviewActives] = await Promise.all([
      supabase.from("comments").select("active_id"),
      supabase.from("case_studies").select("active"),
      supabase.from("interviews").select("active_id")
    ]);

    if (commentsActives.error) {
      console.error("Error fetching participating comments actives:", commentsActives.error);
    }
    if (caseStudyActives.error) {
      console.error("Error fetching participating case study actives:", caseStudyActives.error);
    }
    if (interviewActives.error) {
      console.error("Error fetching participating interview actives:", interviewActives.error);
    }

    const uniqueParticipatingActives = new Set([
      ...(commentsActives.data?.map(p => p.active_id) || []),
      ...(caseStudyActives.data?.map(p => p.active) || []),
      ...(interviewActives.data?.map(p => p.active_id) || [])
    ]).size;

    // Get prospects needing evaluations
    const prospectCoverage = await getProspectCoverage();
    const prospectsNeedingEvaluations = prospectCoverage.filter(p => p.needsMoreEvaluations).length;

    const totalEvaluations = (totalComments || 0) + (totalCaseStudies || 0) + (totalInterviews || 0);
    const participationRate = totalActiveMembers ? (uniqueParticipatingActives / totalActiveMembers) * 100 : 0;
    const averageEvaluationsPerActive = totalActiveMembers ? totalEvaluations / totalActiveMembers : 0;

    return {
      totalActiveMembers: totalActiveMembers || 0,
      participatingActives: uniqueParticipatingActives,
      participationRate,
      totalEvaluations,
      averageEvaluationsPerActive,
      totalComments: totalComments || 0,
      totalCaseStudies: totalCaseStudies || 0,
      totalInterviews: totalInterviews || 0,
      prospectsNeedingEvaluations
    };
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    return {
      totalActiveMembers: 0,
      participatingActives: 0,
      participationRate: 0,
      totalEvaluations: 0,
      averageEvaluationsPerActive: 0,
      totalComments: 0,
      totalCaseStudies: 0,
      totalInterviews: 0,
      prospectsNeedingEvaluations: 0
    };
  }
}