import React, { useState, useMemo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "@/utils/supabase/client";
import { getUserScores, getProspectComments } from '@/app/supabase/clientQueries';
import {
  GOOD_COMMENT_SCORE_WEIGHT,
  calculatePacketScoreComponents,
  calculateTotalScoreWithGoodComments,
  formatScore,
} from "@/lib/packetScore";
import { type CommentThread } from "@/lib/types";
import {
  ADDITIONAL_DETAILS_QUESTION,
  COMFORT_ZONE_QUESTION,
  COMMUNITY_CONTRIBUTION_QUESTION,
  CURRENT_CLASSES_QUESTION,
  EXTRACURRICULAR_ACTIVITIES_QUESTION,
  JOY_QUESTION,
  KARAOKE_SONG_QUESTION,
  PREVIOUS_RUSH_QUESTION,
  PROUD_ACCOMPLISHMENT_QUESTION,
  WHY_AKPSI_QUESTION,
} from "@/utils/applicationQuestions";
import customToast from "./CustomToast";
import Image from "next/image";
import AvatarUpload from "./AvatarUpload";

interface Application {
  id: string;
  created_at: string;
  name: string;
  pronouns: string;
  phone_number: string;
  personal_email: string | null;
  social_media: string | null;
  year: string;
  graduation_qtr: string;
  graduation_year: number;
  college: string;
  major: string;
  minors: string;
  gpa: number;
  classes: string;
  extracirriculars: string;
  previous_rush_terms: string;
  accomplishment: string;
  why_akpsi: string;
  goals: string;
  comfort_zone: string;
  business: string;
  karaoke_song: string | null;
  additional: string;
  resume: string;
  cover_letter: string;
  submitted: string;
  last_updated: string;
  user_id: string;
}

export interface Interview {
  active_name: string;
  other_actives: string;
  about_yourself: string;
  career_interests: string;
  instance_for_friend: string;
  failure_overcome: string;
  disagreement_handled: string;
  handling_criticism: string;
  learning_about: string;
  silly_question: string | null;
  questions_and_commitments: string;
  why_give_bid: string;
  most_influential: string;
  more_questions: string;
  events_attended: string;
  empathy: number;
  open_minded: number;
  pledgeable: number;
  motivated: number;
  socially_aware: number;
}

interface Case {
  id: string;
  prospect: string;
  active: string;
  leadership_score: number;
  leadership_comments: string;
  teamwork_score: number;
  teamwork_comments: string;
  analytical_score: number;
  analytical_comments: string;
  public_speaking_score: number;
  public_speaking_comments: string;
  role: string;
  thoughts: string;
  additional: string;
}

interface ApplicationPopupProps {
  application: Application;
  cases: Case[];
  interviews: Interview[];
  userID: string;
  isPIC: boolean;
  isLoadingCasesInterviews?: boolean;
  onClose: () => void;
}

type ApplicationResponseKey =
  | "classes"
  | "extracirriculars"
  | "previous_rush_terms"
  | "accomplishment"
  | "why_akpsi"
  | "goals"
  | "comfort_zone"
  | "business"
  | "karaoke_song"
  | "additional";

const APPLICATION_RESPONSE_FIELDS: Array<{
  key: ApplicationResponseKey;
  prompt: string;
}> = [
  {
    key: "classes",
    prompt: CURRENT_CLASSES_QUESTION,
  },
  {
    key: "extracirriculars",
    prompt: EXTRACURRICULAR_ACTIVITIES_QUESTION,
  },
  {
    key: "previous_rush_terms",
    prompt: PREVIOUS_RUSH_QUESTION,
  },
  {
    key: "accomplishment",
    prompt: PROUD_ACCOMPLISHMENT_QUESTION,
  },
  {
    key: "why_akpsi",
    prompt: WHY_AKPSI_QUESTION,
  },
  {
    key: "goals",
    prompt: COMMUNITY_CONTRIBUTION_QUESTION,
  },
  {
    key: "comfort_zone",
    prompt: COMFORT_ZONE_QUESTION,
  },
  {
    key: "business",
    prompt: JOY_QUESTION,
  },
  {
    key: "karaoke_song",
    prompt: KARAOKE_SONG_QUESTION,
  },
  {
    key: "additional",
    prompt: ADDITIONAL_DETAILS_QUESTION,
  },
];

const SCORE_COMPONENT_COPY: Record<
  string,
  { label: string; tooltip: string }
> = {
  pledgeFactor: {
    label: "Downbad for AKPsi",
    tooltip:
      "From the interview rubric's Downbad for AKPsi / pledgeable score. Average interview score divided by 5, then scaled to 15 points.",
  },
  professionalFactor: {
    label: "Open-mindedness",
    tooltip:
      "From the interview rubric's Open-mindedness score. Average interview score divided by 5, then scaled to 10 points.",
  },
  curious: {
    label: "Motivated",
    tooltip:
      "From the interview rubric's Motivated score. Average interview score divided by 5, then scaled to 7 points.",
  },
  events: {
    label: "Events",
    tooltip:
      "From interview events attended. Average event count is rounded up, then 2 is subtracted for a 3-point component.",
  },
  resumeScore: {
    label: "Resume Score",
    tooltip:
      "From PIC resume scores. Average resume score divided by 8, then scaled to 14 points.",
  },
  coverLetterScore: {
    label: "Cover Letter Score",
    tooltip: "From application cover letter presence. 1 point if present, 0 if not.",
  },
  applicationProfessionalismScore: {
    label: "Application Professionalism Score",
    tooltip:
      "From PIC application professionalism scores. Average score divided by 5, then scaled to 12.5 points.",
  },
  applicationBrotherhoodScore: {
    label: "Application Brotherhood Score",
    tooltip:
      "From PIC application brotherhood scores. Average score divided by 5, then scaled to 12.5 points.",
  },
  teamworkScore: {
    label: "Teamwork Score",
    tooltip:
      "From case study teamwork scores. Average score divided by 5, then scaled to 10 points.",
  },
  leadershipScore: {
    label: "Leadership Score",
    tooltip:
      "From case study leadership scores. Average score divided by 5, then scaled to 10 points.",
  },
  analyticalScore: {
    label: "Analytical Score",
    tooltip:
      "From case study analytical scores. Average score divided by 5, then scaled to 5 points.",
  },
};

function TotalScoreInfoButton({ tooltip }: { tooltip: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        aria-label={tooltip}
      >
        <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4" />
      </button>
      <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-border bg-popover px-3 py-2 text-left text-xs font-normal normal-case text-popover-foreground opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        {tooltip}
      </span>
    </span>
  );
}

const ApplicationPopup: React.FC<ApplicationPopupProps> = ({
  application,
  cases,
  interviews,
  userID,
  isPIC,
  isLoadingCasesInterviews = false,
  onClose,
}) => {
  const [viewDocument, setViewDocument] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("application");
  const [expandedCommentThreads, setExpandedCommentThreads] = useState<Record<string, boolean>>({});
  const supabase = useMemo(() => createClient(), []);
  const [appProfessionalismScore, setAppProfessionalismScore] = useState("");
  const [appBrotherhoodScore, setAppBrotherhoodScore] = useState("");
  const [packetFlagsDraft, setPacketFlagsDraft] = useState("");

  const [scoreResume, setScoreResume] = useState("");
  const queryClient = useQueryClient();

  // React Query hooks for data fetching
  const { data: userScores, isSuccess: hasLoadedUserScores } = useQuery({
    queryKey: ['userScores', userID],
    queryFn: () => getUserScores(userID),
    enabled: !!userID,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  const { data: prospectComments = [], isSuccess: hasLoadedProspectComments } = useQuery({
    queryKey: ['prospectComments', userID],
    queryFn: () => getProspectComments(userID),
    enabled: !!userID,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const { data: packetFlags = "" } = useQuery({
    queryKey: ['packetFlags', userID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packet_flags")
        .select("flags")
        .eq("prospect_id", userID)
        .maybeSingle();

      if (error) throw error;
      return data?.flags || "";
    },
    enabled: !!userID,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: avatarUrl = "" } = useQuery({
    queryKey: ['userAvatar', userID],
    queryFn: async () => {
      const response = await fetch('/api/applicant-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userID })
      });
      if (!response.ok) throw new Error('Failed to fetch avatar');
      const data = await response.json();
      return data.avatarUrl || "";
    },
    enabled: !!userID,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Extract scores from React Query data
  const currentOldAppScore = userScores?.appScore || "";
  const currentAppProfessionalismScore = userScores?.appProfessionalismScore || "";
  const currentAppBrotherhoodScore = userScores?.appBrotherhoodScore || "";
  const currentScoreResume = userScores?.resumeScore || "";
  const averageOldAppScore = userScores?.averageOldAppScore ?? null;
  const averageAppProfessionalismScore = userScores?.averageAppProfessionalismScore ?? null;
  const averageAppBrotherhoodScore = userScores?.averageAppBrotherhoodScore ?? null;
  const averageResumeScore = userScores?.averageResumeScore ?? null;
  const appScoreCount = userScores?.appScoreCount ?? 0;
  const appProfessionalismScoreCount = userScores?.appProfessionalismScoreCount ?? 0;
  const appBrotherhoodScoreCount = userScores?.appBrotherhoodScoreCount ?? 0;
  const resumeScoreCount = userScores?.resumeScoreCount ?? 0;
  const usesLegacyAppScore = userScores?.usesLegacyAppScore ?? false;
  const usesLegacyResumeScore = userScores?.usesLegacyResumeScore ?? false;
  const hasCompleteSplitApplicationScores =
    averageAppProfessionalismScore != null && averageAppBrotherhoodScore != null;
  const showOldApplicationScoreReference =
    averageOldAppScore != null && !hasCompleteSplitApplicationScores;

  useEffect(() => {
    setPacketFlagsDraft(packetFlags);
  }, [packetFlags]);

  // React Query mutations
  const updateAppScoreMutation = useMutation({
    mutationFn: async ({
      scoreType,
      newScore,
    }: {
      scoreType: "application_professionalism" | "application_brotherhood";
      newScore: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to score a packet.");
      }

      const { data, error } = await supabase
        .from("packet_scores")
        .upsert(
          {
            prospect_id: userID,
            scorer_id: user.id,
            score_type: scoreType,
            score: Number(newScore),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "prospect_id,scorer_id,score_type" }
        )
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      customToast("Application score updated successfully!", "success");
      setAppProfessionalismScore("");
      setAppBrotherhoodScore("");
      queryClient.invalidateQueries({ queryKey: ['userScores', userID] });
      queryClient.invalidateQueries({ queryKey: ['prospect-analytics'] });
    },
    onError: (error: any) => {
      customToast(`Error: ${error.message}`, "error");
    },
  });

  const updateResumeScoreMutation = useMutation({
    mutationFn: async (newScore: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to score a packet.");
      }

      const { data, error } = await supabase
        .from("packet_scores")
        .upsert(
          {
            prospect_id: userID,
            scorer_id: user.id,
            score_type: "resume",
            score: Number(newScore),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "prospect_id,scorer_id,score_type" }
        )
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      customToast("Resume score updated successfully!", "success");
      setScoreResume("");
      queryClient.invalidateQueries({ queryKey: ['userScores', userID] });
      queryClient.invalidateQueries({ queryKey: ['prospect-analytics'] });
    },
    onError: (error: any) => {
      customToast(`Error: ${error.message}`, "error");
    },
  });

  const updatePacketFlagsMutation = useMutation({
    mutationFn: async (newFlags: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be signed in to edit packet flags.");
      }

      const { data, error } = await supabase
        .from("packet_flags")
        .upsert(
          {
            prospect_id: userID,
            flags: newFlags,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "prospect_id" }
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      customToast("Packet flags updated successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ['packetFlags', userID] });
    },
    onError: (error: any) => {
      customToast(`Error: ${error.message}`, "error");
    },
  });


  const handleViewDocument = (documentUrl: string) => {
    setViewDocument(documentUrl);
  };



  const calculateIvAverages = useCallback((interviews: Interview[]) => {
    if (interviews.length === 0) {
      return {
        empathy: 0,
        open_minded: 0,
        pledgeable: 0,
        motivated: 0,
        socially_aware: 0,
        events_attended: 0,
      };
    }

    const totalScores = interviews.reduce(
      (acc, curr) => {
        const eventsCount = curr.events_attended
          ? curr.events_attended.split(",").length
          : 0;
        return {
          empathy: acc.empathy + curr.empathy,
          open_minded: acc.open_minded + curr.open_minded,
          pledgeable: acc.pledgeable + curr.pledgeable,
          motivated: acc.motivated + curr.motivated,
          socially_aware: acc.socially_aware + curr.socially_aware,
          events_attended: acc.events_attended + eventsCount,
        };
      },
      {
        empathy: 0,
        open_minded: 0,
        pledgeable: 0,
        motivated: 0,
        socially_aware: 0,
        events_attended: 0,
      }
    );

    const averages = {
      empathy: totalScores.empathy / interviews.length,
      open_minded: totalScores.open_minded / interviews.length,
      pledgeable: totalScores.pledgeable / interviews.length,
      motivated: totalScores.motivated / interviews.length,
      socially_aware: totalScores.socially_aware / interviews.length,
      events_attended: Math.ceil(
        totalScores.events_attended / interviews.length
      ),
    };

    return averages;
  }, []);

  const calculateAverages = useCallback((cases: Case[]) => {
    if (cases.length === 0) {
      return {
        leadership_avg: 0,
        teamwork_avg: 0,
        analytical_avg: 0,
        public_speaking_avg: 0,
      };
    }

    const totalScores = cases.reduce(
      (acc, curr) => ({
        leadership_score: acc.leadership_score + curr.leadership_score,
        teamwork_score: acc.teamwork_score + curr.teamwork_score,
        analytical_score: acc.analytical_score + curr.analytical_score,
        public_speaking_score:
          acc.public_speaking_score + curr.public_speaking_score,
      }),
      {
        leadership_score: 0,
        teamwork_score: 0,
        analytical_score: 0,
        public_speaking_score: 0,
      }
    );

    const averages = {
      leadership_avg: totalScores.leadership_score / cases.length,
      teamwork_avg: totalScores.teamwork_score / cases.length,
      analytical_avg: totalScores.analytical_score / cases.length,
      public_speaking_avg: totalScores.public_speaking_score / cases.length,
    };

    return averages;
  }, []);

  const ivAverages = useMemo(
    () => calculateIvAverages(interviews),
    [interviews, calculateIvAverages]
  );
  const averages = useMemo(
    () => calculateAverages(cases),
    [cases, calculateAverages]
  );

  const handleAppProfessionalismScoreChange = (e: any) => {
    const value = e.target.value;
    if (value === "" || /^[1-5]$/.test(value)) {
      setAppProfessionalismScore(value);
    }
  };

  const handleAppBrotherhoodScoreChange = (e: any) => {
    const value = e.target.value;
    if (value === "" || /^[1-5]$/.test(value)) {
      setAppBrotherhoodScore(value);
    }
  };


  const handleScoreChangeResume = (e: any) => {
    const value = e.target.value;
    const numValue = Number(value);
    if (value === "" || (numValue >= 1 && numValue <= 8)) {
      setScoreResume(value);
    }
  };



  const handleSubmit = async () => {
    const scoreUpdates = [
      {
        scoreType: "application_professionalism" as const,
        newScore: appProfessionalismScore,
      },
      {
        scoreType: "application_brotherhood" as const,
        newScore: appBrotherhoodScore,
      },
    ].filter((scoreUpdate) => scoreUpdate.newScore !== "");

    if (scoreUpdates.length === 0) {
      customToast("Please enter a score before submitting.", "error");
      return;
    }

    scoreUpdates.forEach((scoreUpdate) => {
      updateAppScoreMutation.mutate(scoreUpdate);
    });
  };

  const handleSubmitResume = async () => {
    if (scoreResume === "") {
      customToast("Please enter a score before submitting.", "error");
      return;
    }
    updateResumeScoreMutation.mutate(scoreResume);
  };

  const handleSubmitPacketFlags = async () => {
    updatePacketFlagsMutation.mutate(packetFlagsDraft);
  };




  const scoreComponents = useMemo(() => {
    return calculatePacketScoreComponents({
      applicationProfessionalismScore: averageAppProfessionalismScore,
      applicationBrotherhoodScore: averageAppBrotherhoodScore,
      resumeScore: averageResumeScore,
      caseStudies: cases,
      interviews,
      hasCoverLetter: Boolean(application.cover_letter),
    });
  }, [
    averageAppProfessionalismScore,
    averageAppBrotherhoodScore,
    averageResumeScore,
    cases,
    interviews,
    application.cover_letter,
  ]);
  const goodCommentsCount = useMemo(
    () =>
      prospectComments.filter(
        (thread) => thread.latest_comment.interaction === "Good"
      ).length,
    [prospectComments]
  );
  const totalScoreWithGoodComments = useMemo(
    () =>
      calculateTotalScoreWithGoodComments({
        packetScore: scoreComponents.totalScore,
        goodCommentsCount,
      }),
    [scoreComponents.totalScore, goodCommentsCount]
  );
  const totalScoreTooltip =
    `Total score = packet score (${formatScore(scoreComponents.totalScore)}) + ` +
    `${GOOD_COMMENT_SCORE_WEIGHT} x good comments (${goodCommentsCount}) = ` +
    `${formatScore(totalScoreWithGoodComments)}.`;

  useEffect(() => {
    if (
      hasLoadedUserScores &&
      hasLoadedProspectComments &&
      !isLoadingCasesInterviews &&
      totalScoreWithGoodComments > 0
    ) {
      const updateTotalScore = async () => {
        try {
          const { error } = await supabase
            .from("users")
            .update({ total_score: Number(totalScoreWithGoodComments.toFixed(2)) })
            .eq("id", userID);

          if (error) {
            customToast(`Error updating total score: ${error.message}`, "error");
          } else {
            // Invalidate the applicant data cache to refresh the preview card
            queryClient.invalidateQueries({ queryKey: ['applicantData', userID] });
          }
        } catch (err) {
          customToast("Failed to update total score", "error");
        }
      };

      updateTotalScore();
    }
  }, [
    hasLoadedUserScores,
    hasLoadedProspectComments,
    isLoadingCasesInterviews,
    totalScoreWithGoodComments,
    userID,
    supabase,
    queryClient,
  ]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 pt-8 pb-8">
      <div className="mx-4 w-full max-w-8xl space-y-4 overflow-auto rounded-xl border border-border bg-card p-6 shadow-2xl" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        <div className="mb-6 space-y-4">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-foreground">
              {application.name}&apos;s Packet
            </h2>
            
            <div className="relative">
              <button
                onClick={() => setActiveSection("avatar")}
                className="transition duration-300 hover:scale-[1.04]"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border bg-muted">
                    <span className="text-xs text-muted-foreground">No Image</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Navigation and Actions Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              <button
                onClick={() => setActiveSection("application")}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  activeSection === "application"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "border border-border bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                App
              </button>
              {(
                <>
                  <button
                    onClick={() => setActiveSection("cases")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      activeSection === "cases"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "border border-border bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    Cases
                  </button>
                  <button
                    onClick={() => setActiveSection("interviews")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      activeSection === "interviews"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "border border-border bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    Interviews
                  </button>
                  <button
                    onClick={() => setActiveSection("comments")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      activeSection === "comments"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "border border-border bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    Comments
                  </button>
                  <button
                    onClick={() => setActiveSection("scoring")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      activeSection === "scoring"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "border border-border bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    Scoring
                  </button>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-2">
              {(
                <>
                  <button
                    onClick={() => handleViewDocument(application.resume)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      application.resume
                        ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
                        : "cursor-not-allowed border border-border bg-muted text-muted-foreground"
                    }`}
                    disabled={!application.resume}
                  >
                    Resume
                  </button>

                  <button
                    onClick={() => handleViewDocument(application.cover_letter)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      application.cover_letter
                        ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
                        : "cursor-not-allowed border border-border bg-muted text-muted-foreground"
                    }`}
                    disabled={!application.cover_letter}
                  >
                    Cover
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-auto" style={{ maxHeight: "80vh" }}>
          <div className="space-y-4">
            {activeSection === "application" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-foreground">
                      Flags
                    </h3>
                    {isPIC && (
                      <button
                        onClick={handleSubmitPacketFlags}
                        disabled={updatePacketFlagsMutation.isPending}
                        className="btn btn-primary rounded-lg px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatePacketFlagsMutation.isPending ? "Saving..." : "Save Flags"}
                      </button>
                    )}
                  </div>
                  {isPIC ? (
                    <div className="space-y-3">
                      <textarea
                        className="min-h-24 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Add packet flags for PIC..."
                        value={packetFlagsDraft}
                        onChange={(event) => setPacketFlagsDraft(event.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="min-h-20 rounded-lg border border-border bg-muted/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-line">
                      {packetFlags.trim() || "No flags added."}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-bold text-foreground">
                      Personal Details
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-900">Pronouns:</span>
                        <span className="text-foreground">{application.pronouns}</span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-900">Phone Number:</span>
                        <span className="text-foreground">{application.phone_number}</span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-900">Personal Email:</span>
                        <span className="text-foreground">
                          {application.personal_email || "N/A"}
                        </span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-900">Social Media:</span>
                        <div className="text-foreground">
                          {application.social_media ? (
                            <ul className="mt-1 space-y-1">
                              {Object.entries(application.social_media).map(
                                ([platform, answer], index) => {
                                  // Check if the answer looks like a URL
                                  const isUrl = typeof answer === 'string' && 
                                    (answer.startsWith('http://') || 
                                     answer.startsWith('https://') || 
                                     answer.startsWith('www.') ||
                                     answer.includes('.com') ||
                                     answer.includes('.org') ||
                                     answer.includes('.net'));
                                  
                                  // Ensure URL has proper protocol
                                  const url = isUrl && !answer.startsWith('http') 
                                    ? `https://${answer}` 
                                    : answer;
                                  
                                  return (
                                    <li key={index} className="text-sm">
                                      <span className="font-medium text-blue-800">
                                        {platform.charAt(0).toUpperCase() + platform.slice(1)}:
                                      </span>{" "}
                                      {isUrl ? (
                                        <a 
                                          href={url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-700 underline hover:text-blue-900"
                                        >
                                          {answer}
                                        </a>
                                      ) : (
                                        answer
                                      )}
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-bold text-foreground">
                      Academic Details
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-900">Year:</span>
                        <span className="text-foreground">{application.year}</span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-900">Graduation Year:</span>
                        <span className="text-foreground">{application.graduation_year}</span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-900">Graduation Quarter:</span>
                        <span className="text-foreground">{application.graduation_qtr}</span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-900">Major:</span>
                        <span className="text-foreground">{application.major}</span>
                      </li>
                      {application.minors && (
                        <li className="flex flex-col">
                          <span className="font-semibold text-blue-900">Minors:</span>
                          <span className="text-foreground">{application.minors}</span>
                        </li>
                      )}
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-900">GPA:</span>
                        <span className="text-foreground">{application.gpa}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-xl font-bold text-foreground">
                      Scores
                    </h3>
                    {(
                      <ul className="space-y-3 text-muted-foreground">
                        <li className="flex flex-col">
                          <span className="font-semibold text-blue-900">Case Study:</span>
                          <span className="text-foreground font-mono">
                            {Object.values(averages)
                              .reduce((acc, cur) => acc + cur, 0)
                              .toFixed(2)}
                          </span>
                        </li>
                        <li className="flex flex-col">
                          <span className="font-semibold text-blue-900">Interview:</span>
                          <span className="text-foreground font-mono">
                            {Object.values(ivAverages)
                              .reduce((acc, cur) => acc + cur, 0)
                              .toFixed(2)}
                          </span>
                        </li>
                        <li className="flex flex-col">
                          <span className="font-semibold text-blue-900">
                            Application Score:
                          </span>
                          <span className="mb-3 text-base text-foreground">
                            Prof:{" "}
                            <span className="font-mono">
                              {averageAppProfessionalismScore != null
                                ? `${averageAppProfessionalismScore.toFixed(2)} / 5`
                                : "not set"}
                            </span>
                            {" • "}
                            Broho:{" "}
                            <span className="font-mono">
                              {averageAppBrotherhoodScore != null
                                ? `${averageAppBrotherhoodScore.toFixed(2)} / 5`
                                : "not set"}
                            </span>
                          </span>
                          <span className="mb-1 text-xs leading-snug text-muted-foreground">
                            Prof avg from {appProfessionalismScoreCount} PIC score{appProfessionalismScoreCount === 1 ? "" : "s"}.
                            {" "}Broho avg from {appBrotherhoodScoreCount} PIC score{appBrotherhoodScoreCount === 1 ? "" : "s"}.
                            {currentAppProfessionalismScore !== "" ? ` • your prof: ${currentAppProfessionalismScore}` : ""}
                            {currentAppBrotherhoodScore !== "" ? ` • your broho: ${currentAppBrotherhoodScore}` : ""}
                          </span>
                          {showOldApplicationScoreReference ? (
                            <span className="mb-1 text-xs leading-snug text-muted-foreground">
                              Old application score reference: {averageOldAppScore?.toFixed(2)} / 8
                              {usesLegacyAppScore
                                ? " from legacy user score"
                                : ` from ${appScoreCount} previous PIC score${appScoreCount === 1 ? "" : "s"}`}
                              {currentOldAppScore !== "" ? ` • your old score: ${currentOldAppScore}` : ""}
                            </span>
                          ) : null}
                          <span className="mb-1 text-xs leading-snug text-muted-foreground">
                            One prof score and one broho score per PIC member
                          </span>
                          {isPIC &&
                          (currentAppProfessionalismScore !== "" ||
                            currentAppBrotherhoodScore !== "") &&
                          appProfessionalismScore === "" &&
                          appBrotherhoodScore === "" ? (
                            <span className="mb-2 text-xs leading-snug text-muted-foreground">
                              Submit again to replace your existing application scores.
                            </span>
                          ) : null}
                          {isPIC && (
                            <div className="space-y-2">
                              <div className="flex flex-col gap-2 sm:flex-row">
                                <label className="flex flex-col text-xs font-semibold text-blue-900">
                                  Prof
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[1-5]"
                                    className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="1-5"
                                    value={appProfessionalismScore}
                                    onChange={handleAppProfessionalismScoreChange}
                                  />
                                </label>
                                <label className="flex flex-col text-xs font-semibold text-blue-900">
                                  Broho
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[1-5]"
                                    className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="1-5"
                                    value={appBrotherhoodScore}
                                    onChange={handleAppBrotherhoodScoreChange}
                                  />
                                </label>
                              </div>
                              <button
                                onClick={handleSubmit}
                                disabled={updateAppScoreMutation.isPending}
                                className="btn btn-primary rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {updateAppScoreMutation.isPending ? "Submitting..." : "Submit Application Scores"}
                              </button>
                            </div>
                          )}
                        </li>
                        <li className="flex flex-col">
                          <span className="font-semibold text-blue-900">Resume Score:</span>
                          <span className="text-foreground font-mono">
                            {averageResumeScore != null ? averageResumeScore.toFixed(2) : "not set"}
                          </span>
                          <span className="mb-2 text-xs text-muted-foreground">
                            {usesLegacyResumeScore
                              ? "Using legacy resume score"
                              : resumeScoreCount > 0
                                ? `Avg from ${resumeScoreCount} PIC score${resumeScoreCount === 1 ? "" : "s"}`
                                : "No PIC resume scores yet"}
                            {currentScoreResume !== "" ? ` • your score: ${currentScoreResume}` : ""}
                          </span>
                          <span className="mb-2 text-xs text-muted-foreground">
                            One resume score per PIC member
                          </span>
                          {isPIC && currentScoreResume !== "" && scoreResume === "" ? (
                            <span className="mb-2 text-xs text-muted-foreground">
                              Submit again to replace your existing resume score.
                            </span>
                          ) : null}
                          {isPIC && (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[1-7]|8"
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="1-8"
                                value={scoreResume}
                                onChange={handleScoreChangeResume}
                              />
                              <button
                                onClick={handleSubmitResume}
                                className="btn btn-primary rounded-lg px-3 py-2 text-sm font-semibold"
                              >
                                Submit
                              </button>
                            </div>
                          )}
                        </li>
                        <li className="flex flex-col border-t border-border pt-2">
                          <span className="flex items-center gap-2 text-lg font-bold text-emerald-700">
                            <span>
                              Total Score: <span className="font-mono">{formatScore(totalScoreWithGoodComments)}</span>
                            </span>
                            <TotalScoreInfoButton tooltip={totalScoreTooltip} />
                          </span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="mb-6 text-xl font-bold text-foreground">
                    Long Response
                  </h3>
                  <div className="grid grid-cols-1 gap-6 text-muted-foreground md:grid-cols-2 lg:grid-cols-3">
                    {APPLICATION_RESPONSE_FIELDS.map(({ key, prompt }) => (
                      <div
                        key={key}
                        className="rounded-lg border border-border bg-muted/50 p-4"
                      >
                        <div className="mb-3 text-left text-base font-semibold leading-relaxed text-blue-900">
                          {prompt}
                        </div>
                        <div className="text-foreground text-sm leading-relaxed whitespace-pre-line">
                          {application[key]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cases Evaluation Section */}
            {activeSection === "cases" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground mb-6">Case Study Notes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                    <div className="text-blue-900 font-semibold mb-2">
                      Leadership
                    </div>
                    <div className="text-2xl font-bold text-foreground font-mono">
                      {averages.leadership_avg.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                    <div className="text-blue-900 font-semibold mb-2">
                      Teamwork
                    </div>
                    <div className="text-2xl font-bold text-foreground font-mono">
                      {averages.teamwork_avg.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                    <div className="text-blue-900 font-semibold mb-2">
                      Analytical
                    </div>
                    <div className="text-2xl font-bold text-foreground font-mono">
                      {averages.analytical_avg.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                    <div className="text-blue-900 font-semibold mb-2">
                      Public Speaking
                    </div>
                    <div className="text-2xl font-bold text-foreground font-mono">
                      {averages.public_speaking_avg.toFixed(2)}
                    </div>
                  </div>
                </div>
                {/* Assuming all cases have the same structure, iterate over the keys of the first case to create a layout */}
                {cases.length > 0 && cases[0] &&
                  Object.keys(cases[0])
                    .filter((key) => ["active_name"].includes(key)) // Adjust as needed to exclude irrelevant keys
                    .map((attribute) => (
                      <div
                        key={attribute}
                        className={`mb-3 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-5`}
                      >
                        <div className="col-span-1 font-semibold text-blue-900">
                          {attribute
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                          :
                        </div>
                        {/* Display each case's attribute next to the type */}
                        {cases.map((caseItem, index) => (
                          <div key={index} className="text-foreground md:col-span-1 rounded border border-border bg-muted/40 p-2 text-sm whitespace-pre-line">
                            {/* Check if the attribute needs special formatting or handling */}
                            {typeof caseItem[attribute as keyof Case] ===
                            "number"
                              ? caseItem[attribute as keyof Case]
                              : caseItem[attribute as keyof Case]}
                          </div>
                        ))}
                      </div>
                    ))}
                {cases.length > 0 && cases[0] &&
                  Object.keys(cases[0])
                    .filter((key) => ["other_actives"].includes(key)) // Adjust as needed to exclude irrelevant keys
                    .map((attribute) => (
                      <div
                        key={attribute}
                        className={`mb-3 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-5`}
                      >
                        <div className="col-span-1 font-semibold text-blue-900">
                          {attribute
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                          :
                        </div>
                        {/* Display each case's attribute next to the type */}
                        {cases.map((caseItem, index) => (
                          <div key={index} className="text-foreground md:col-span-1 rounded border border-border bg-muted/40 p-2 text-sm whitespace-pre-line">
                            {/* Check if the attribute needs special formatting or handling */}
                            {typeof caseItem[attribute as keyof Case] ===
                            "number"
                              ? caseItem[attribute as keyof Case]
                              : caseItem[attribute as keyof Case]}
                          </div>
                        ))}
                      </div>
                    ))}
                {cases.length > 0 && cases[0] &&
                  Object.keys(cases[0])
                    .filter(
                      (key) =>
                        ![
                          "id",
                          "prospect",
                          "active",
                          "active_name",
                          "other_actives",
                        ].includes(key)
                    ) // Adjust as needed to exclude irrelevant keys
                    .map((attribute) => (
                      <div
                        key={attribute}
                        className={`mb-3 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-5`}
                      >
                        <div className="col-span-1 font-semibold text-blue-900">
                          {attribute
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                          :
                        </div>
                        {/* Display each case's attribute next to the type */}
                        {cases.map((caseItem, index) => (
                          <div key={index} className="text-foreground md:col-span-1 rounded border border-border bg-muted/40 p-2 text-sm whitespace-pre-line">
                            {/* Check if the attribute needs special formatting or handling */}
                            {typeof caseItem[attribute as keyof Case] ===
                            "number"
                              ? caseItem[attribute as keyof Case]
                              : caseItem[attribute as keyof Case]}
                          </div>
                        ))}
                      </div>
                    ))}
              </div>
            )}

            {/* Interview Responses Section */}
            {activeSection === "interviews" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground mb-6">Interview Notes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  {Object.entries(ivAverages).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-border bg-card p-4 text-center shadow-sm"
                    >
                      <div className="text-blue-900 font-semibold mb-2 capitalize text-sm">
                        {key.replace('_', ' ')}
                      </div>
                      <div className="text-xl font-bold text-foreground font-mono">
                        {isNaN(value) ? "N/A" : value.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Create an array of unique keys/questions from the first interview (assuming all interviews have the same keys) */}
                {interviews.length > 0 && interviews[0] && (
                  <>
                    {/* Manually render active_name and other_actives first if they exist */}
                    {["active_name", "other_actives"].map((key) => (
                      <div
                        key={key}
                        className={`mb-3 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-5`}
                      >
                        <div className="col-span-1 font-semibold text-blue-900">
                          {key
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                          :
                        </div>
                        {interviews.map((interview, index) => (
                          <div key={index} className="md:col-span-1 rounded border border-border bg-muted/40 p-2 text-sm text-foreground whitespace-pre-line">
                            {interview[key as keyof Interview]}
                          </div>
                        ))}
                      </div>
                    ))}
                    {/* Dynamically render the rest of the keys excluding active_name and other_actives */}
                    {Object.keys(interviews[0])
                      .filter(
                        (key) =>
                          ![
                            "id",
                            "prospect_id",
                            "active_id",
                            "active_name",
                            "other_actives",
                          ].includes(key)
                      )
                      .map((question) => (
                        <div
                          key={question}
                          className={`mb-3 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-5`}
                        >
                          <div className="col-span-1 font-semibold text-blue-900">
                            {question === "learning_about"
                              ? "Achievement"
                              : question
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")}
                            :
                          </div>
                          {interviews.map((interview, index) => (
                            <div key={index} className="md:col-span-1 rounded border border-border bg-muted/40 p-2 text-sm text-foreground whitespace-pre-line">
                              {interview[question as keyof Interview]}
                            </div>
                          ))}
                        </div>
                      ))}
                  </>
                )}
              </div>
            )}

            {activeSection === "comments" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  Prospect Comment Forms
                </h3>
                {/* {isPIC ? (
                  <>
                    <h3 className="mb-2 text-lg font-semibold">
                      Comment Input
                    </h3>
                    <div className="mb-4 mt-2 flex flex-wrap gap-4">
                      <div className="flex items-center">
                        <input
                          type="text"
                          className="input mr-2 mt-1 rounded px-2 py-1 text-lg text-black"
                          placeholder="Active name"
                          value={activeName}
                          onChange={handleActiveName}
                        />{" "}
                        <div className="w-full">
                          <input
                            type="text"
                            className="input mr-2 mt-1 rounded px-2 py-1 text-lg text-black"
                            placeholder="Prospect comment"
                            value={comment}
                            onChange={handleComment}
                          />
                        </div>
                        <button
                          onClick={handleCommentSubmit}
                          className="mt-1 rounded bg-blue-500 px-2 py-1 text-lg font-bold text-white hover:bg-blue-700"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )} */}
                <div className="rounded-md border border-border bg-card p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-center">
                    <div className="mb-2 rounded-lg border border-border bg-muted/50 p-4 text-center text-lg font-bold capitalize text-blue-900 shadow-sm">
                      Active
                    </div>
                    <div className="mb-2 rounded-lg border border-border bg-muted/50 p-4 text-center text-lg font-bold capitalize text-blue-900 shadow-sm">
                      Interaction
                    </div>
                    <div className="mb-2 rounded-lg border border-border bg-muted/50 p-4 text-center text-lg font-bold capitalize text-blue-900 shadow-sm">
                      Rubric Tags
                    </div>
                    <div className="mb-2 rounded-lg border border-border bg-muted/50 p-4 text-center text-lg font-bold capitalize text-blue-900 shadow-sm">
                      Comment
                    </div>
                  </div>
                  <div className="space-y-3">
                    {prospectComments.map((thread: CommentThread) => {
                      const isExpanded = Boolean(expandedCommentThreads[thread.threadKey]);

                      return (
                        <div key={thread.threadKey} className="rounded-lg border border-border bg-muted/40 p-3">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="font-semibold text-blue-900">
                              {thread.active_name}
                            </div>
                            <div className="text-foreground">
                              {thread.latest_comment.interaction}
                            </div>
                            <div className="text-foreground">
                              {thread.latest_comment.rubric_categories?.length ? (
                                <div className="flex flex-wrap gap-2">
                                  {thread.latest_comment.rubric_categories.map((category: string) => (
                                    <span
                                      key={`${thread.threadKey}-${category}`}
                                      className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-900"
                                    >
                                      {category}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Untagged</span>
                              )}
                            </div>
                            <div className="text-foreground text-sm whitespace-pre-line">
                              {thread.latest_comment.comment}
                            </div>
                          </div>

                          {thread.history.length > 1 ? (
                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCommentThreads((currentValue) => ({
                                    ...currentValue,
                                    [thread.threadKey]: !currentValue[thread.threadKey],
                                  }))
                                }
                                className="text-sm font-medium text-blue-700 hover:text-blue-900"
                              >
                                {isExpanded ? "Hide full history" : `Show full history (${thread.history.length})`}
                              </button>

                              {isExpanded ? (
                                <div className="mt-3 space-y-3">
                                  {thread.history.map((commentEntry) => (
                                    <div
                                      key={commentEntry.id}
                                      className="rounded-lg border border-border bg-background p-3"
                                    >
                                      <div className="mb-2 text-xs text-muted-foreground">
                                        {new Intl.DateTimeFormat("en-US", {
                                          dateStyle: "medium",
                                          timeStyle: "short",
                                        }).format(new Date(commentEntry.created_at))}
                                      </div>
                                      <div className="mb-2 flex flex-wrap gap-2">
                                        <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800">
                                          {commentEntry.interaction}
                                        </span>
                                        {commentEntry.rubric_categories?.length ? (
                                          commentEntry.rubric_categories.map((category) => (
                                            <span
                                              key={`${commentEntry.id}-${category}`}
                                              className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-900"
                                            >
                                              {category}
                                            </span>
                                          ))
                                        ) : (
                                          <span className="rounded-full border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                            Untagged
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm whitespace-pre-line text-foreground">
                                        {commentEntry.comment}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {activeSection === "scoring" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground mb-6">Prospect Scoring</h3>
                <div className="rounded-lg border border-border bg-card p-6">
                  <h4 className="mb-4 text-xl font-semibold text-foreground">Score Components</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {Object.entries(scoreComponents.components).map(
                      ([key, { score, outOf }]) => {
                        const componentCopy = SCORE_COMPONENT_COPY[key] || {
                          label: key.replace(/([A-Z])/g, ' $1').trim(),
                          tooltip: "Score component",
                        };

                        return (
                          <div
                            key={key}
                            className="rounded-lg border border-border bg-muted/50 p-4"
                          >
                            <div className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
                              <span>{componentCopy.label}</span>
                              <span className="group relative inline-flex">
                                <button
                                  type="button"
                                  className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                                  aria-label={componentCopy.tooltip}
                                >
                                  <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    className="h-4 w-4"
                                  />
                                </button>
                                <span className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-72 rounded-lg border border-border bg-popover px-3 py-2 text-left text-xs font-normal normal-case text-popover-foreground opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                                  {componentCopy.tooltip}
                                </span>
                              </span>
                            </div>
                            <div className="font-mono text-lg text-foreground">
                              {formatScore(score)} / {formatScore(outOf)}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                  <div className="text-center">
                    <div className="inline-block rounded-lg border border-emerald-300 bg-emerald-100 p-4">
                      <div className="mb-2 font-semibold text-emerald-900">Total Score</div>
                      <div className="flex items-center justify-center gap-2 font-mono text-2xl font-bold text-foreground">
                        <span>{formatScore(totalScoreWithGoodComments)}</span>
                        <TotalScoreInfoButton tooltip={totalScoreTooltip} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "avatar" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Profile Picture</h3>
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card p-6">
                    <div className="flex justify-center">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="max-h-80 max-w-full w-auto h-auto object-contain rounded-lg shadow-lg"
                          style={{ maxHeight: "50vh", maxWidth: "100%" }}
                        />
                      ) : (
                        <div className="flex h-80 w-80 max-w-full items-center justify-center rounded-lg border-2 border-border bg-muted">
                          <span className="text-lg text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isPIC && (
                    <div className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card p-6">
                      <h4 className="mb-4 text-lg font-semibold text-foreground">Upload New Avatar (PIC Only)</h4>
                      <AvatarUpload
                        userId={userID}
                        existingAvatarUrl={avatarUrl}
                        onAvatarUploaded={() => {
                          queryClient.invalidateQueries({ queryKey: ['userAvatar', userID] });
                          queryClient.invalidateQueries({ queryKey: ['applicantData', userID] });
                        }}
                      />
                      <p className="mt-4 text-sm text-muted-foreground">
                        Upload an image file to be displayed on the applicant card.
                      </p>
                    </div>
                  )}

                 
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document View Modal */}
      {viewDocument && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/50">
          <div className="relative h-5/6 w-full max-w-6xl overflow-auto rounded-xl border border-border bg-card shadow-2xl">
            <div className="h-full w-full rounded-lg overflow-hidden">
              {viewDocument.endsWith(".doc") || viewDocument.endsWith(".docx") ? (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${viewDocument}`}
                  className="h-full w-full rounded-lg"
                ></iframe>
              ) : (
                <iframe src={viewDocument} className="h-full w-full rounded-lg"></iframe>
              )}
            </div>
            <button
              onClick={() => setViewDocument(null)}
              className="absolute right-2 top-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default ApplicationPopup;
