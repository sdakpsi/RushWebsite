"use client";

import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProspectAnalytics } from "@/hooks/useProspectAnalytics";
import { getVisibleCommentTrackingEvents } from "@/lib/analyticsCommentDates";
import { type ProspectAnalyticsComment } from "@/app/supabase/analytics";
import { redirect } from "next/navigation";

const RUBRIC_STYLES: Record<string, string> = {
  "Values Community": "border-emerald-200 bg-emerald-50 text-emerald-900",
  "Growth Potential": "border-amber-200 bg-amber-50 text-amber-900",
  "Vulnerability / Introspection":
    "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900",
};

function Avatar({
  photoUrl,
  name,
  sizeClassName,
}: {
  photoUrl: string | null;
  name: string;
  sizeClassName: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClassName} rounded-full border-2 border-border object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClassName} flex items-center justify-center rounded-full border-2 border-border bg-muted text-sm font-semibold text-muted-foreground`}
    >
      {initials}
    </div>
  );
}

function StatusCheck({ value }: { value: boolean }) {
  return (
    <div className="flex justify-center">
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
          value
            ? "border-emerald-300 bg-emerald-100 text-emerald-800"
            : "border-slate-200 bg-slate-100 text-slate-400"
        }`}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          {value ? (
            <path
              d="M4.5 10.5L8 14l7.5-8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M6 6l8 8M14 6l-8 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </span>
    </div>
  );
}

