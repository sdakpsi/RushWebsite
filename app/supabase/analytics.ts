"use server";

import { getLatestCommentsByThread, groupCommentsIntoThreads } from "@/lib/commentThreads";
import { createClient } from "@/utils/supabase/server";
import {
  createEmptyCommentCountsByEvent,
  getCommentTrackingEventForTimestamp,
} from "@/lib/analyticsCommentDates";
import { RUBRIC_CATEGORIES, type Comment, type RubricCategory } from "@/lib/types";

export interface ActiveParticipationMetrics {
  activeId: string;
  activeName: string;
  commentsCount: number;
  commentCountsByEvent: Record<string, number>;
  caseStudiesCount: number;
  interviewsCount: number;
  totalEvaluations: number;
  lastActivity: string | null;
  comments: ActiveParticipationCommentThread[];
}

export interface ActiveParticipationComment {
  id: string;
  prospectName: string;
  comment: string;
  interaction: string;
  rubricCategories: RubricCategory[];
  createdAt: string;
}

export interface ActiveParticipationCommentThread {
  threadKey: string;
  prospectName: string;
  latestComment: ActiveParticipationComment;
  history: ActiveParticipationComment[];
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

export interface ProspectAnalyticsCommentThread {
  threadKey: string;
  activeName: string;
  latestComment: ProspectAnalyticsComment;
  history: ProspectAnalyticsComment[];
}

export interface ProspectAnalyticsCaseStudy {
  id: string;
  activeName: string;
  socialInvite: string;
  createdAt: string;
  leadershipScore: number | null;
  teamworkScore: number | null;
  publicSpeakingScore: number | null;
  analyticalScore: number | null;
}

export interface ProspectAnalyticsRow {
  prospectId: string;
  prospectName: string;
  photoUrl: string | null;
  applicationId: string | null;
  previewDropped: boolean;
  goodCommentsCount: number;
  caseStudiesCount: number;
  caseStudyYesInvitesCount: number;
  totalScore: number;
  neutralCommentsCount: number;
  badCommentsCount: number;
  communityCommentsCount: number;
  growthCommentsCount: number;
  vulnerabilityCommentsCount: number;
  commentCountsByEvent: Record<string, number>;
  startedApp: boolean;
  submittedEssays: boolean;
  comments: ProspectAnalyticsCommentThread[];
  caseStudies: ProspectAnalyticsCaseStudy[];
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
  active_id?: string | null;
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
  submitted: string | null;
};

type CaseStudyRow = {
  id: string;
  prospect: string | null;
  active_name: string | null;
  social_invite: string | null;
  created_at?: string | null;
  leadership_score?: number | null;
  teamwork_score?: number | null;
  public_speaking_score?: number | null;
  analytical_score?: number | null;
};

function toIsoDateKey(value: string | Date): string {
  return new Date(value).toISOString().slice(0, 10);
}

function compareLastActivity(a: string, b: string) {
  return new Date(b).getTime() - new Date(a).getTime();
}

function toThreadableComments(rows: CommentRow[] | null | undefined): Comment[] {
  return (rows ?? [])
    .filter((row): row is CommentRow & {
      created_at: string;
      prospect_id: string;
      active_id: string;
    } => Boolean(row.created_at && row.prospect_id && row.active_id))
    .map((row) => ({
      id: row.id,
      created_at: row.created_at,
      prospect_id: row.prospect_id,
      active_id: row.active_id,
      prospect_name: row.prospect_name,
      active_name: row.active_name,
      comment: row.comment,
      interaction: row.interaction,
      invite: null,
      rubric_categories: row.rubric_categories,
      prospect_photo_url: null,
    }));
}

function toActiveComment(comment: Comment): ActiveParticipationComment {
  return {
    id: comment.id,
    prospectName: comment.prospect_name || "Unknown Prospect",
    comment: comment.comment || "",
    interaction: comment.interaction || "Unknown",
    rubricCategories: comment.rubric_categories || [],
    createdAt: comment.created_at,
  };
}

function toProspectComment(comment: Comment): ProspectAnalyticsComment {
  return {
    id: comment.id,
    activeName: comment.active_name || "Unknown",
    comment: comment.comment || "",
    interaction: comment.interaction || "Unknown",
    rubricCategories: comment.rubric_categories || [],
    createdAt: comment.created_at,
  };
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
      .select(
        "id, active_id, prospect_id, created_at, prospect_name, active_name, comment, interaction, rubric_categories"
      );

    if (trackedCommentsError) {
      console.error("Error fetching tracked comments by event:", trackedCommentsError);
    }

    const threadableComments = toThreadableComments(trackedComments as CommentRow[] | null);
    const commentThreads = groupCommentsIntoThreads(threadableComments);
    const commentsByActiveAndEvent = new Map<string, Record<string, number>>();
    const threadsByActive = new Map<string, typeof commentThreads>();

    commentThreads.forEach((thread) => {
      const currentThreads = threadsByActive.get(thread.active_id) || [];
      currentThreads.push(thread);
      threadsByActive.set(thread.active_id, currentThreads);

      const trackedEvent = getCommentTrackingEventForTimestamp(thread.latest_comment.created_at);
      if (!trackedEvent) return;

      const currentCounts =
        commentsByActiveAndEvent.get(thread.active_id) || createEmptyCommentCountsByEvent();

      currentCounts[trackedEvent.eventKey] =
        (currentCounts[trackedEvent.eventKey] || 0) + 1;

      commentsByActiveAndEvent.set(thread.active_id, currentCounts);
    });

    const participationData = await Promise.all(
      activeMembers.map(async (active) => {
        const activeCommentThreads = [...(threadsByActive.get(active.id) || [])].sort(
          (a, b) =>
            new Date(b.latest_comment.created_at).getTime() -
            new Date(a.latest_comment.created_at).getTime()
        );
        const commentsCount = activeCommentThreads.length;

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

        if (activeCommentThreads[0]?.latest_comment.created_at) {
          activities.push(activeCommentThreads[0].latest_comment.created_at);
        }
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
          comments: activeCommentThreads.map((thread) => ({
            threadKey: thread.threadKey,
            prospectName: thread.prospect_name || "Unknown Prospect",
            latestComment: toActiveComment(thread.latest_comment),
            history: thread.history.map(toActiveComment),
          })),
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
      .select("id, created_at, prospect_id, active_id, prospect_name, active_name, comment, interaction, rubric_categories");

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

    const latestComments = getLatestCommentsByThread(
      toThreadableComments(comments as CommentRow[] | null)
    );
    const dateFilterTime = new Date(dateFilter).getTime();

    latestComments.forEach((comment) => {
      if (new Date(comment.created_at).getTime() < dateFilterTime) return;
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

    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("id, created_at, prospect_id, active_id, prospect_name, active_name, comment, interaction, rubric_categories");

    if (commentsError) {
      console.error("Error fetching comments for prospect coverage:", commentsError);
    }

    const latestComments = getLatestCommentsByThread(
      toThreadableComments(comments as CommentRow[] | null)
    );
    const commentCountsByProspect = latestComments.reduce<Record<string, number>>(
      (counts, comment) => {
        counts[comment.prospect_id] = (counts[comment.prospect_id] || 0) + 1;
        return counts;
      },
      {}
    );

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

        const commentsCount = commentCountsByProspect[prospect.id] || 0;

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
        "id, created_at, prospect_id, active_id, prospect_name, active_name, comment, interaction, rubric_categories"
      );

    if (commentsError) {
      console.error("Error fetching prospect analytics comments:", commentsError);
      return [];
    }

    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select(
        "id, user_id, accomplishment, why_akpsi, goals, comfort_zone, business, additional, submitted"
      );

    if (applicationsError) {
      console.error("Error fetching prospect analytics applications:", applicationsError);
      return [];
    }

    const { data: caseStudies, error: caseStudiesError } = await supabase
      .from("case_studies")
      .select(
        "id, prospect, active_name, social_invite, created_at, leadership_score, teamwork_score, public_speaking_score, analytical_score"
      );

    if (caseStudiesError) {
      console.error("Error fetching prospect analytics case studies:", caseStudiesError);
      return [];
    }

    const filteredComments = toThreadableComments(
      ((comments || []).filter(
      (comment: CommentRow) =>
        Boolean(comment.prospect_id) && !comment.prospect_id!.startsWith("66666")
    ) as CommentRow[])
    );
    const commentThreads = groupCommentsIntoThreads(filteredComments);

    const signalIds = new Set<string>();

    filteredComments.forEach((comment) => {
      signalIds.add(comment.prospect_id);
    });

    (applications || []).forEach((application: ApplicationRow) => {
      if (application.user_id) signalIds.add(application.user_id);
    });

    (caseStudies || []).forEach((caseStudy: CaseStudyRow) => {
      if (caseStudy.prospect) signalIds.add(caseStudy.prospect);
    });

    if (!signalIds.size) {
      return [];
    }

    const { data: prospects, error: prospectsError } = await supabase
      .from("users")
      .select("id, full_name, photo_url, is_active, is_pic, preview_dropped")
      .in("id", Array.from(signalIds))
      .eq("is_active", false)
      .eq("is_pic", false);

    if (prospectsError) {
      console.error("Error fetching prospect analytics users:", prospectsError);
      return [];
    }

    const threadsByProspect = new Map<string, typeof commentThreads>();
    commentThreads.forEach((thread) => {
      const currentThreads = threadsByProspect.get(thread.prospect_id) || [];
      currentThreads.push(thread);
      threadsByProspect.set(thread.prospect_id, currentThreads);
    });

    const applicationsByProspect = new Map<string, ApplicationRow[]>();
    (applications || []).forEach((application: ApplicationRow) => {
      if (!application.user_id) return;
      const currentApplications = applicationsByProspect.get(application.user_id) || [];
      currentApplications.push(application);
      applicationsByProspect.set(application.user_id, currentApplications);
    });

    const caseStudiesByProspect = new Map<string, CaseStudyRow[]>();
    (caseStudies || []).forEach((caseStudy: CaseStudyRow) => {
      if (!caseStudy.prospect) return;
      const currentCaseStudies = caseStudiesByProspect.get(caseStudy.prospect) || [];
      currentCaseStudies.push(caseStudy);
      caseStudiesByProspect.set(caseStudy.prospect, currentCaseStudies);
    });

    const visibleProspects = (prospects || []).filter(
      (prospect) => !(prospect.full_name || "").startsWith("(old) ")
    );

    const rows = visibleProspects
      .map((prospect) => {
        const prospectCommentThreads = [...(threadsByProspect.get(prospect.id) || [])].sort(
          (a, b) =>
            new Date(b.latest_comment.created_at).getTime() -
            new Date(a.latest_comment.created_at).getTime()
        );
        const prospectApplications = applicationsByProspect.get(prospect.id) || [];
        const prospectCaseStudies = [
          ...(caseStudiesByProspect.get(prospect.id) || []),
        ].sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
        );

        const commentCountsByEvent = createEmptyCommentCountsByEvent();

        prospectCommentThreads.forEach((thread) => {
          const trackedEvent = getCommentTrackingEventForTimestamp(thread.latest_comment.created_at);
          if (!trackedEvent) return;
          commentCountsByEvent[trackedEvent.eventKey] =
            (commentCountsByEvent[trackedEvent.eventKey] || 0) + 1;
        });

        const submittedEssays = prospectApplications.some(
          (application) => Boolean(application.submitted)
        );
        const primaryApplication =
          prospectApplications.find((application) => Boolean(application.submitted)) ||
          prospectApplications[0] ||
          null;

        const goodCommentsCount = prospectCommentThreads.filter(
          (thread) => thread.latest_comment.interaction === "Good"
        ).length;

        const caseStudyYesInvitesCount = prospectCaseStudies.filter(
          (caseStudy) => caseStudy.social_invite === "yes"
        ).length;
        const caseStudiesCount = prospectCaseStudies.length;

        const totalScore = goodCommentsCount + caseStudyYesInvitesCount * 0.75;

        return {
          prospectId: prospect.id,
          prospectName: prospect.full_name || "Unknown",
          photoUrl: prospect.photo_url || null,
          applicationId: primaryApplication?.id || null,
          previewDropped: Boolean(prospect.preview_dropped),
          goodCommentsCount,
          caseStudiesCount,
          caseStudyYesInvitesCount,
          totalScore,
          neutralCommentsCount: prospectCommentThreads.filter(
            (thread) => thread.latest_comment.interaction === "Neutral"
          ).length,
          badCommentsCount: prospectCommentThreads.filter(
            (thread) => thread.latest_comment.interaction === "Bad"
          ).length,
          communityCommentsCount: prospectCommentThreads.filter((thread) =>
            thread.latest_comment.rubric_categories?.includes(RUBRIC_CATEGORIES[0])
          ).length,
          growthCommentsCount: prospectCommentThreads.filter((thread) =>
            thread.latest_comment.rubric_categories?.includes(RUBRIC_CATEGORIES[1])
          ).length,
          vulnerabilityCommentsCount: prospectCommentThreads.filter((thread) =>
            thread.latest_comment.rubric_categories?.includes(RUBRIC_CATEGORIES[2])
          ).length,
          commentCountsByEvent,
          startedApp: prospectApplications.length > 0,
          submittedEssays,
          comments: prospectCommentThreads.map((thread) => ({
            threadKey: thread.threadKey,
            activeName: thread.active_name || "Unknown",
            latestComment: toProspectComment(thread.latest_comment),
            history: thread.history.map(toProspectComment),
          })),
          caseStudies: prospectCaseStudies.map((caseStudy) => ({
            id: caseStudy.id,
            activeName: caseStudy.active_name || "Unknown",
            socialInvite: caseStudy.social_invite || "unknown",
            createdAt: caseStudy.created_at || "",
            leadershipScore: caseStudy.leadership_score ?? null,
            teamworkScore: caseStudy.teamwork_score ?? null,
            publicSpeakingScore: caseStudy.public_speaking_score ?? null,
            analyticalScore: caseStudy.analytical_score ?? null,
          })),
        };
      })
      .filter(
        (prospect) =>
          prospect.comments.length > 0 ||
          prospect.startedApp ||
          prospect.caseStudyYesInvitesCount > 0
      );

    return rows.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (b.goodCommentsCount !== a.goodCommentsCount) {
        return b.goodCommentsCount - a.goodCommentsCount;
      }
      if (b.caseStudyYesInvitesCount !== a.caseStudyYesInvitesCount) {
        return b.caseStudyYesInvitesCount - a.caseStudyYesInvitesCount;
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

    const { data: totalCommentsRows, error: totalCommentsError } = await supabase
      .from("comments")
      .select("id, created_at, prospect_id, active_id, prospect_name, active_name, comment, interaction, rubric_categories");

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

    const [caseStudyActives, interviewActives] = await Promise.all([
      supabase.from("case_studies").select("active"),
      supabase.from("interviews").select("active_id"),
    ]);

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

    const latestComments = getLatestCommentsByThread(
      toThreadableComments(totalCommentsRows as CommentRow[] | null)
    );

    const uniqueParticipatingActives = new Set([
      ...latestComments.map((comment) => comment.active_id),
      ...(caseStudyActives.data?.map((participant) => participant.active) || []),
      ...(interviewActives.data?.map((participant) => participant.active_id) || []),
    ].filter(Boolean)).size;

    const prospectCoverage = await getProspectCoverage();
    const prospectsNeedingEvaluations = prospectCoverage.filter(
      (prospect) => prospect.needsMoreEvaluations
    ).length;

    const totalEvaluations =
      latestComments.length + (totalCaseStudies || 0) + (totalInterviews || 0);
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
      totalComments: latestComments.length,
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
