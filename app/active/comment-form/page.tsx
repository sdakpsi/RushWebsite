"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from "@/components/LoadingSpinner";
import InterviewSearchBar from "@/components/InterviewSearchBar";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import customToast from "@/components/CustomToast";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getUsersForComments, getUserComments, getGoodCommentCounts } from "@/app/supabase/clientQueries";
import { groupCommentsIntoThreads } from "@/lib/commentThreads";
import ProspectGrid from "@/components/ProspectGrid";
import PastCommentSubmissions from "@/components/PastCommentSubmissions";

// Mirror implementation of interview page

import {
  RUBRIC_CATEGORIES,
  type CommentThread,
  type ProspectInterview,
  type RubricCategory,
} from "@/lib/types";

const RUBRIC_CATEGORY_DETAILS: Record<RubricCategory, string> = {
  "Values Community":
    "Prioritizes others over trying to impress them, has demonstrated selflessness and a willingness to give back, and seems to be looking for a real family or community at UCSD.",
  "Growth Potential":
    "Shows a growth mindset, knows their weaknesses, is eager to work on them, and applies that effort to both professional and personal growth.",
  "Vulnerability / Introspection":
    "Shows strong self-awareness and emotional awareness, can be vulnerable while still holding up a conversation, and is inclusive of other prospects. This is more than just being socially skilled.",
};