function CommentCard({ comment }: { comment: ProspectAnalyticsComment }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {comment.activeName}
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

export default function ProspectAnalyticsPage() {
  const { isPIC, isLoading: isPICLoading, isActive } = useCurrentUser();
  const {
    data: prospects = [],
    isLoading: analyticsLoading,
    error,
  } = useProspectAnalytics();
  const [expandedProspectId, setExpandedProspectId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    photoUrl: string;
    name: string;
  } | null>(null);

  const visibleEvents = getVisibleCommentTrackingEvents();

  useEffect(() => {
    if (!selectedPhoto) {
      document.body.style.overflow = "";
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedPhoto]);

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
                <p className="text-lg text-red-400">
                  Error loading prospect analytics
                </p>
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

  const columnCount = 9 + visibleEvents.length;

  return (
    <div className="flex w-full items-center justify-center">
      <div className="animate-in w-full max-w-[96rem] opacity-0">
        <div className="container relative mx-auto px-4 pb-24 pt-6">
          <div className="flex flex-col space-y-6">
            <div className="text-center">
              <h1 className="mt-10 text-2xl font-semibold text-foreground md:text-5xl">
                Prospect Analytics
              </h1>
              <p className="mx-auto mt-4 max-w-4xl text-lg text-muted-foreground">
                Scan comment quality, rubric coverage, rush event timing, and
                application progress in one place.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Prospect Table
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Click any row to expand and review the full comment forms.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {prospects.length} prospect{prospects.length === 1 ? "" : "s"}
                </p>
              </div>

              {prospects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr>
                        <th
                          className="border-b border-border pb-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          rowSpan={2}
                        >
                          Prospect
                        </th>
                        <th
                          className="border-b border-border pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          colSpan={3}
                        >
                          Sentiment
                        </th>
                        <th
                          className="border-b border-border pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          colSpan={3}
                        >
                          Rubric Tags
                        </th>
                        <th
                          className="border-b border-border pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          colSpan={visibleEvents.length}
                        >
                          Events
                        </th>
                        <th
                          className="border-b border-border pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          colSpan={2}
                        >
                          Application
                        </th>
                      </tr>
                      <tr className="border-b border-border">
                        <th className="pb-3 pt-2 text-center font-medium text-muted-foreground">
                          Good
                        </th>
                        <th className="pb-3 pt-2 text-center font-medium text-muted-foreground">
                          Neutral
                        </th>
                        <th className="pb-3 pt-2 text-center font-medium text-muted-foreground">
                          Bad
                        </th>
                        <th className="pb-3 pt-2 text-center font-medium text-muted-foreground">
                          Community
                        </th>
                        <th className="pb-3 pt-2 text-center font-medium text-muted-foreground">
                          Growth
                        </th>
                        <th className="pb-3 pt-2 text-center font-medium text-muted-foreground">
                          Vulnerability
                        </th>
                        {visibleEvents.map((trackedEvent) => (
                          <th
                            key={trackedEvent.eventKey}
                            className="pb-3 pt-2 text-center font-medium text-muted-foreground"
                          >
                            {trackedEvent.label}
                          </th>
                        ))}
                        <th className="pb-3 pt-2 text-center font-medium text-muted-foreground">
                          Started App
                        </th>
                        <th className="pb-3 pt-2 text-center font-medium text-muted-foreground">
                          Started Essays
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prospects.map((prospect) => {
                        const isExpanded = expandedProspectId === prospect.prospectId;

                        return (
                          <React.Fragment key={prospect.prospectId}>
                            <tr
                              className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                                isExpanded ? "bg-muted/30" : ""
                              }`}
                              onClick={() =>
                                setExpandedProspectId((current) =>
                                  current === prospect.prospectId
                                    ? null
                                    : prospect.prospectId
                                )
                              }
                            >
                              <td className="border-b border-border py-4 pr-4">
                                <div className="flex items-center gap-4">
                                  {prospect.photoUrl ? (
                                    <button
                                      type="button"
                                      className="rounded-full transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedPhoto({
                                          photoUrl: prospect.photoUrl!,
                                          name: prospect.prospectName,
                                        });
                                      }}
                                      aria-label={`View larger photo for ${prospect.prospectName}`}
                                    >
                                      <Avatar
                                        photoUrl={prospect.photoUrl}
                                        name={prospect.prospectName}
                                        sizeClassName="h-14 w-14"
                                      />
                                    </button>
                                  ) : (
                                    <Avatar
                                      photoUrl={prospect.photoUrl}
                                      name={prospect.prospectName}
                                      sizeClassName="h-14 w-14"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <div className="text-lg font-semibold text-foreground">
                                      {prospect.prospectName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {prospect.comments.length} comment
                                      {prospect.comments.length === 1 ? "" : "s"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="border-b border-border py-4 text-center font-medium text-emerald-700">
                                {prospect.goodCommentsCount}
                              </td>
                              <td className="border-b border-border py-4 text-center font-medium text-amber-700">
                                {prospect.neutralCommentsCount}
                              </td>
                              <td className="border-b border-border py-4 text-center font-medium text-rose-700">
                                {prospect.badCommentsCount}
                              </td>
                              <td className="border-b border-border py-4 text-center text-muted-foreground">
                                {prospect.communityCommentsCount}
                              </td>
                              <td className="border-b border-border py-4 text-center text-muted-foreground">
                                {prospect.growthCommentsCount}
                              </td>
                              <td className="border-b border-border py-4 text-center text-muted-foreground">
                                {prospect.vulnerabilityCommentsCount}
                              </td>
                              {visibleEvents.map((trackedEvent) => (
                                <td
                                  key={`${prospect.prospectId}-${trackedEvent.eventKey}`}
                                  className="border-b border-border py-4 text-center text-muted-foreground"
                                >
                                  {prospect.commentCountsByEvent[trackedEvent.eventKey] || 0}
                                </td>
                              ))}
                              <td className="border-b border-border py-4">
                                <StatusCheck value={prospect.startedApp} />
                              </td>
                              <td className="border-b border-border py-4">
                                <StatusCheck value={prospect.startedEssays} />
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td
                                  colSpan={columnCount}
                                  className="border-b border-border bg-muted/20 px-4 py-5"
                                >
                                  {prospect.comments.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                      {prospect.comments.map((comment) => (
                                        <CommentCard key={comment.id} comment={comment} />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                                      No comment forms yet for this prospect.
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
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center text-muted-foreground">
                  No prospect analytics data available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-black/75"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close photo modal"
            >
              Close
            </button>
            <img
              src={selectedPhoto.photoUrl}
              alt={selectedPhoto.name}
              className="max-h-[80vh] w-full object-contain bg-black/5"
            />
            <div className="border-t border-border bg-background px-5 py-4">
              <p className="text-lg font-semibold text-foreground">
                {selectedPhoto.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
