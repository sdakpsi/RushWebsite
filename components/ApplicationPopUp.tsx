import React, { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createClient } from "@/utils/supabase/client";
import { getUserScores, getProspectComments } from '@/app/supabase/clientQueries';
import customToast from "./CustomToast";
import Image from "next/image";
import AvatarUpload from "./AvatarUpload";

interface Application {
  id: string;
  created_at: string;
  name: string;
  pronouns: string;
  phone_number: string;
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
  accomplishment: string;
  why_akpsi: string;
  goals: string;
  comfort_zone: string;
  business: string;
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

interface Comment {
  active_name: string;
  comment: string;
  interaction: string;
  invite: string;
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
  const supabase = createClient();
  const [score, setScore] = useState("");

  const [scoreResume, setScoreResume] = useState("");
  const queryClient = useQueryClient();

  // React Query hooks for data fetching
  const { data: userScores } = useQuery({
    queryKey: ['userScores', userID],
    queryFn: () => getUserScores(userID),
    enabled: !!userID,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });

  const { data: prospectComments = [] } = useQuery({
    queryKey: ['prospectComments', userID],
    queryFn: () => getProspectComments(userID),
    enabled: !!userID,
    staleTime: 30 * 1000, // 30 seconds
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
  const currentAppScore = userScores?.appScore || "";
  const currentScoreResume = userScores?.resumeScore || "";

  // React Query mutations
  const updateAppScoreMutation = useMutation({
    mutationFn: async (newScore: string) => {
      const { data, error } = await supabase
        .from("users")
        .update({ app_score: newScore })
        .eq("id", userID);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      customToast("Score updated successfully!", "success");
      setScore("");
      queryClient.invalidateQueries({ queryKey: ['userScores', userID] });
    },
    onError: (error: any) => {
      customToast(`Error: ${error.message}`, "error");
    },
  });

  const updateResumeScoreMutation = useMutation({
    mutationFn: async (newScore: string) => {
      const { data, error } = await supabase
        .from("users")
        .update({ resume_score: newScore })
        .eq("id", userID);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      customToast("Resume score updated successfully!", "success");
      setScoreResume("");
      queryClient.invalidateQueries({ queryKey: ['userScores', userID] });
    },
    onError: (error: any) => {
      customToast(`Error: ${error.message}`, "error");
    },
  });


  const handleViewDocument = (documentUrl: string) => {
    setViewDocument(documentUrl);
  };



  const [averages, setAverages] = useState({
    leadership_avg: 0,
    teamwork_avg: 0,
    analytical_avg: 0,
    public_speaking_avg: 0,
  });
  const [ivAverages, setIvAverages] = useState({
    empathy: 0,
    open_minded: 0,
    pledgeable: 0,
    motivated: 0,
    socially_aware: 0,
    events_attended: 0,
  });

  const calculateIvAverages = useCallback((interviews: Interview[]) => {
    if (interviews.length === 3) {
      // Check if all three interviews exist before accessing them
      if (interviews[0] && interviews[1] && interviews[2]) {
        // Calculate the average scores from the 3 interviews
        const avgInterview: Interview = {
          active_name: "Average",
          other_actives: "",
          about_yourself: "",
          career_interests: "",
          instance_for_friend: "",
          failure_overcome: "",
          disagreement_handled: "",
          handling_criticism: "",
          learning_about: "",
          silly_question: null,
          questions_and_commitments: "",
          why_give_bid: "",
          most_influential: "",
          more_questions: "",
          events_attended: "Average",
          empathy:
            (interviews[0].empathy +
              interviews[1].empathy +
              interviews[2].empathy) /
            3,
          open_minded:
            (interviews[0].open_minded +
              interviews[1].open_minded +
              interviews[2].open_minded) /
            3,
          pledgeable:
            (interviews[0].pledgeable +
              interviews[1].pledgeable +
              interviews[2].pledgeable) /
            3,
          motivated:
            (interviews[0].motivated +
              interviews[1].motivated +
              interviews[2].motivated) /
            3,
          socially_aware:
            (interviews[0].socially_aware +
              interviews[1].socially_aware +
              interviews[2].socially_aware) /
            3,
        };

        // Add this average as a fourth interview
        interviews = [...interviews, avgInterview];
      }
    }

    // Now proceed with normal averaging (all cases will have 4 interviews)
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
      empathy: totalScores.empathy / 4, // Always divide by 4 now
      open_minded: totalScores.open_minded / 4,
      pledgeable: totalScores.pledgeable / 4,
      motivated: totalScores.motivated / 4,
      socially_aware: totalScores.socially_aware / 4,
      events_attended: Math.ceil(
        totalScores.events_attended / interviews.length
      ),
    };

    return averages;
  }, []);

  const calculateAverages = useCallback((cases: Case[]) => {
    if (cases.length === 3) {
      // Check if all three cases exist before accessing them
      if (cases[0] && cases[1] && cases[2]) {
        // Calculate the average scores from the 3 cases
        const avgCase: Case = {
          id: "average",
          prospect: "",
          active: "Average",
          leadership_comments: "",
          teamwork_comments: "",
          analytical_comments: "",
          public_speaking_comments: "",
          role: "",
          thoughts: "",
          additional: "",
          leadership_score:
            (cases[0].leadership_score +
              cases[1].leadership_score +
              cases[2].leadership_score) /
            3,
          teamwork_score:
            (cases[0].teamwork_score +
              cases[1].teamwork_score +
              cases[2].teamwork_score) /
            3,
          analytical_score:
            (cases[0].analytical_score +
              cases[1].analytical_score +
              cases[2].analytical_score) /
            3,
          public_speaking_score:
            (cases[0].public_speaking_score +
              cases[1].public_speaking_score +
              cases[2].public_speaking_score) /
            3,
        };

        // Add this average as a fourth case
        cases = [...cases, avgCase];
      }
    }

    // Now proceed with normal averaging (all cases will have 4 evaluators)
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
      leadership_avg: totalScores.leadership_score / 4, // Always divide by 4 now
      teamwork_avg: totalScores.teamwork_score / 4,
      analytical_avg: totalScores.analytical_score / 4,
      public_speaking_avg: totalScores.public_speaking_score / 4,
    };

    return averages;
  }, []);