function useSelectedProspect() {
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectInterview | null>(null);

  return {
    selectedProspect,
    setSelectedProspect,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export default function Page() {
  const { isActive, isLoading } = useCurrentUser();
  const {
    selectedProspect,
    setSelectedProspect,
  } = useSelectedProspect();

  const [viewMode, setViewMode] = useState<'search' | 'grid'>('search');
  const [comment, setComment] = useState("");
  const [interaction, setInteraction] = useState("");
  const [rubricCategories, setRubricCategories] = useState<RubricCategory[]>([]);
  const [isRubricInfoOpen, setIsRubricInfoOpen] = useState(false);
  const [newProspectName, setNewProspectName] = useState("");
  const [checked, setChecked] = useState(false);
  const queryClient = useQueryClient();
  const rubricInfoRef = useRef<HTMLDivElement | null>(null);

  const { data: prospects = [], isLoading: prospectsLoading, error: prospectsError } = useQuery({
    queryKey: ['prospectsForComments'],
    queryFn: getUsersForComments,
    enabled: viewMode === 'grid',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Fetch user's existing comments
  const { data: userComments = [] } = useQuery({
    queryKey: ['userComments'],
    queryFn: getUserComments,
    enabled: isActive,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch good comment counts per prospect (only needed in grid mode)
  const { data: goodCommentCounts = {} } = useQuery({
    queryKey: ['goodCommentCounts'],
    queryFn: getGoodCommentCounts,
    enabled: isActive && viewMode === 'grid',
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const userCommentThreads = useMemo(
    () => groupCommentsIntoThreads(userComments),
    [userComments]
  );

  const existingCommentProspectIds = new Set(
    userCommentThreads.map((thread) => thread.prospect_id)
  );

  const normalizeProspectName = (value: string | null | undefined) =>
    value?.trim().toLocaleLowerCase() ?? "";

  const existingThread: CommentThread | undefined = selectedProspect
    ? userCommentThreads.find((thread) => thread.prospect_id === selectedProspect.id)
    : checked && newProspectName.trim()
      ? userCommentThreads.find(
          (thread) =>
            normalizeProspectName(thread.prospect_name) ===
            normalizeProspectName(newProspectName)
        )
      : undefined;

  const resetDraftState = () => {
    setComment("");
    setInteraction("");
    setRubricCategories([]);
    setIsRubricInfoOpen(false);
  };

  if (prospectsError) {
    console.error("Error fetching prospects:", prospectsError);
  }

  const createCommentMutation = useMutation({
    mutationFn: async ({ prospectData, commentData }: {
      prospectData: { id?: string; name: string };
      commentData: {
        comment: string;
        interaction: string;
        rubricCategories: RubricCategory[];
      };
    }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const activeName =
        typeof user?.user_metadata.name === "string"
          ? user.user_metadata.name
          : null;

      const { data, error } = await supabase.from("comments").insert([{
        prospect_id: prospectData.id ?? `66666${uuidv4().slice(5)}`,
        prospect_name: prospectData.name,
        active_id: user?.id,
        active_name: activeName,
        comment: commentData.comment,
        interaction: commentData.interaction,
        rubric_categories: commentData.rubricCategories.length
          ? commentData.rubricCategories
          : null,
      }]);

      if (error) throw error;
      return { data, prospectName: prospectData.name };
    },
    onSuccess: (result) => {
      customToast(`Submitted comment for ${result.prospectName}.`, "success");
      resetDraftState();
      setSelectedProspect(null);
      setChecked(false);
      setNewProspectName("");
      // Invalidate prospect comments queries
      void queryClient.invalidateQueries({ queryKey: ['prospectComments'] });
      void queryClient.invalidateQueries({ queryKey: ['userComments'] });
      void queryClient.invalidateQueries({ queryKey: ['goodCommentCounts'] });
    },
    onError: (error: unknown) => {
      customToast(`Error submitting comment: ${getErrorMessage(error)}`, "error");
    },
  });

  const updateThreadMutation = useMutation({
    mutationFn: async ({
      thread,
      commentData,
    }: {
      thread: CommentThread;
      commentData: {
        comment: string;
        interaction: string;
        rubricCategories: RubricCategory[];
      };
    }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const activeName =
        typeof user?.user_metadata.name === "string"
          ? user.user_metadata.name
          : thread.active_name;

      const { error } = await supabase.from("comments").insert([{
        prospect_id: thread.prospect_id,
        prospect_name: thread.prospect_name,
        active_id: thread.active_id,
        active_name: activeName,
        comment: commentData.comment,
        interaction: commentData.interaction,
        rubric_categories: commentData.rubricCategories.length
          ? commentData.rubricCategories
          : null,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      customToast("Saved comment update.", "success");
      void queryClient.invalidateQueries({ queryKey: ['prospectComments'] });
      void queryClient.invalidateQueries({ queryKey: ['userComments'] });
      void queryClient.invalidateQueries({ queryKey: ['goodCommentCounts'] });
    },
    onError: (error: unknown) => {
      customToast(`Error saving update: ${getErrorMessage(error)}`, "error");
    },
  });

  const submitComment = () => {
    if (!selectedProspect && (!checked || newProspectName.length === 0)) {
      customToast("Please enter a prospect before submitting.", "error");
      return;
    }

    if (comment.trim() === "") {
      customToast("Interaction and comment are required.", "error");
      return;
    }

    if (interaction === "") {
      customToast("Interaction and comment are required.", "error");
      return;
    }

    const wordCount = comment.trim().split(/\s+/).length;
    if (wordCount < 15) {
      customToast("Comment must be at least 15 words long.", "error");
      return;
    }

    const prospectData = checked 
      ? { name: newProspectName }
      : { id: selectedProspect?.id, name: selectedProspect?.full_name ?? "" };
      
    const commentData = { comment, interaction, rubricCategories };
    
    createCommentMutation.mutate({ prospectData, commentData });
  };

  const submitThreadUpdate = async (
    thread: CommentThread,
    commentData: {
      comment: string;
      interaction: string;
      rubricCategories: RubricCategory[];
    }
  ) => {
    if (commentData.comment.trim() === "") {
      customToast("Please add an update before saving.", "error");
      throw new Error("Missing update text");
    }

    if (commentData.interaction === "") {
      customToast("Please choose an interaction before saving.", "error");
      throw new Error("Missing interaction");
    }

    await updateThreadMutation.mutateAsync({ thread, commentData });
  };

  const toggleRubricCategory = (category: RubricCategory) => {
    setRubricCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter((currentCategory) => currentCategory !== category)
        : [...currentCategories, category]
    );
  };

  useEffect(() => {
    if (!isRubricInfoOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        rubricInfoRef.current &&
        event.target instanceof Node &&
        !rubricInfoRef.current.contains(event.target)
      ) {
        setIsRubricInfoOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsRubricInfoOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isRubricInfoOpen]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="animate-in w-full max-w-7xl opacity-0">
        {isActive ? (
          <div className="container mx-auto px-4 pt-6 pb-8">
            <div className="flex flex-col space-y-6">
              <h1 className="mt-10 text-center text-2xl font-semibold md:text-5xl">
                Prospect Comment Form
              </h1>

              <div className="flex flex-col items-center space-y-4">
                <div className="flex gap-2 sm:gap-4 w-full max-w-md">
                  <button
                    className={`flex-1 rounded-lg px-4 py-3 sm:px-6 font-semibold text-white transition-all duration-200 touch-manipulation active:scale-95 ${
                      viewMode === 'search'
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                    onClick={() => setViewMode('search')}
                  >
                    Search
                  </button>
                  <button
                    className={`flex-1 rounded-lg px-4 py-3 sm:px-6 font-semibold text-white transition-all duration-200 touch-manipulation active:scale-95 ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </button>
                </div>
                <p className="text-sm text-gray-400 text-center max-w-2xl">
                  Use <strong>Search View</strong> to search for prospects manually. <br></br>
                  Use <strong>Grid View</strong> to browse all prospects in a grid layout and see their photos.
                </p>
              </div>

              <PastCommentSubmissions
                preloadedData={userComments}
                isPreloaded={true}
                onSubmitUpdate={submitThreadUpdate}
                isSubmittingThreadKey={updateThreadMutation.isPending ? updateThreadMutation.variables?.thread.threadKey ?? null : null}
              />

              {viewMode === 'search' && (
                <InterviewSearchBar
                  selectedProspect={selectedProspect}
                  setSelectedProspect={setSelectedProspect}
                />
              )}
              
              {viewMode === 'grid' && (
                <ProspectGrid
                  prospects={prospects || []}
                  selectedProspect={selectedProspect}
                  onSelectProspect={setSelectedProspect}
                  isLoading={prospectsLoading}
                  existingCommentProspectIds={existingCommentProspectIds}
                  goodCommentCounts={goodCommentCounts}
                />
              )}

              {selectedProspect ? (
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 w-full max-w-2xl mx-auto" data-selected-prospect>
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-semibold text-green-800 mb-3">
                      Selected Prospect
                    </div>
                    {selectedProspect.photo_url ? (
                      <img
                        src={selectedProspect.photo_url}
                        alt={selectedProspect.full_name}
                        className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-green-600"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mb-3 border-2 border-green-700">
                        <span className="text-white text-2xl font-semibold">
                          {selectedProspect.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="text-xl font-bold text-green-900">
                      {selectedProspect.full_name}
                    </div>
                    <div className="text-sm text-green-700">
                      {selectedProspect.email}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 w-full max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-800 mb-1">
                      No Prospect Selected
                    </div>
                    <div className="text-sm text-yellow-700">
                      Please select a prospect from {viewMode === 'search' ? 'search' : 'grid'} above
                    </div>
                  </div>
                </div>
              )}
              {!selectedProspect?.full_name && viewMode !== "grid" && (
                <div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                  />
                  <label> Manually enter prospect name?</label>
                </div>
              )}

              {/* Back to Grid button when prospect is selected in grid mode */}
              {viewMode === 'grid' && selectedProspect && (
                <div className="flex justify-center">
                  <button
                    className="rounded-lg bg-gray-500 px-6 py-3 text-white font-medium hover:bg-gray-600 transition-all duration-200 touch-manipulation active:scale-95 shadow-md"
                    onClick={() => {
                      setSelectedProspect(null);
                      resetDraftState();
                    }}
                  >
                    Back to Grid
                  </button>
                </div>
              )}

              {existingThread && (selectedProspect != null || checked) ? (
                <div className="mx-auto w-full max-w-2xl rounded-lg border border-slate-300 bg-slate-100 p-4 text-slate-800">
                  <p className="text-sm font-semibold text-slate-900">
                    You already have a comment thread for this prospect.
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Use the matching card in <strong>Your Comments</strong> above to review history and add an inline update.
                  </p>
                </div>
              ) : null}

              {/* Comment Input */}
              {(selectedProspect != null || checked) && !existingThread && (
                <div className="flex flex-col" data-comment-form>
                  {checked && !selectedProspect && (
                    <textarea
                      className="rounzded border p-1 text-gray-700"
                      placeholder="Enter prospect name"
                      value={newProspectName}
                      onChange={(e) => setNewProspectName(e.target.value)}
                      rows={1}
                    />
                  )}

                  <div className="mt-4 flex flex-col">
                    <label className="mb-2 text-gray-700">
                      How was the interaction?
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-white">
                      <button
                        className={`rounded-lg px-3 py-3 sm:px-4 font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                          interaction === "Good"
                            ? "bg-green-600 shadow-lg border-2 border-green-400"
                            : "bg-gray-500 hover:bg-gray-600 border-2 border-transparent"
                        }`}
                        onClick={() => setInteraction("Good")}
                      >
                        Good
                      </button>
                      <button
                        className={`rounded-lg px-3 py-3 sm:px-4 font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                          interaction === "Neutral"
                            ? "bg-yellow-600 shadow-lg border-2 border-yellow-400"
                            : "bg-gray-500 hover:bg-gray-600 border-2 border-transparent"
                        }`}
                        onClick={() => setInteraction("Neutral")}
                      >
                        Neutral
                      </button>
                      <button
                        className={`rounded-lg px-3 py-3 sm:px-4 font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                          interaction === "Bad"
                            ? "bg-red-600 shadow-lg border-2 border-red-400"
                            : "bg-gray-500 hover:bg-gray-600 border-2 border-transparent"
                        }`}
                        onClick={() => setInteraction("Bad")}
                      >
                        Bad
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col">
                    <div className="mb-2 flex items-center gap-2">
                      <label className="text-gray-700">
                        Relevant rubric categories (optional)
                      </label>
                      <div className="relative" ref={rubricInfoRef}>
                        <button
                          type="button"
                          className="flex h-5 w-5 items-center justify-center rounded-full border border-black bg-background text-black shadow-sm transition-transform duration-150 hover:scale-105 hover:bg-muted/40"
                          aria-label="Show rubric category descriptions"
                          aria-expanded={isRubricInfoOpen}
                          aria-haspopup="dialog"
                          onClick={() => setIsRubricInfoOpen((currentValue) => !currentValue)}
                        >
                          <FontAwesomeIcon icon={faInfo} className="h-2 w-2" />
                        </button>
                        {isRubricInfoOpen && (
                          <div
                            className="absolute right-0 top-7 z-20 w-[min(16rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] rounded-xl border border-border bg-card p-4 text-left text-sm text-foreground shadow-xl sm:left-0 sm:right-auto sm:top-8 sm:w-[22rem] sm:max-w-[22rem]"
                            role="dialog"
                          >
                            <p className="mb-3 font-semibold text-foreground">
                              If applicable, tag comment forms based on these traits PIC is specifically looking for:
                            </p>
                            <div className="space-y-3">
                              {RUBRIC_CATEGORIES.map((category) => (
                                <div key={category}>
                                  <p className="font-semibold text-foreground">
                                    {category}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {RUBRIC_CATEGORY_DETAILS[category]}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {RUBRIC_CATEGORIES.map((category) => {
                        const isSelected = rubricCategories.includes(category);

                        return (
                          <button
                            key={category}
                            type="button"
                            className={`rounded-lg px-4 py-3 text-left font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                              isSelected
                                ? "border-2 border-blue-400 bg-blue-600 text-white shadow-lg"
                                : "border-2 border-transparent bg-gray-500 text-white hover:bg-gray-600"
                            }`}
                            onClick={() => toggleRubricCategory(category)}
                            aria-pressed={isSelected}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="mb-2 mt-4 text-gray-700">
                    Explain the interaction (minimum 15 words):
                  </label>
                  <textarea
                    className="rounded-lg border-2 border-gray-300 p-4 text-gray-700 text-base leading-relaxed resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Be detailed, this will be used in delibs! Include what you talked about, their responses, and your overall impression."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    style={{ fontSize: '16px' }} // Prevents zoom on iOS
                  />
                  <div className="mt-2 text-xs text-gray-400">
                    Word count: {comment.trim() ? comment.trim().split(/\s+/).length : 0} (minimum 15 words)
                  </div>
                  <button
                    className="mb-4 mt-6 self-center rounded-lg bg-blue-600 px-8 py-4 text-white font-semibold text-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 touch-manipulation active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={submitComment}
                    disabled={createCommentMutation.isPending}
                  >
                    {createCommentMutation.isPending ? "Submitting..." : "Submit Comment"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center">
            <ActiveLoginComponent />
          </div>
        )}
      </div>
    </div>
  );
}
