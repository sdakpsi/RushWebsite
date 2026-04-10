"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LazyApplicationPopUp } from "@/components/LazyComponents";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useApplicationView } from "@/hooks/useApplicationView";
import { useCasesAndInterviews } from "@/hooks/getCasesAndInterviews";
import { useProspectAnalytics } from "@/hooks/useProspectAnalytics";
import { getVisibleCommentTrackingEvents } from "@/lib/analyticsCommentDates";
import {
  type ProspectAnalyticsCaseStudy,
  type ProspectAnalyticsCommentThread,
} from "@/app/supabase/analytics";
import { redirect } from "next/navigation";

const RUBRIC_STYLES: Record<string, string> = {
  "Values Community": "border-emerald-200 bg-emerald-50 text-emerald-900",
  "Growth Potential": "border-amber-200 bg-amber-50 text-amber-900",
  "Vulnerability / Introspection":
    "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900",
};

const PREVIEW_DROPPED_STORAGE_KEY = "prospect-analytics-preview-dropped";

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

function formatScore(score: number) {
  return Number.isInteger(score)
    ? score.toString()
    : score.toFixed(2).replace(/\.?0+$/, "");
}

function CommentCard({ thread }: { thread: ProspectAnalyticsCommentThread }) {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const latestComment = thread.latestComment;

  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {thread.activeName}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(latestComment.createdAt))}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            latestComment.interaction === "Good"
              ? "bg-emerald-100 text-emerald-800"
              : latestComment.interaction === "Neutral"
                ? "bg-amber-100 text-amber-800"
                : "bg-rose-100 text-rose-800"
          }`}
        >
          {latestComment.interaction}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {latestComment.rubricCategories.length ? (
          latestComment.rubricCategories.map((category) => (
            <span
              key={`${latestComment.id}-${category}`}
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
        {latestComment.comment || "No comment provided."}
      </p>
      {thread.history.length > 1 ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsHistoryVisible((currentValue) => !currentValue)}
            className="text-sm font-medium text-sky-700 hover:text-sky-900"
          >
            {isHistoryVisible
              ? "Hide full history"
              : `Show full history (${thread.history.length})`}
          </button>
          {isHistoryVisible ? (
            <div className="mt-3 space-y-3">
              {thread.history.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-border bg-muted/30 p-3"
                >
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(comment.createdAt))}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-foreground">
                    {comment.interaction}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-foreground">
                    {comment.comment || "No comment provided."}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function formatSocialInvite(value: string) {
  if (value === "yes") return "Yes";
  if (value === "maybe") return "Maybe";
  if (value === "no") return "No";
  return "Unknown";
}

function CaseStudyCard({
  caseStudy,
}: {
  caseStudy: ProspectAnalyticsCaseStudy;
}) {
  const inviteLabel = formatSocialInvite(caseStudy.socialInvite);

  return (
    <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {caseStudy.activeName}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(caseStudy.createdAt))}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            caseStudy.socialInvite === "yes"
              ? "bg-emerald-100 text-emerald-800"
              : caseStudy.socialInvite === "maybe"
                ? "bg-amber-100 text-amber-800"
                : caseStudy.socialInvite === "no"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-slate-100 text-slate-600"
          }`}
        >
          {inviteLabel}
        </span>
      </div>
      <div className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Case Study Invite
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {inviteLabel}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { label: "Leadership", value: caseStudy.leadershipScore },
          { label: "Teamwork", value: caseStudy.teamworkScore },
          { label: "Public Speaking", value: caseStudy.publicSpeakingScore },
          { label: "Analytical", value: caseStudy.analyticalScore },
        ].map((score) => (
          <div
            key={`${caseStudy.id}-${score.label}`}
            className="rounded-lg border border-border bg-muted/40 px-3 py-2"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {score.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {score.value ?? "N/A"}
            </p>
          </div>
        ))}
      </div>
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
  const {
    currentApplication,
    userID,
    handleViewApplication,
    handleClosePopup,
  } = useApplicationView();
  const {
    cases,
    interviews,
    isLoading: isCasesInterviewsLoading,
  } = useCasesAndInterviews(userID);
  const [expandedProspectId, setExpandedProspectId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    photoUrl: string;
    name: string;
  } | null>(null);
  const [showSubmittedOnly, setShowSubmittedOnly] = useState(true);
  const [previewDroppedProspects, setPreviewDroppedProspects] = useState<string[]>([]);

  const visibleEvents = getVisibleCommentTrackingEvents();

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(PREVIEW_DROPPED_STORAGE_KEY);
      if (!storedValue) {
        return;
      }

      const parsedValue = JSON.parse(storedValue);
      if (Array.isArray(parsedValue)) {
        setPreviewDroppedProspects(
          parsedValue.filter((value): value is string => typeof value === "string")
        );
      }
    } catch (error) {
      console.error("Error loading preview dropped prospects:", error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PREVIEW_DROPPED_STORAGE_KEY,
        JSON.stringify(previewDroppedProspects)
      );
    } catch (error) {
      console.error("Error saving preview dropped prospects:", error);
    }
  }, [previewDroppedProspects]);

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

  const filteredProspects = showSubmittedOnly
    ? prospects.filter((prospect) => prospect.submittedEssays)
    : prospects;
  const numberedProspects = filteredProspects.filter(
    (prospect) => !previewDroppedProspects.includes(prospect.prospectId)
  );
  const rowNumberByProspectId = new Map(
    numberedProspects.map((prospect, index) => [prospect.prospectId, index + 1])
  );

  const columnCount = 13 + visibleEvents.length;

  const togglePreviewDropped = (prospectId: string) => {
    setPreviewDroppedProspects((current) =>
      current.includes(prospectId)
        ? current.filter((id) => id !== prospectId)
        : [...current, prospectId]
    );
  };

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
                    Click any row to expand and review comment forms and case
                    study submissions.
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={showSubmittedOnly}
                      onChange={(event) => setShowSubmittedOnly(event.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    Show submitted applications only
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {numberedProspects.length} prospect{numberedProspects.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {filteredProspects.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr>
                        <th
                          className="border-b border-border pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          rowSpan={2}
                        >
                          #
                        </th>
                        <th
                          className="w-[72px] border-b border-border pb-2 text-center text-[11px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground"
                          rowSpan={2}
                        >
                          <span className="inline-block">
                            Preview
                            <br />
                            Dropped?
                          </span>
                        </th>
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
                        <th
                          className="border-b border-border pb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          colSpan={2}
                        >
                          Score
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
                          Submitted Essays
                        </th>
                        <th className="pb-3 pt-2 text-center font-medium text-muted-foreground">
                          Case Study Yes Invites
                        </th>
                        <th className="pb-3 pt-2 text-center font-medium text-muted-foreground">
                          <div className="flex items-center justify-center gap-2">
                            <span>Total Score</span>
                            <div className="group relative">
                              <button
                                type="button"
                                className="flex h-5 w-5 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="How total score is calculated"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <FontAwesomeIcon
                                  icon={faCircleInfo}
                                  className="h-4 w-4"
                                />
                              </button>
                              <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-60 rounded-lg border border-border bg-popover px-3 py-2 text-left text-xs font-normal normal-case tracking-normal text-popover-foreground opacity-0 shadow-lg transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
                                Good comment forms + (case study yes invites x 0.75)
                              </div>
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProspects.map((prospect) => {
                        const isExpanded = expandedProspectId === prospect.prospectId;

                        return (
                          <React.Fragment key={prospect.prospectId}>
                            <tr
                              className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                                isExpanded ? "bg-muted/30" : ""
                              } ${
                                previewDroppedProspects.includes(prospect.prospectId)
                                  ? "opacity-45 grayscale"
                                  : ""
                              }`}
                              onClick={() =>
                                setExpandedProspectId((current) =>
                                  current === prospect.prospectId
                                    ? null
                                    : prospect.prospectId
                                )
                              }
                            >
                              <td className="border-b border-border py-4 text-center font-semibold text-muted-foreground">
                                {rowNumberByProspectId.get(prospect.prospectId) ?? ""}
                              </td>
                              <td
                                className="w-[72px] border-b border-border px-2 py-4 text-center"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={previewDroppedProspects.includes(prospect.prospectId)}
                                  onChange={() => togglePreviewDropped(prospect.prospectId)}
                                  className="h-4 w-4 rounded border-border"
                                  aria-label={`Mark ${prospect.prospectName} as preview dropped`}
                                />
                              </td>
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
                                <StatusCheck value={prospect.submittedEssays} />
                              </td>
                              <td className="border-b border-border py-4 text-center font-medium text-sky-700">
                                {prospect.caseStudiesCount > 0
                                  ? `${prospect.caseStudyYesInvitesCount}/${prospect.caseStudiesCount}`
                                  : "N/A"}
                              </td>
                              <td className="border-b border-border py-4 text-center font-semibold text-foreground">
                                {formatScore(prospect.totalScore)}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td
                                  colSpan={columnCount}
                                  className={`border-b border-border bg-muted/20 px-4 py-5 ${
                                    previewDroppedProspects.includes(prospect.prospectId)
                                      ? "opacity-45 grayscale"
                                      : ""
                                  }`}
                                >
                                  <div className="space-y-6">
                                    <div>
                                      <div className="mb-3 flex items-center justify-between gap-3">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                          Comment Forms
                                        </h3>
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs text-muted-foreground">
                                            {prospect.comments.length} total
                                          </span>
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              if (prospect.applicationId) {
                                                handleViewApplication(
                                                  prospect.applicationId,
                                                  prospect.prospectId
                                                );
                                              }
                                            }}
                                            disabled={!prospect.applicationId}
                                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                                              prospect.applicationId
                                                ? "bg-sky-600 text-white hover:bg-sky-700"
                                                : "cursor-not-allowed border border-border bg-muted text-muted-foreground"
                                            }`}
                                          >
                                            Open Packet
                                          </button>
                                        </div>
                                      </div>
                                      {prospect.comments.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                          {prospect.comments.map((comment) => (
                                            <CommentCard key={comment.threadKey} thread={comment} />
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                                          No comment forms yet for this prospect.
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <div className="mb-3 flex items-center justify-between gap-3">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                          Case Study Forms
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                          {prospect.caseStudies.length} total
                                        </span>
                                      </div>
                                      {prospect.caseStudies.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                          {prospect.caseStudies.map((caseStudy) => (
                                            <CaseStudyCard
                                              key={caseStudy.id}
                                              caseStudy={caseStudy}
                                            />
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                                          No case study forms yet for this prospect.
                                        </div>
                                      )}
                                    </div>
                                  </div>
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
                  No prospects match the current filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {currentApplication && (
        <LazyApplicationPopUp
          application={currentApplication}
          cases={cases || []}
          interviews={interviews || []}
          userID={userID}
          isPIC={isPIC}
          isLoadingCasesInterviews={isCasesInterviewsLoading}
          onClose={handleClosePopup}
        />
      )}
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
