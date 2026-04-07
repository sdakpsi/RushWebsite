"use server";

import { createClient } from "@/utils/supabase/server";
import {
  createEmptyCommentCountsByEvent,
  getCommentTrackingEventForTimestamp,
} from "@/lib/analyticsCommentDates";
import { RUBRIC_CATEGORIES, type RubricCategory } from "@/lib/types";

export interface ActiveParticipationMetrics {
  activeId: string;
  activeName: string;
  commentsCount: number;
  commentCountsByEvent: Record<string, number>;
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

export interface ProspectAnalyticsComment {
  id: string;
  activeName: string;
  comment: string;
  interaction: string;
  rubricCategories: RubricCategory[];
  createdAt: string;
}

export interface ProspectAnalyticsRow {
  prospectId: string;
  prospectName: string;
  photoUrl: string | null;
  goodCommentsCount: number;
  neutralCommentsCount: number;
  badCommentsCount: number;
  communityCommentsCount: number;
  growthCommentsCount: number;
  vulnerabilityCommentsCount: number;
  commentCountsByEvent: Record<string, number>;
  startedApp: boolean;
  startedEssays: boolean;
  comments: ProspectAnalyticsComment[];
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

type CommentRow = {
  id: string;
  created_at: string | null;
  prospect_id: string | null;
  prospect_name: string | null;
  active_name: string | null;
  comment: string | null;
  interaction: string | null;
  rubric_categories?: RubricCategory[] | null;
};

type ApplicationRow = {
  id: string;
  user_id: string | null;
  accomplishment: string | null;
  why_akpsi: string | null;
  goals: string | null;
  comfort_zone: string | null;
  business: string | null;
  additional: string | null;
};

function toIsoDateKey(value: string | Date): string {
  return new Date(value).toISOString().slice(0, 10);
}

function hasTextValue(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function compareLastActivity(a: string, b: string) {
  return new Date(b).getTime() - new Date(a).getTime();
}

export async function getActiveParticipationMetrics(): Promise<ActiveParticipationMetrics[]> {
  const supabase = createClient();

  try {
    const { data: activeMembers, error: activesError } = await supabase
      .from("users")
      .select("id, full_name")
      .or("is_active.eq.true,is_pic.eq.true");

    if (activesError) {
      console.error("Error fetching active members:", activesError);
      return [];
    }

    if (!activeMembers?.length) {
      return [];
    }

    const { data: trackedComments, error: trackedCommentsError } = await supabase
      .from("comments")
      .select("active_id, created_at");

    if (trackedCommentsError) {
      console.error("Error fetching tracked comments by event:", trackedCommentsError);
    }

    const commentsByActiveAndEvent = new Map<string, Record<string, number>>();

    trackedComments?.forEach((comment) => {
      if (!comment.active_id || !comment.created_at) return;

      const trackedEvent = getCommentTrackingEventForTimestamp(comment.created_at);
      if (!trackedEvent) return;

      const currentCounts =
        commentsByActiveAndEvent.get(comment.active_id) ||
        createEmptyCommentCountsByEvent();

      currentCounts[trackedEvent.eventKey] =
        (currentCounts[trackedEvent.eventKey] || 0) + 1;

      commentsByActiveAndEvent.set(comment.active_id, currentCounts);
    });

    const participationData = await Promise.all(
      activeMembers.map(async (active) => {
        const { count: commentsCount, error: commentsError } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("active_id", active.id);

        if (commentsError) {
          console.error("Error fetching comments count:", commentsError);
        }

        const { count: caseStudiesCount, error: caseStudiesError } = await supabase
          .from("case_studies")
          .select("*", { count: "exact", head: true })
          .eq("active", active.id);

        if (caseStudiesError) {
          console.error("Error fetching case studies count:", caseStudiesError);
        }

        const { count: interviewsCount, error: interviewsError } = await supabase
          .from("interviews")
          .select("*", { count: "exact", head: true })
          .eq("active_id", active.id);

        if (interviewsError) {
          console.error("Error fetching interviews count:", interviewsError);
        }

        const activities: string[] = [];

        const { data: lastComment, error: lastCommentError } = await supabase
          .from("comments")
          .select("created_at")
          .eq("active_id", active.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (lastCommentError) {
          console.error("Error fetching last comment:", lastCommentError);
        }

        const { data: lastCaseStudy, error: lastCaseStudyError } = await supabase
          .from("case_studies")
          .select("created_at")
          .eq("active", active.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (lastCaseStudyError) {
          console.error("Error fetching last case study:", lastCaseStudyError);
        }

        const { data: lastInterview, error: lastInterviewError } = await supabase
          .from("interviews")
          .select("created_at")
          .eq("active_id", active.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (lastInterviewError) {
          console.error("Error fetching last interview:", lastInterviewError);
        }

        if (lastComment?.[0]?.created_at) activities.push(lastComment[0].created_at);
        if (lastCaseStudy?.[0]?.created_at) activities.push(lastCaseStudy[0].created_at);
        if (lastInterview?.[0]?.created_at) activities.push(lastInterview[0].created_at);

        const lastActivity =
          activities.length > 0
            ? activities.sort(compareLastActivity)[0] || null
            : null;

        return {
          activeId: active.id,
          activeName: active.full_name || "Unknown",
          commentsCount: commentsCount || 0,
          commentCountsByEvent:
            commentsByActiveAndEvent.get(active.id) ||
            createEmptyCommentCountsByEvent(),
          caseStudiesCount: caseStudiesCount || 0,
          interviewsCount: interviewsCount || 0,
          totalEvaluations:
            (commentsCount || 0) + (caseStudiesCount || 0) + (interviewsCount || 0),
          lastActivity,
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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateFilter = sevenDaysAgo.toISOString();

    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("created_at")
      .gte("created_at", dateFilter);

    if (commentsError) {
      console.error("Error fetching comments for timeline:", commentsError);
    }

    const { data: caseStudies, error: caseStudiesError } = await supabase
      .from("case_studies")
      .select("created_at")
      .gte("created_at", dateFilter);

    if (caseStudiesError) {
      console.error("Error fetching case studies for timeline:", caseStudiesError);
    }

    const { data: interviews, error: interviewsError } = await supabase
      .from("interviews")
      .select("created_at")
      .gte("created_at", dateFilter);

    if (interviewsError) {
      console.error("Error fetching interviews for timeline:", interviewsError);
    }

    const today = new Date();
    const dateMap = new Map<string, EvaluationTimelineData>();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - index);
      const dateStr = toIsoDateKey(date);

      dateMap.set(dateStr, {
        date: dateStr,
        commentsCount: 0,
        caseStudiesCount: 0,
        interviewsCount: 0,
        totalEvaluations: 0,
      });
    }

    comments?.forEach((comment) => {
      if (!comment.created_at) return;
      const date = toIsoDateKey(comment.created_at);
      const dayData = dateMap.get(date);
      if (!dayData) return;
      dayData.commentsCount += 1;
      dayData.totalEvaluations += 1;
    });

    caseStudies?.forEach((caseStudy) => {
      if (!caseStudy.created_at) return;
      const date = toIsoDateKey(caseStudy.created_at);
      const dayData = dateMap.get(date);
      if (!dayData) return;
      dayData.caseStudiesCount += 1;
      dayData.totalEvaluations += 1;
    });

    interviews?.forEach((interview) => {
      if (!interview.created_at) return;
      const date = toIsoDateKey(interview.created_at);
      const dayData = dateMap.get(date);
      if (!dayData) return;
      dayData.interviewsCount += 1;
      dayData.totalEvaluations += 1;
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching evaluation timeline:", error);
    return [];
  }
}

export async function getProspectCoverage(): Promise<ProspectCoverageData[]> {
  const supabase = createClient();

  try {
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

        const totalEvaluations =
          (commentsCount || 0) + (caseStudiesCount || 0) + (interviewsCount || 0);
        const needsMoreEvaluations =
          (caseStudiesCount || 0) < 3 || (interviewsCount || 0) < 3;

        return {
          prospectId: prospect.id,
          prospectName: prospect.full_name || "Unknown",
          commentsCount: commentsCount || 0,
          caseStudiesCount: caseStudiesCount || 0,
          interviewsCount: interviewsCount || 0,
          totalEvaluations,
          needsMoreEvaluations,
        };
      })
    );

    return coverageData.filter(Boolean) as ProspectCoverageData[];
  } catch (error) {
    console.error("Error fetching prospect coverage:", error);
    return [];
  }
}

export async function getProspectAnalytics(): Promise<ProspectAnalyticsRow[]> {
  const supabase = createClient();

  try {
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select(
        "id, created_at, prospect_id, prospect_name, active_name, comment, interaction, rubric_categories"
      );

    if (commentsError) {
      console.error("Error fetching prospect analytics comments:", commentsError);
      return [];
    }

    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select(
        "id, user_id, accomplishment, why_akpsi, goals, comfort_zone, business, additional"
      );

    if (applicationsError) {
      console.error("Error fetching prospect analytics applications:", applicationsError);
      return [];
    }

    const filteredComments = (comments || []).filter(
      (comment: CommentRow) =>
        Boolean(comment.prospect_id) && !comment.prospect_id!.startsWith("66666")
    ) as CommentRow[];

    const signalIds = new Set<string>();

    filteredComments.forEach((comment) => {
      if (comment.prospect_id) signalIds.add(comment.prospect_id);
    });

    (applications || []).forEach((application: ApplicationRow) => {
      if (application.user_id) signalIds.add(application.user_id);
    });

    if (!signalIds.size) {
      return [];
    }

    const { data: prospects, error: prospectsError } = await supabase
      .from("users")
      .select("id, full_name, photo_url, is_active, is_pic")
      .in("id", Array.from(signalIds))
      .eq("is_active", false)
      .eq("is_pic", false);

    if (prospectsError) {
      console.error("Error fetching prospect analytics users:", prospectsError);
      return [];
    }

    const commentsByProspect = new Map<string, CommentRow[]>();
    filteredComments.forEach((comment) => {
      if (!comment.prospect_id) return;
      const currentComments = commentsByProspect.get(comment.prospect_id) || [];
      currentComments.push(comment);
      commentsByProspect.set(comment.prospect_id, currentComments);
    });

    const applicationsByProspect = new Map<string, ApplicationRow[]>();
    (applications || []).forEach((application: ApplicationRow) => {
      if (!application.user_id) return;
      const currentApplications = applicationsByProspect.get(application.user_id) || [];
      currentApplications.push(application);
      applicationsByProspect.set(application.user_id, currentApplications);
    });

    const rows = (prospects || [])
      .map((prospect) => {
        const prospectComments = [...(commentsByProspect.get(prospect.id) || [])].sort(
          (a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
        );
        const prospectApplications = applicationsByProspect.get(prospect.id) || [];

        const commentCountsByEvent = createEmptyCommentCountsByEvent();

        prospectComments.forEach((comment) => {
          if (!comment.created_at) return;
          const trackedEvent = getCommentTrackingEventForTimestamp(comment.created_at);
          if (!trackedEvent) return;
          commentCountsByEvent[trackedEvent.eventKey] =
            (commentCountsByEvent[trackedEvent.eventKey] || 0) + 1;
        });

        const startedEssays = prospectApplications.some((application) =>
          [
            application.accomplishment,
            application.why_akpsi,
            application.goals,
            application.comfort_zone,
            application.business,
            application.additional,
          ].some(hasTextValue)
        );

        return {
          prospectId: prospect.id,
          prospectName: prospect.full_name || "Unknown",
          photoUrl: prospect.photo_url || null,
          goodCommentsCount: prospectComments.filter(
            (comment) => comment.interaction === "Good"
          ).length,
          neutralCommentsCount: prospectComments.filter(
            (comment) => comment.interaction === "Neutral"
          ).length,
          badCommentsCount: prospectComments.filter(
            (comment) => comment.interaction === "Bad"
          ).length,
          communityCommentsCount: prospectComments.filter((comment) =>
            comment.rubric_categories?.includes(RUBRIC_CATEGORIES[0])
          ).length,
          growthCommentsCount: prospectComments.filter((comment) =>
            comment.rubric_categories?.includes(RUBRIC_CATEGORIES[1])
          ).length,
          vulnerabilityCommentsCount: prospectComments.filter((comment) =>
            comment.rubric_categories?.includes(RUBRIC_CATEGORIES[2])
          ).length,
          commentCountsByEvent,
          startedApp: prospectApplications.length > 0,
          startedEssays,
          comments: prospectComments.map((comment) => ({
            id: comment.id,
            activeName: comment.active_name || "Unknown",
            comment: comment.comment || "",
            interaction: comment.interaction || "Unknown",
            rubricCategories: comment.rubric_categories || [],
            createdAt: comment.created_at || "",
          })),
        };
      })
      .filter((prospect) => prospect.comments.length > 0 || prospect.startedApp);

    return rows.sort((a, b) => {
      if (b.goodCommentsCount !== a.goodCommentsCount) {
        return b.goodCommentsCount - a.goodCommentsCount;
      }
      if (b.neutralCommentsCount !== a.neutralCommentsCount) {
        return b.neutralCommentsCount - a.neutralCommentsCount;
      }
      if (a.badCommentsCount !== b.badCommentsCount) {
        return a.badCommentsCount - b.badCommentsCount;
      }
      return a.prospectName.localeCompare(b.prospectName);
    });
  } catch (error) {
    console.error("Error fetching prospect analytics:", error);
    return [];
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = createClient();

  try {
    const { count: totalActiveMembers, error: activeMembersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .or("is_active.eq.true,is_pic.eq.true");

    if (activeMembersError) {
      console.error("Error fetching active members count:", activeMembersError);
    }

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

    const [commentsActives, caseStudyActives, interviewActives] = await Promise.all([
      supabase.from("comments").select("active_id"),
      supabase.from("case_studies").select("active"),
      supabase.from("interviews").select("active_id"),
    ]);

    if (commentsActives.error) {
      console.error(
        "Error fetching participating comments actives:",
        commentsActives.error
      );
    }
    if (caseStudyActives.error) {
      console.error(
        "Error fetching participating case study actives:",
        caseStudyActives.error
      );
    }
    if (interviewActives.error) {
      console.error(
        "Error fetching participating interview actives:",
        interviewActives.error
      );
    }

    const uniqueParticipatingActives = new Set([
      ...(commentsActives.data?.map((participant) => participant.active_id) || []),
      ...(caseStudyActives.data?.map((participant) => participant.active) || []),
      ...(interviewActives.data?.map((participant) => participant.active_id) || []),
    ]).size;

    const prospectCoverage = await getProspectCoverage();
    const prospectsNeedingEvaluations = prospectCoverage.filter(
      (prospect) => prospect.needsMoreEvaluations
    ).length;

    const totalEvaluations =
      (totalComments || 0) + (totalCaseStudies || 0) + (totalInterviews || 0);
    const participationRate = totalActiveMembers
      ? (uniqueParticipatingActives / totalActiveMembers) * 100
      : 0;
    const averageEvaluationsPerActive = totalActiveMembers
      ? totalEvaluations / totalActiveMembers
      : 0;

    return {
      totalActiveMembers: totalActiveMembers || 0,
      participatingActives: uniqueParticipatingActives,
      participationRate,
      totalEvaluations,
      averageEvaluationsPerActive,
      totalComments: totalComments || 0,
      totalCaseStudies: totalCaseStudies || 0,
      totalInterviews: totalInterviews || 0,
      prospectsNeedingEvaluations,
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
      prospectsNeedingEvaluations: 0,
    };
  }
}
