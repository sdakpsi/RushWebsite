"use client";

import React, { useState, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQuery } from '@tanstack/react-query';

export default function CaseStudiesPage() {
  const { isPIC, isLoading: isPICLoading } = useCurrentUser();

  const { data: caseStudiesData = [], isLoading: isCaseStudiesLoading } = useQuery({
    queryKey: ['allCaseStudies'],
    queryFn: async () => {
      const response = await fetch('/api/case-studies/all');
      if (!response.ok) throw new Error('Failed to fetch case studies');
      return response.json();
    },
    enabled: isPIC,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [expandedProspects, setExpandedProspects] = useState<{[key: string]: boolean}>({});

  const toggleProspect = useCallback((cardId: string, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    setExpandedProspects((prev) => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  }, []);

  if (isPICLoading || isCaseStudiesLoading) {
    return <LoadingSpinner />;
  }

  if (!isPIC) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="animate-in w-full max-w-7xl opacity-0">
          <div className="mt-8 flex items-center justify-center">
            <p className="text-sm sm:text-lg">
              You are not on PIC.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group case studies by prospect_id
  const groupedCaseStudies = caseStudiesData.reduce((acc: any, caseStudy: any) => {
    if (!acc[caseStudy.prospect]) {
      acc[caseStudy.prospect] = [];
    }
    acc[caseStudy.prospect].push(caseStudy);
    return acc;
  }, {});

  // Calculate averages and categorize
  const sections = {
    highScore: [] as string[], // Average >= 4.0
    mediumScore: [] as string[], // Average >= 3.0 and < 4.0
    lowScore: [] as string[], // Average < 3.0
  };

  Object.entries(groupedCaseStudies).forEach(([prospectId, cases]: any) => {
    const totalScores = cases.reduce((sum: number, c: any) => {
      return sum + (c.leadership_score + c.teamwork_score + c.analytical_score + c.public_speaking_score) / 4;
    }, 0);
    const avgScore = totalScores / cases.length;

    if (avgScore >= 4.0) {
      sections.highScore.push(prospectId);
    } else if (avgScore >= 3.0) {
      sections.mediumScore.push(prospectId);
    } else {
      sections.lowScore.push(prospectId);
    }
  });

  const renderSection = (title: string, prospectIds: string[], bgColor: string) => {
    return (
      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          {title}
          <span className="ml-2 text-sm text-muted-foreground">
            ({prospectIds.length} prospect{prospectIds.length !== 1 ? 's' : ''})
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {prospectIds.map((prospectId, index) => {
            const cases = groupedCaseStudies[prospectId];
            const prospectName = cases[0].users?.full_name || "Unknown Prospect";
            const prospectPhotoUrl = cases[0].users?.photo_url;

            // Calculate averages
            const totalScores = cases.reduce((sum: any, c: any) => ({
              leadership: sum.leadership + c.leadership_score,
              teamwork: sum.teamwork + c.teamwork_score,
              analytical: sum.analytical + c.analytical_score,
              public_speaking: sum.public_speaking + c.public_speaking_score,
            }), { leadership: 0, teamwork: 0, analytical: 0, public_speaking: 0 });

            const avgScores = {
              leadership: (totalScores.leadership / cases.length).toFixed(2),
              teamwork: (totalScores.teamwork / cases.length).toFixed(2),
              analytical: (totalScores.analytical / cases.length).toFixed(2),
              public_speaking: (totalScores.public_speaking / cases.length).toFixed(2),
            };

            const overallAvg = ((parseFloat(avgScores.leadership) + parseFloat(avgScores.teamwork) +
                               parseFloat(avgScores.analytical) + parseFloat(avgScores.public_speaking)) / 4).toFixed(2);

            const uniqueKey = `${title}-${prospectId}-${index}`;
            const cardId = `card-${index}-${cases[0]?.id}`;
            const isExpanded = expandedProspects[cardId] || false;

            return (
              <div
                key={uniqueKey}
                className={`relative rounded-lg ${bgColor} p-1 shadow-lg transition-shadow duration-200 hover:shadow-xl`}
                style={{ height: 'fit-content' }}
              >
                <button
                  type="button"
                  className="w-full flex cursor-pointer items-center justify-between rounded-lg bg-gray-700 px-4 py-2 text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(event) => toggleProspect(cardId, event)}
                >
                  <div className="flex items-center gap-3 mr-2 min-w-0 flex-1">
                    {prospectPhotoUrl ? (
                      <img
                        src={prospectPhotoUrl}
                        alt={prospectName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-500 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center border-2 border-gray-500 flex-shrink-0">
                        <span className="text-gray-300 text-sm font-semibold">
                          {prospectName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-lg font-bold truncate w-full">{prospectName}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">Avg: {overallAvg}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">
                      {cases.length} {cases.length > 1 ? 'Cases' : 'Case'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div
                    className="mt-2 space-y-2 rounded-lg bg-gray-800 p-2 shadow-xl border border-gray-600"
                  >
                    {/* Average scores summary */}
                    <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">Average Scores</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Leadership:</span>
                          <span className="ml-2 text-white font-semibold">{avgScores.leadership}/5</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Teamwork:</span>
                          <span className="ml-2 text-white font-semibold">{avgScores.teamwork}/5</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Analytical:</span>
                          <span className="ml-2 text-white font-semibold">{avgScores.analytical}/5</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Public Speaking:</span>
                          <span className="ml-2 text-white font-semibold">{avgScores.public_speaking}/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Individual case studies */}
                    {cases.map((caseStudy: any) => (
                      <div
                        key={caseStudy.id}
                        className="rounded-lg border border-gray-600 bg-gray-700 p-4"
                      >
                        <div className="flex flex-col space-y-2 text-sm">
                          <p className="font-semibold text-blue-300">
                            {caseStudy.active_name || "Unknown Active"}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400">Leadership:</span>
                              <span className="ml-1 text-white">{caseStudy.leadership_score}/5</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Teamwork:</span>
                              <span className="ml-1 text-white">{caseStudy.teamwork_score}/5</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Analytical:</span>
                              <span className="ml-1 text-white">{caseStudy.analytical_score}/5</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Public Speaking:</span>
                              <span className="ml-1 text-white">{caseStudy.public_speaking_score}/5</span>
                            </div>
                          </div>

                          {caseStudy.role && (
                            <p className="text-xs">
                              <span className="text-gray-400">Role:</span>{" "}
                              <span className="text-gray-200">{caseStudy.role}</span>
                            </p>
                          )}

                          {caseStudy.thoughts && (
                            <p className="text-xs italic text-gray-300 mt-2">
                              "{caseStudy.thoughts}"
                            </p>
                          )}

                          <div className="text-xs text-gray-400 mt-2">
                            {new Intl.DateTimeFormat("en-US", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(new Date(caseStudy.created_at))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full items-center justify-center">
      <div className="animate-in w-full max-w-6xl opacity-0">
        <div className="container mx-auto px-4 pt-6 pb-32 relative">
          <div className="flex flex-col space-y-6">
            <h1 className="mt-10 text-center text-2xl font-semibold text-foreground md:text-5xl">
              Case Study Evaluations
            </h1>

            <div className="space-y-10">
              {renderSection(
                "High Performers (Avg ≥ 4.0)",
                sections.highScore,
                "bg-green-900/20"
              )}
              {renderSection(
                "Medium Performers (Avg 3.0-3.9)",
                sections.mediumScore,
                "bg-yellow-900/20"
              )}
              {renderSection(
                "Needs Attention (Avg < 3.0)",
                sections.lowScore,
                "bg-red-900/20"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
