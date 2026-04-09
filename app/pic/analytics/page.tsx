"use client";

import React, { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAllAnalytics } from "@/hooks/useAllAnalytics";
import { getVisibleCommentTrackingEvents } from "@/lib/analyticsCommentDates";
import { type ActiveParticipationComment } from "@/app/supabase/analytics";
import { redirect } from "next/navigation";

const RUBRIC_STYLES: Record<string, string> = {
  "Values Community": "border-emerald-200 bg-emerald-50 text-emerald-900",
  "Growth Potential": "border-amber-200 bg-amber-50 text-amber-900",
  "Vulnerability / Introspection":
    "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900",
};

const StatCard = ({
  title,
  value,
  subtitle,
  color = "blue",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "red" | "yellow";
}) => {
  const colorClasses = {
    blue:
      "border-2 border-sky-300 bg-sky-50 [box-shadow:0_0_28px_-10px_rgba(14,165,233,0.55)]",
    green:
      "border-2 border-emerald-300 bg-emerald-50 [box-shadow:0_0_28px_-10px_rgba(16,185,129,0.5)]",
    red:
      "border-2 border-rose-300 bg-rose-50 [box-shadow:0_0_28px_-10px_rgba(244,63,94,0.48)]",
    yellow:
      "border-2 border-amber-300 bg-amber-50 [box-shadow:0_0_28px_-10px_rgba(245,158,11,0.5)]",
  };

  return (
    <div className={`rounded-lg p-6 ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium text-slate-800">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
};

function formatLastActivity(lastActivity: string | null) {
  if (!lastActivity) return "No activity";

  const date = new Date(lastActivity);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "< 1 hour ago";
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

function ActiveCommentCard({
  comment,
}: {
  comment: ActiveParticipationComment;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {comment.prospectName}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(comment.createdAt))}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            comment.interaction === "Good"
              ? "bg-emerald-100 text-emerald-800"
              : comment.interaction === "Neutral"
                ? "bg-amber-100 text-amber-800"
                : "bg-rose-100 text-rose-800"
          }`}
        >
          {comment.interaction}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {comment.rubricCategories.length ? (
          comment.rubricCategories.map((category) => (
            <span
              key={`${comment.id}-${category}`}
              className={`rounded-full border px-2 py-1 text-xs font-medium ${
                RUBRIC_STYLES[category] ||
                "border-border bg-muted text-muted-foreground"
              }`}
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
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
        {comment.comment || "No comment provided."}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { isPIC, isLoading: isPICLoading, isActive } = useCurrentUser();
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error,
  } = useAllAnalytics();
  const [expandedActiveId, setExpandedActiveId] = useState<string | null>(null);

  const visibleEvents = getVisibleCommentTrackingEvents();
  const participationColumnCount = 6 + visibleEvents.length;

  if (isPICLoading || (isPIC && analyticsLoading)) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="flex min-h-[500px] items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!isActive) {
    return redirect("/");
  }

  if (!isPIC) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="animate-in w-full max-w-7xl opacity-0">
          <div className="mt-8 flex items-center justify-center">
            <p className="text-sm sm:text-lg">You are not on PIC.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="animate-in w-full max-w-7xl opacity-0">
          <div className="container mx-auto px-4 pb-24 pt-6">
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-red-400">Error loading analytics data</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please try refreshing the page
                </p>
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
        <div className="container relative mx-auto px-4 pb-24 pt-6">
          <div className="flex flex-col space-y-6">
            <div className="text-center">
              <h1 className="mt-10 text-2xl font-semibold text-foreground md:text-5xl">
                Active Analytics
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                Track participation and see who&apos;s contributing across each rush
                event.
              </p>
            </div>

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

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Active Member Participation
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Event columns appear as each rush stage opens up. Click any
                    row to review the comments that active submitted.
                  </p>
                </div>
              </div>
              {participation.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 text-left font-medium text-muted-foreground">
                          Active Member
                        </th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">
                          Comments
                        </th>
                        {visibleEvents.map((trackedEvent) => (
                          <th
                            key={trackedEvent.eventKey}
                            className="pb-3 text-center font-medium text-muted-foreground"
                          >
                            {trackedEvent.label}
                          </th>
                        ))}
                        <th className="pb-3 text-center font-medium text-muted-foreground">
                          Case Studies
                        </th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">
                          Interviews
                        </th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">
                          Total
                        </th>
                        <th className="pb-3 text-left font-medium text-muted-foreground">
                          Last Activity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...participation]
                        .sort((a, b) => b.totalEvaluations - a.totalEvaluations)
                        .map((active, index) => {
                          const isExpanded = expandedActiveId === active.activeId;

                          return (
                            <React.Fragment key={active.activeId}>
                              <tr
                                className={`cursor-pointer border-b border-border/80 transition-colors hover:bg-muted/40 ${
                                  isExpanded ? "bg-muted/30" : ""
                                }`}
                                onClick={() =>
                                  setExpandedActiveId((current) =>
                                    current === active.activeId ? null : active.activeId
                                  )
                                }
                              >
                                <td className="py-3 text-foreground">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`rounded px-2 py-1 text-xs ${index < 3 ? "bg-emerald-100 font-medium text-emerald-900" : "bg-muted text-muted-foreground"}`}
                                    >
                                      #{index + 1}
                                    </span>
                                    {active.activeName}
                                  </div>
                                </td>
                                <td className="py-3 text-center text-muted-foreground">
                                  {active.commentsCount}
                                </td>
                                {visibleEvents.map((trackedEvent) => (
                                  <td
                                    key={`${active.activeId}-${trackedEvent.eventKey}`}
                                    className="py-3 text-center text-muted-foreground"
                                  >
                                    {active.commentCountsByEvent?.[trackedEvent.eventKey] || 0}
                                  </td>
                                ))}
                                <td className="py-3 text-center text-muted-foreground">
                                  {active.caseStudiesCount}
                                </td>
                                <td className="py-3 text-center text-muted-foreground">
                                  {active.interviewsCount}
                                </td>
                                <td className="py-3 text-center">
                                  <span
                                    className={`font-semibold ${active.totalEvaluations > 10 ? "text-emerald-700" : active.totalEvaluations > 5 ? "text-amber-700" : "text-rose-600"}`}
                                  >
                                    {active.totalEvaluations}
                                  </span>
                                </td>
                                <td className="py-3 text-xs text-muted-foreground">
                                  {formatLastActivity(active.lastActivity)}
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td
                                    colSpan={participationColumnCount}
                                    className="border-b border-border bg-muted/20 px-4 py-5"
                                  >
                                    {active.comments.length > 0 ? (
                                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {active.comments.map((comment) => (
                                          <ActiveCommentCard
                                            key={comment.id}
                                            comment={comment}
                                          />
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                                        No comment forms yet for this active.
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No participation data available
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Prospect Evaluation Coverage
              </h2>
              {coverage.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 text-left font-medium text-muted-foreground">
                          Prospect
                        </th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">
                          Comments
                        </th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">
                          Case Studies
                        </th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">
                          Interviews
                        </th>
                        <th className="pb-3 text-center font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...coverage]
                        .sort((a, b) => {
                          if (a.needsMoreEvaluations !== b.needsMoreEvaluations) {
                            return a.needsMoreEvaluations ? -1 : 1;
                          }
                          return a.totalEvaluations - b.totalEvaluations;
                        })
                        .map((prospect) => (
                          <tr
                            key={prospect.prospectId}
                            className="border-b border-border/80"
                          >
                            <td className="py-3 text-foreground">
                              {prospect.prospectName}
                            </td>
                            <td className="py-3 text-center text-muted-foreground">
                              {prospect.commentsCount}
                            </td>
                            <td className="py-3 text-center">
                              <span
                                className={`${prospect.caseStudiesCount >= 3 ? "font-medium text-emerald-700" : "font-medium text-rose-600"}`}
                              >
                                {prospect.caseStudiesCount}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span
                                className={`${prospect.interviewsCount >= 3 ? "font-medium text-emerald-700" : "font-medium text-rose-600"}`}
                              >
                                {prospect.interviewsCount}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span
                                className={`rounded px-2 py-1 text-xs ${prospect.needsMoreEvaluations ? "bg-rose-100 font-medium text-rose-800" : "bg-emerald-100 font-medium text-emerald-800"}`}
                              >
                                {prospect.needsMoreEvaluations ? "Needs More" : "Complete"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No prospect data available</p>
              )}
            </div>

            {timeline.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-foreground">
                  Recent Activity Timeline
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-7">
                  {timeline.map((day) => (
                    <div key={day.date} className="text-center">
                      <div className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "numeric",
                          day: "numeric",
                        })}
                      </div>
                      <div className="mt-1 text-lg font-bold text-foreground">
                        {day.totalEvaluations}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.commentsCount + day.caseStudiesCount + day.interviewsCount >
                          0 && (
                          <div>
                            {day.commentsCount > 0 && (
                              <span>Comments: {day.commentsCount}</span>
                            )}
                            {day.caseStudiesCount > 0 && (
                              <span> Case Studies: {day.caseStudiesCount}</span>
                            )}
                            {day.interviewsCount > 0 && (
                              <span> Interviews: {day.interviewsCount}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Total activity last 7 days:{" "}
                  {timeline.reduce((sum, day) => sum + day.totalEvaluations, 0)}{" "}
                  evaluations
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