  // Calculate and set averages when data changes
  useMemo(() => {
    const newIvAverages = calculateIvAverages(interviews);
    setIvAverages(newIvAverages);
  }, [interviews, calculateIvAverages]);

  useMemo(() => {
    const newAverages = calculateAverages(cases);
    setAverages(newAverages);
  }, [cases, calculateAverages]);

  const handleScoreChange = (e: any) => {
    const value = e.target.value;
    const numValue = Number(value);
    if (value === "" || (numValue >= 1 && numValue <= 10)) {
      setScore(value);
    }
  };


  const handleScoreChangeResume = (e: any) => {
    const value = e.target.value;
    const numValue = Number(value);
    if (value === "" || (numValue >= 1 && numValue <= 10)) {
      setScoreResume(value);
    }
  };



  const handleSubmit = async () => {
    if (score === "") {
      customToast("Please enter a score before submitting.", "error");
      return;
    }
    updateAppScoreMutation.mutate(score);
  };

  const handleSubmitResume = async () => {
    if (scoreResume === "") {
      customToast("Please enter a score before submitting.", "error");
      return;
    }
    updateResumeScoreMutation.mutate(scoreResume);
  };




  const scoreComponents = useMemo(() => {
    const pledgeFactor = Number((ivAverages.pledgeable / 5).toFixed(2)) * 15;
    const professionalFactor =
      Number((ivAverages.open_minded / 5).toFixed(2)) * 10;
    const curious = Number((ivAverages.motivated / 5).toFixed(2)) * 7;
    const events = Number(ivAverages.events_attended - 2);
    const resumeScore =
      Number((parseInt(currentScoreResume) / 8).toFixed(2)) * 14;
    const coverLetterScore = application.cover_letter ? 1 : 0;
    const applicationScore =
      Number((parseInt(currentAppScore) / 8).toFixed(2)) * 25;
    const teamworkScore = Number((averages.teamwork_avg / 5).toFixed(2)) * 10;
    const leadershipScore =
      Number((averages.leadership_avg / 5).toFixed(2)) * 10;
    const analyticalScore =
      Number((averages.analytical_avg / 5).toFixed(2)) * 5;

    const totalScore =
      pledgeFactor +
      professionalFactor +
      curious +
      events +
      resumeScore +
      coverLetterScore +
      applicationScore +
      teamworkScore +
      leadershipScore +
      analyticalScore;

    return {
      totalScore,
      components: {
        pledgeFactor: { score: pledgeFactor, outOf: 15 },
        professionalFactor: { score: professionalFactor, outOf: 10 },
        curious: { score: curious, outOf: 7 },
        events: { score: events, outOf: 3 },
        resumeScore: { score: resumeScore, outOf: 14 },
        coverLetterScore: { score: coverLetterScore, outOf: 1 },
        applicationScore: { score: applicationScore, outOf: 25 },
        teamworkScore: { score: teamworkScore, outOf: 10 },
        leadershipScore: { score: leadershipScore, outOf: 10 },
        analyticalScore: { score: analyticalScore, outOf: 5 },
      },
    };
  }, [
    ivAverages,
    averages,
    currentAppScore,
    currentScoreResume,
    application.cover_letter,
  ]);

