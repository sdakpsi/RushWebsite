"use client";

import React from "react";
import { useAllAnalytics } from "@/hooks/useAllAnalytics";
import LoadingSpinner from "./LoadingSpinner";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "red" | "yellow";
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color = "blue" }) => {
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

interface ParticipationTableProps {
  data: Array<{
    activeId: string;
    activeName: string;
    commentsCount: number;
    caseStudiesCount: number;
    interviewsCount: number;
    totalEvaluations: number;
    lastActivity: string | null;
  }>;
}

const ParticipationTable: React.FC<ParticipationTableProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.totalEvaluations - a.totalEvaluations);

  const formatLastActivity = (lastActivity: string | null) => {
    if (!lastActivity) return "No activity";
    const date = new Date(lastActivity);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "< 1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
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
          {sortedData.map((active, index) => (
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
              <td className="py-3 text-gray-400 text-xs">{formatLastActivity(active.lastActivity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ProspectCoverageTableProps {
  data: Array<{
    prospectId: string;
    prospectName: string;
    commentsCount: number;
    caseStudiesCount: number;
    interviewsCount: number;
    totalEvaluations: number;
    needsMoreEvaluations: boolean;
  }>;
}

const ProspectCoverageTable: React.FC<ProspectCoverageTableProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => {
    if (a.needsMoreEvaluations !== b.needsMoreEvaluations) {
      return a.needsMoreEvaluations ? -1 : 1;
    }
    return a.totalEvaluations - b.totalEvaluations;
  });

  return (
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
          {sortedData.map((prospect) => (
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
  );
};

const AnalyticsDashboard: React.FC = () => {
  const { data, isLoading, error } = useAllAnalytics();

  const summary = data?.summary;
  const participation = data?.participation;
  const timeline = data?.timeline;
  const coverage = data?.coverage;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-2xl">
          <p className="text-red-400 text-lg">Error loading analytics data</p>
          <p className="text-gray-400 text-sm mt-2">Please try refreshing the page</p>
          
          {/* Show specific errors in development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-red-400">Error Details</summary>
              <div className="mt-2 space-y-2 text-xs">
                <div className="bg-red-950/50 p-2 rounded">Error: {JSON.stringify(error, null, 2)}</div>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  const recentActivity = timeline?.slice(-7) || [];
  const totalRecentEvaluations = recentActivity.reduce((sum, day) => sum + day.totalEvaluations, 0);

  return (
    <div className="space-y-8">
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
          title="Recent Activity"
          value={totalRecentEvaluations}
          subtitle="Last 7 days"
          color="yellow"
        />
        <StatCard
          title="Prospects Needing Eval"
          value={summary?.prospectsNeedingEvaluations || 0}
          subtitle="< 3 case studies or interviews"
          color="red"
        />
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="rounded-lg bg-gray-900 p-4 text-xs text-gray-400">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              Summary: {JSON.stringify(summary, null, 2)}
              {'\n'}
              Participation: {participation?.length || 0} records
              {'\n'}
              Timeline: {timeline?.length || 0} records
              {'\n'}
              Coverage: {coverage?.length || 0} records
            </pre>
          </details>
        </div>
      )}

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          title="Comments"
          value={summary?.totalComments || 0}
          color="blue"
        />
        <StatCard
          title="Case Studies"
          value={summary?.totalCaseStudies || 0}
          color="green"
        />
        <StatCard
          title="Interviews"
          value={summary?.totalInterviews || 0}
          color="yellow"
        />
      </div>

      {/* Active Member Participation */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Active Member Participation</h2>
        {participation && participation.length > 0 ? (
          <ParticipationTable data={participation} />
        ) : (
          <p className="text-gray-400">No participation data available</p>
        )}
      </div>

      {/* Prospect Coverage */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Prospect Evaluation Coverage</h2>
        {coverage && coverage.length > 0 ? (
          <ProspectCoverageTable data={coverage} />
        ) : (
          <p className="text-gray-400">No prospect data available</p>
        )}
      </div>

      {/* Timeline Summary */}
      {recentActivity.length > 0 && (
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-bold text-white">Recent Activity (Last 7 Days)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-7">
            {recentActivity.map((day) => (
              <div key={day.date} className="text-center">
                <div className="text-xs text-gray-400">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="mt-1 text-lg font-bold text-white">{day.totalEvaluations}</div>
                <div className="text-xs text-gray-500">
                  {day.commentsCount + day.caseStudiesCount + day.interviewsCount > 0 && (
                    <div>C:{day.commentsCount} CS:{day.caseStudiesCount} I:{day.interviewsCount}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;