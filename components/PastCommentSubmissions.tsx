"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserComments } from "@/app/supabase/clientQueries";
import { groupCommentsIntoThreads } from "@/lib/commentThreads";
import {
  RUBRIC_CATEGORIES,
  type Comment,
  type CommentThread,
  type RubricCategory,
} from "@/lib/types";
import LoadingSpinner from "./LoadingSpinner";

interface PastCommentSubmissionsProps {
  preloadedData?: Comment[];
  isPreloaded?: boolean;
  onSubmitUpdate?: (thread: CommentThread, update: {
    comment: string;
    interaction: string;
    rubricCategories: RubricCategory[];
  }) => Promise<void>;
  isSubmittingThreadKey?: string | null;
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PastCommentSubmissions({
  preloadedData,
  isPreloaded = false,
  onSubmitUpdate,
  isSubmittingThreadKey,
}: PastCommentSubmissionsProps) {
  const {
    data: commentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userComments"],
    queryFn: getUserComments,
    enabled: !isPreloaded,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [expandedThreadKey, setExpandedThreadKey] = useState<string | null>(null);
  const [editingThreadKey, setEditingThreadKey] = useState<string | null>(null);
  const [draftComment, setDraftComment] = useState("");
  const [draftInteraction, setDraftInteraction] = useState("");
  const [draftRubricCategories, setDraftRubricCategories] = useState<RubricCategory[]>([]);

  const finalCommentsData = isPreloaded ? preloadedData : commentsData;
  const finalIsLoading = isPreloaded ? false : isLoading;

  const commentThreads = useMemo(
    () => groupCommentsIntoThreads(finalCommentsData ?? []),
    [finalCommentsData]
  );

  if (finalIsLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>There was an error fetching your comments, please try refreshing.</div>;
  }

  const toggleExpandedThread = (threadKey: string) => {
    setExpandedThreadKey((currentThreadKey) =>
      currentThreadKey === threadKey ? null : threadKey
    );
  };

  const startEditingThread = (thread: CommentThread) => {
    setExpandedThreadKey(thread.threadKey);
    setEditingThreadKey(thread.threadKey);
    setDraftComment("");
    setDraftInteraction(thread.latest_comment.interaction ?? "");
    setDraftRubricCategories(thread.latest_comment.rubric_categories ?? []);
  };

  const cancelEditingThread = () => {
    setEditingThreadKey(null);
    setDraftComment("");
    setDraftInteraction("");
    setDraftRubricCategories([]);
  };

  const toggleRubricCategory = (category: RubricCategory) => {
    setDraftRubricCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter((currentCategory) => currentCategory !== category)
        : [...currentCategories, category]
    );
  };

  const submitUpdate = async (thread: CommentThread) => {
    if (!onSubmitUpdate) {
      return;
    }

    await onSubmitUpdate(thread, {
      comment: draftComment,
      interaction: draftInteraction,
      rubricCategories: draftRubricCategories,
    });

    cancelEditingThread();
  };

  return (
    <div className="mb-6">
      <label className="block text-xl font-medium text-foreground">
        Your Comments:
      </label>
      <div className="relative mt-3">
        {commentThreads.length > 0 ? (
          <ul className="space-y-3">
            {commentThreads.map((thread) => {
              const isExpanded = expandedThreadKey === thread.threadKey;
              const isEditing = editingThreadKey === thread.threadKey;
              const latestComment = thread.latest_comment;
              const hasHistory = thread.history.length > 1;
              const historyEntries = [...thread.history]
                .reverse()
                .filter((commentEntry) => commentEntry.id !== latestComment.id);

              return (
                <li key={thread.threadKey} className="rounded-xl border border-border bg-card shadow-sm">
                  <div className="flex flex-col gap-3 rounded-xl px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-foreground">
                          {thread.prospect_name ?? "Unknown Prospect"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Latest update {formatTimestamp(latestComment.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingThread(thread)}
                          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          {isEditing ? "Editing..." : "Add Update"}
                        </button>
                        {hasHistory ? (
                          <button
                            type="button"
                            onClick={() => toggleExpandedThread(thread.threadKey)}
                            className="rounded-full border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
                          >
                            {isExpanded ? "Hide History" : "See History"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-800">
                        {latestComment.interaction ?? "Unknown"}
                      </span>
                      {latestComment.rubric_categories?.length ? (
                        latestComment.rubric_categories.map((category) => (
                          <span
                            key={`${thread.threadKey}-${category}`}
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
                    <p className="line-clamp-2 whitespace-pre-line text-sm font-medium text-slate-900">
                      {latestComment.comment ?? "No comment provided."}
                    </p>
                  </div>

                  {isExpanded ? (
                    <div className="space-y-4 border-t border-border px-4 py-4">
                      {historyEntries.length > 0 ? (
                        <div>
                        <p className="mb-3 text-sm font-semibold text-foreground">
                          Full History
                        </p>
                        <div className="space-y-3">
                          {historyEntries.map((commentEntry) => (
                            <div
                              key={commentEntry.id}
                              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                            >
                              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span>{formatTimestamp(commentEntry.created_at)}</span>
                                <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 font-semibold text-slate-800">
                                  {commentEntry.interaction ?? "Unknown"}
                                </span>
                              </div>
                              <div className="mb-3 flex flex-wrap gap-2">
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
                              <p className="whitespace-pre-line text-sm text-slate-700">
                                {commentEntry.comment ?? "No comment provided."}
                              </p>
                            </div>
                          ))}
                        </div>
                        </div>
                      ) : null}

                      {isEditing ? (
                        <div className="rounded-lg border border-border bg-background p-4">
                          <p className="mb-3 text-sm font-semibold text-foreground">
                            Add Update
                          </p>
                          <div className="space-y-4">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-foreground">
                                Overall interaction
                              </label>
                              <div className="grid grid-cols-3 gap-2 text-white">
                                {["Good", "Neutral", "Bad"].map((value) => (
                                  <button
                                    key={value}
                                    type="button"
                                    className={`rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                                      draftInteraction === value
                                        ? value === "Good"
                                          ? "border-2 border-green-400 bg-green-600"
                                          : value === "Neutral"
                                            ? "border-2 border-yellow-400 bg-yellow-600"
                                            : "border-2 border-red-400 bg-red-600"
                                        : "border-2 border-transparent bg-gray-500 hover:bg-gray-600"
                                    }`}
                                    onClick={() => setDraftInteraction(value)}
                                  >
                                    {value}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-foreground">
                                Rubric tags
                              </label>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                {RUBRIC_CATEGORIES.map((category) => {
                                  const isSelected = draftRubricCategories.includes(category);

                                  return (
                                    <button
                                      key={category}
                                      type="button"
                                      className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                                        isSelected
                                          ? "border-2 border-blue-400 bg-blue-600 text-white"
                                          : "border-2 border-transparent bg-gray-500 text-white hover:bg-gray-600"
                                      }`}
                                      onClick={() => toggleRubricCategory(category)}
                                    >
                                      {category}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-foreground">
                                Update note
                              </label>
                              <textarea
                                className="w-full rounded-lg border-2 border-gray-300 p-4 text-base text-gray-700 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                placeholder="Add any new context, follow-up details, or changes in your opinion."
                                value={draftComment}
                                onChange={(event) => setDraftComment(event.target.value)}
                                rows={4}
                                style={{ fontSize: "16px" }}
                              />
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => void submitUpdate(thread)}
                                disabled={isSubmittingThreadKey === thread.threadKey}
                                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isSubmittingThreadKey === thread.threadKey
                                  ? "Saving..."
                                  : "Save Update"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingThread}
                                className="rounded-lg bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mx-4 my-2 text-muted-foreground">
            No previous comments submitted
          </p>
        )}
      </div>
    </div>
  );
}