  // Update total score when it changes (using useMemo with side effect)
  useMemo(() => {
    if (scoreComponents.totalScore > 0) {
      const updateTotalScore = async () => {
        try {
          const { error } = await supabase
            .from("users")
            .update({ total_score: scoreComponents.totalScore })
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
  }, [scoreComponents.totalScore, userID, supabase, queryClient]);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 pt-8 pb-8">
      <div className="mx-4 w-full max-w-8xl space-y-4 overflow-auto rounded-xl bg-gray-900 p-6 shadow-2xl border border-gray-700" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        <div className="mb-6 space-y-4">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-white">
              {application.name}'s Packet
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
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-700 border-2 border-gray-600">
                    <span className="text-gray-400 text-xs">No Image</span>
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
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeSection === "application"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                App
              </button>
              {(
                <>
                  <button
                    onClick={() => setActiveSection("cases")}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeSection === "cases"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    Cases
                  </button>
                  <button
                    onClick={() => setActiveSection("interviews")}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeSection === "interviews"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    Interviews
                  </button>
                  <button
                    onClick={() => setActiveSection("comments")}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeSection === "comments"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    Comments
                  </button>
                  <button
                    onClick={() => setActiveSection("scoring")}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeSection === "scoring"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
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
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      application.resume
                        ? "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-700 cursor-not-allowed"
                    }`}
                    disabled={!application.resume}
                  >
                    Resume
                  </button>

                  <button
                    onClick={() => handleViewDocument(application.cover_letter)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      application.cover_letter
                        ? "bg-green-600 text-white hover:bg-green-700 shadow-lg"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-700 cursor-not-allowed"
                    }`}
                    disabled={!application.cover_letter}
                  >
                    Cover
                  </button>
                </>
              )}

              <button
                onClick={onClose}
                className="px-3 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-all duration-200 shadow-lg"
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-xl bg-gray-800 p-6 shadow-lg border border-gray-700">
                    <h3 className="mb-4 text-xl font-bold text-blue-400">
                      Personal Details
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-300">Pronouns:</span>
                        <span className="text-gray-200">{application.pronouns}</span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-300">Phone Number:</span>
                        <span className="text-gray-200">{application.phone_number}</span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-300">Social Media:</span>
                        <div className="text-gray-200">
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
                                      <span className="font-medium text-blue-200">
                                        {platform.charAt(0).toUpperCase() + platform.slice(1)}:
                                      </span>{" "}
                                      {isUrl ? (
                                        <a 
                                          href={url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-400 hover:text-blue-300 underline"
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

                  <div className="rounded-xl bg-gray-800 p-6 shadow-lg border border-gray-700">
                    <h3 className="mb-4 text-xl font-bold text-blue-400">
                      Academic Details
                    </h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-300">Year:</span>
                        <span className="text-gray-200">{application.year}</span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-300">Graduation Year:</span>
                        <span className="text-gray-200">{application.graduation_year}</span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-300">Graduation Quarter:</span>
                        <span className="text-gray-200">{application.graduation_qtr}</span>
                      </li>
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-300">Major:</span>
                        <span className="text-gray-200">{application.major}</span>
                      </li>
                      {application.minors && (
                        <li className="flex flex-col">
                          <span className="font-semibold text-blue-300">Minors:</span>
                          <span className="text-gray-200">{application.minors}</span>
                        </li>
                      )}
                      <li className="flex flex-col">
                        <span className="font-semibold text-blue-300">GPA:</span>
                        <span className="text-gray-200">{application.gpa}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl bg-gray-800 p-6 shadow-lg border border-gray-700">
                    <h3 className="mb-4 text-xl font-bold text-blue-400">
                      Scores
                    </h3>
                    {(
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex flex-col">
                          <span className="font-semibold text-blue-300">Case Study:</span>
                          <span className="text-gray-200 font-mono">
                            {Object.values(averages)
                              .reduce((acc, cur) => acc + cur, 0)
                              .toFixed(2)}
                          </span>
                        </li>
                        <li className="flex flex-col">
                          <span className="font-semibold text-blue-300">Interview:</span>
                          <span className="text-gray-200 font-mono">
                            {Object.values(ivAverages)
                              .reduce((acc, cur) => acc + cur, 0)
                              .toFixed(2)}
                          </span>
                        </li>
                        <li className="flex flex-col">
                          <span className="font-semibold text-blue-300">
                            Application Score:
                          </span>
                          <span className="text-gray-200 font-mono mb-2">
                            {currentAppScore !== "" ? currentAppScore : "not set"}
                          </span>
                          {isPIC && (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[1-7]|8"
                                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="1-8"
                                value={score}
                                onChange={handleScoreChange}
                              />
                              <button
                                onClick={handleSubmit}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors duration-200"
                              >
                                Submit
                              </button>
                            </div>
                          )}
                        </li>
                        <li className="flex flex-col">
                          <span className="font-semibold text-blue-300">Resume Score:</span>
                          <span className="text-gray-200 font-mono mb-2">
                            {currentScoreResume !== ""
                              ? currentScoreResume
                              : "not set"}
                          </span>
                          {isPIC && (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[1-7]|8"
                                className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="1-8"
                                value={scoreResume}
                                onChange={handleScoreChangeResume}
                              />
                              <button
                                onClick={handleSubmitResume}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors duration-200"
                              >
                                Submit
                              </button>
                            </div>
                          )}
                        </li>
                        <li className="flex flex-col pt-2 border-t border-gray-600">
                          <span className="font-bold text-green-400 text-lg">
                            Total Score: <span className="font-mono">{scoreComponents.totalScore.toFixed(2)}</span>
                          </span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-gray-800 p-6 shadow-lg border border-gray-700">
                  <h3 className="mb-6 text-xl font-bold text-blue-400">
                    Long Response
                  </h3>
                  <div className="grid grid-cols-1 gap-6 text-gray-300 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg bg-gray-900 p-4 border border-gray-600">
                      <div className="mb-3 text-center text-lg font-semibold text-blue-300">
                        Classes
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{application.classes}</div>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-4 border border-gray-600">
                      <div className="mb-3 text-center text-lg font-semibold text-blue-300">
                        Extracurriculars
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{application.extracirriculars}</div>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-4 border border-gray-600">
                      <div className="mb-3 text-center text-lg font-semibold text-blue-300">
                        Accomplishment
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{application.accomplishment}</div>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-4 border border-gray-600">
                      <div className="mb-3 text-center text-lg font-semibold text-blue-300">
                        Why AKPsi
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{application.why_akpsi}</div>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-4 border border-gray-600">
                      <div className="mb-3 text-center text-lg font-semibold text-blue-300">
                        Goals
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{application.goals}</div>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-4 border border-gray-600">
                      <div className="mb-3 text-center text-lg font-semibold text-blue-300">
                        Comfort Zone
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{application.comfort_zone}</div>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-4 border border-gray-600">
                      <div className="mb-3 text-center text-lg font-semibold text-blue-300">
                        Business Idea
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{application.business}</div>
                    </div>
                    <div className="rounded-lg bg-gray-900 p-4 border border-gray-600">
                      <div className="mb-3 text-center text-lg font-semibold text-blue-300">
                        Additional Details
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{application.additional}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cases Evaluation Section */}
            {activeSection === "cases" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-6">Case Study Notes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-lg bg-gray-800 p-4 text-center shadow-lg border border-gray-700">
                    <div className="text-blue-300 font-semibold mb-2">
                      Leadership
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {averages.leadership_avg.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-800 p-4 text-center shadow-lg border border-gray-700">
                    <div className="text-blue-300 font-semibold mb-2">
                      Teamwork
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {averages.teamwork_avg.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-800 p-4 text-center shadow-lg border border-gray-700">
                    <div className="text-blue-300 font-semibold mb-2">
                      Analytical
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
                      {averages.analytical_avg.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-800 p-4 text-center shadow-lg border border-gray-700">
                    <div className="text-blue-300 font-semibold mb-2">
                      Public Speaking
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">
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
                        className={`mb-3 grid grid-cols-1 gap-4 rounded-lg bg-gray-800 p-4 border border-gray-700 md:grid-cols-5`}
                      >
                        <div className="col-span-1 font-semibold text-blue-300">
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
                          <div key={index} className="text-gray-200 md:col-span-1 bg-gray-900 rounded p-2 text-sm whitespace-pre-line">
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
                        className={`mb-3 grid grid-cols-1 gap-4 rounded-lg bg-gray-800 p-4 border border-gray-700 md:grid-cols-5`}
                      >
                        <div className="col-span-1 font-semibold text-blue-300">
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
                          <div key={index} className="text-gray-200 md:col-span-1 bg-gray-900 rounded p-2 text-sm whitespace-pre-line">
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
                        className={`mb-3 grid grid-cols-1 gap-4 rounded-lg bg-gray-800 p-4 border border-gray-700 md:grid-cols-5`}
                      >
                        <div className="col-span-1 font-semibold text-blue-300">
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
                          <div key={index} className="text-gray-200 md:col-span-1 bg-gray-900 rounded p-2 text-sm whitespace-pre-line">
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
                <h3 className="text-2xl font-bold text-blue-400 mb-6">Interview Notes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  {Object.entries(ivAverages).map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-lg bg-gray-800 p-4 text-center shadow-lg border border-gray-700"
                    >
                      <div className="text-blue-300 font-semibold mb-2 capitalize text-sm">
                        {key.replace('_', ' ')}
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
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
                        className={`mb-3 grid grid-cols-1 gap-4 rounded-lg bg-gray-800 p-4 border border-gray-700 md:grid-cols-5`}
                      >
                        <div className="col-span-1 font-semibold text-blue-300">
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
                          <div key={index} className="md:col-span-1 bg-gray-900 rounded p-2 text-sm text-gray-200 whitespace-pre-line">
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
                          className={`mb-3 grid grid-cols-1 gap-4 rounded-lg bg-gray-800 p-4 border border-gray-700 md:grid-cols-5`}
                        >
                          <div className="col-span-1 font-semibold text-blue-300">
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
                            <div key={index} className="md:col-span-1 bg-gray-900 rounded p-2 text-sm text-gray-200 whitespace-pre-line">
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
                <h3 className="text-2xl font-bold text-blue-400 mb-6">
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
                <div className="bg-gray-800 rounded-md p-6 border border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-center">
                    <div className="bg-gray-900 p-4 rounded-lg text-center shadow-lg border border-gray-700 text-blue-300 font-bold mb-2 capitalize text-lg">
                      Active
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg text-center shadow-lg border border-gray-700 text-blue-300 font-bold mb-2 capitalize text-lg">
                      Interaction
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg text-center shadow-lg border border-gray-700 text-blue-300 font-bold mb-2 capitalize text-lg">
                      Invite?
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg text-center shadow-lg border border-gray-700 text-blue-300 font-bold mb-2 capitalize text-lg">
                      Comment
                    </div>
                  </div>
                  <div className="space-y-3">
                    {prospectComments.map((comment, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-gray-900 rounded-lg border border-gray-600">
                        <div className="font-semibold text-blue-300">
                          {comment.active_name}
                        </div>
                        <div className="text-gray-200">
                          {comment.interaction}
                        </div>
                        <div className="text-gray-200">
                          {comment.invite}
                        </div>
                        <div className="text-gray-200 text-sm whitespace-pre-line">
                          {comment.comment}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeSection === "scoring" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-6">Prospect Scoring</h3>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h4 className="text-xl font-semibold text-blue-300 mb-4">Score Components</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {Object.entries(scoreComponents.components).map(
                      ([key, { score, outOf }]) => (
                        <div
                          key={key}
                          className="bg-gray-900 rounded-lg p-4 border border-gray-600"
                        >
                          <div className="text-blue-300 font-semibold capitalize mb-2">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-white font-mono text-lg">
                            {score.toFixed(2)} / {outOf}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="text-center">
                    <div className="inline-block bg-green-700 rounded-lg p-4 border border-green-600">
                      <div className="text-green-300 font-semibold mb-2">Total Score</div>
                      <div className="text-white font-mono text-2xl font-bold">
                        {scoreComponents.totalScore.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "avatar" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-6 text-center">Profile Picture</h3>
                <div className="flex flex-col items-center justify-center gap-6">
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 w-full max-w-2xl mx-auto">
                    <div className="flex justify-center">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="max-h-80 max-w-full w-auto h-auto object-contain rounded-lg shadow-lg"
                          style={{ maxHeight: "50vh", maxWidth: "100%" }}
                        />
                      ) : (
                        <div className="flex w-80 h-80 max-w-full items-center justify-center bg-gray-700 rounded-lg border-2 border-gray-600">
                          <span className="text-lg text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isPIC && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 w-full max-w-2xl mx-auto">
                      <h4 className="text-lg font-semibold text-blue-300 mb-4">Upload New Avatar (PIC Only)</h4>
                      <AvatarUpload
                        userId={userID}
                        existingAvatarUrl={avatarUrl}
                        onAvatarUploaded={() => {
                          queryClient.invalidateQueries({ queryKey: ['userAvatar', userID] });
                          queryClient.invalidateQueries({ queryKey: ['applicantData', userID] });
                        }}
                      />
                      <p className="mt-4 text-sm text-gray-400">
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative h-5/6 w-full max-w-6xl overflow-auto rounded-xl bg-gray-900 border border-gray-700 shadow-2xl">
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
              className="absolute right-2 top-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors duration-200 shadow-lg"
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
