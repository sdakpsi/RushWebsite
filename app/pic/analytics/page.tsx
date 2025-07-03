"use client";

import React from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import { useActiveStatus } from "@/hooks/useActiveStatus";
import { useAllAnalytics } from "@/hooks/useAllAnalytics";

const StatCard = ({ title, value, subtitle, color = "blue" }: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "red" | "yellow";
}) => {
  const colorClasses = {
    blue: "bg-blue-900/30 border-blue-500",
    green: "bg-green-900/30 border-green-500",
    red: "bg-red-900/30 border-red-500",
    yellow: "bg-yellow-900/30 border-yellow-500"
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]} backdrop-blur-sm`}>
      <h3 className="text-sm font-medium text-gray-300">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
};

export default function AnalyticsPage() {
  const { isPIC, isLoading: isPICLoading } = useActiveStatus();
  const { data: analytics, isLoading: analyticsLoading, error } = useAllAnalytics();

  // Single loading state for everything
  if (isPICLoading || (isPIC && analyticsLoading)) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="flex items-center justify-center min-h-[500px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Not PIC
  if (!isPIC) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="animate-in w-full max-w-7xl opacity-0">
          <div className="mt-8 flex items-center justify-center">
            <ActiveLoginComponent />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="animate-in w-full max-w-7xl opacity-0">
          <div className="container mx-auto px-4 pt-6 pb-24">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-400 text-lg">Error loading analytics data</p>
                <p className="text-gray-400 text-sm mt-2">Please try refreshing the page</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary;
  const participation = analytics?.participation || [];
  const timeline = analytics?.timeline || [];
  const coverage = analytics?.coverage || [];

  return (
    <div className="flex w-full items-center justify-center">
      <div className="animate-in w-full max-w-7xl opacity-0">
        <div className="container mx-auto px-4 pt-6 pb-24 relative">
          <div className="flex flex-col space-y-6">
            <div className="text-center">
              <h1 className="mt-10 text-2xl font-semibold md:text-5xl text-white">
                Rush Analytics Dashboard
              </h1>
              <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
                Track particpation and see who's a bum and who's goated
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Active Members"
                value={summary?.totalActiveMembers || 0}
                subtitle={`${summary?.participatingActives || 0} participating (${Math.round(summary?.participationRate || 0)}%)`}
                color="blue"
              />
              <StatCard
                title="Total Evaluations"
                value={summary?.totalEvaluations || 0}
                subtitle={`${Math.round(summary?.averageEvaluationsPerActive || 0)} avg per active`}
                color="green"
              />
              <StatCard
                title="Comments"
                value={summary?.totalComments || 0}
                color="yellow"
              />
              <StatCard
                title="Prospects Needing Eval"
                value={summary?.prospectsNeedingEvaluations || 0}
                subtitle="< 3 case studies or interviews"
                color="red"
              />
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <StatCard
                title="Case Studies"
                value={summary?.totalCaseStudies || 0}
                color="green"
              />
              <StatCard
                title="Interviews"
                value={summary?.totalInterviews || 0}
                color="blue"
              />
            </div>

            {/* Active Member Participation */}
            <div className="rounded-lg bg-gray-800 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">Active Member Participation</h2>
              {participation.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="pb-3 text-left font-medium text-gray-300">Active Member</th>
                        <th className="pb-3 text-center font-medium text-gray-300">Comments</th>
                        <th className="pb-3 text-center font-medium text-gray-300">Case Studies</th>
                        <th className="pb-3 text-center font-medium text-gray-300">Interviews</th>
                        <th className="pb-3 text-center font-medium text-gray-300">Total</th>
                        <th className="pb-3 text-left font-medium text-gray-300">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participation
                        .sort((a, b) => b.totalEvaluations - a.totalEvaluations)
                        .map((active, index) => (
                        <tr key={active.activeId} className="border-b border-gray-700/50">
                          <td className="py-3 text-white">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${index < 3 ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-300'}`}>
                                #{index + 1}
                              </span>
                              {active.activeName}
                            </div>
                          </td>
                          <td className="py-3 text-center text-gray-300">{active.commentsCount}</td>
                          <td className="py-3 text-center text-gray-300">{active.caseStudiesCount}</td>
                          <td className="py-3 text-center text-gray-300">{active.interviewsCount}</td>
                          <td className="py-3 text-center">
                            <span className={`font-semibold ${active.totalEvaluations > 10 ? 'text-green-400' : active.totalEvaluations > 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {active.totalEvaluations}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400 text-xs">
                            {active.lastActivity 
                              ? (() => {
                                  const date = new Date(active.lastActivity);
                                  const now = new Date();
                                  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                                  
                                  if (diffInHours < 1) return "< 1 hour ago";
                                  if (diffInHours < 24) return `${diffInHours} hours ago`;
                                  const diffInDays = Math.floor(diffInHours / 24);
                                  return `${diffInDays} days ago`;
                                })()
                              : "No activity"
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">No participation data available</p>
              )}
            </div>

            {/* Prospect Coverage */}
            <div className="rounded-lg bg-gray-800 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">Prospect Evaluation Coverage</h2>
              {coverage.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="pb-3 text-left font-medium text-gray-300">Prospect</th>
                        <th className="pb-3 text-center font-medium text-gray-300">Comments</th>
                        <th className="pb-3 text-center font-medium text-gray-300">Case Studies</th>
                        <th className="pb-3 text-center font-medium text-gray-300">Interviews</th>
                        <th className="pb-3 text-center font-medium text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coverage
                        .sort((a, b) => {
                          if (a.needsMoreEvaluations !== b.needsMoreEvaluations) {
                            return a.needsMoreEvaluations ? -1 : 1;
                          }
                          return a.totalEvaluations - b.totalEvaluations;
                        })
                        .map((prospect) => (
                        <tr key={prospect.prospectId} className="border-b border-gray-700/50">
                          <td className="py-3 text-white">{prospect.prospectName}</td>
                          <td className="py-3 text-center text-gray-300">{prospect.commentsCount}</td>
                          <td className="py-3 text-center">
                            <span className={`${prospect.caseStudiesCount >= 3 ? 'text-green-400' : 'text-red-400'}`}>
                              {prospect.caseStudiesCount}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`${prospect.interviewsCount >= 3 ? 'text-green-400' : 'text-red-400'}`}>
                              {prospect.interviewsCount}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded ${prospect.needsMoreEvaluations ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                              {prospect.needsMoreEvaluations ? 'Needs More' : 'Complete'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">No prospect data available</p>
              )}
            </div>

            {/* Timeline Summary */}
            {timeline.length > 0 && (
              <div className="rounded-lg bg-gray-800 p-6">
                <h2 className="mb-4 text-xl font-bold text-white">Recent Activity Timeline</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-7">
                  {timeline.map((day) => (
                    <div key={day.date} className="text-center">
                      <div className="text-xs text-gray-400">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                      </div>
                      <div className="mt-1 text-lg font-bold text-white">{day.totalEvaluations}</div>
                      <div className="text-xs text-gray-500">
                        {(day.commentsCount + day.caseStudiesCount + day.interviewsCount) > 0 && (
                          <div>
                            {day.commentsCount > 0 && <span>Comments: {day.commentsCount}</span>}
                            {day.caseStudiesCount > 0 && <span> Case Studies: {day.caseStudiesCount}</span>}
                            {day.interviewsCount > 0 && <span> Interviews: {day.interviewsCount}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-gray-400">
                  Total activity last 7 days: {timeline.reduce((sum, day) => sum + day.totalEvaluations, 0)} evaluations
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}