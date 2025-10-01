"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from "@/components/LoadingSpinner";
import InterviewSearchBar from "@/components/InterviewSearchBar";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import customToast from "@/components/CustomToast";
import { createClient } from "@/utils/supabase/client";
import Checkbox from "@/components/Checkbox";
import { v4 as uuidv4 } from "uuid";
import { getUsersForComments, getUserComments } from "@/app/supabase/clientQueries";
import ProspectGrid from "@/components/ProspectGrid";
import PastCommentSubmissions from "@/components/PastCommentSubmissions";

// Mirror implementation of interview page

import { type ProspectInterview } from "@/lib/types";

function useSelectedProspect() {
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectInterview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return {
    selectedProspect,
    setSelectedProspect,
    isSubmitting,
    setIsSubmitting,
  };
}

export default function Page(this: any) {
  const { isActive, isLoading } = useCurrentUser();
  const {
    selectedProspect,
    setSelectedProspect,
    isSubmitting,
    setIsSubmitting,
  } = useSelectedProspect();

  const [viewMode, setViewMode] = useState<'search' | 'grid'>('search');
  const [comment, setComment] = useState("");
  const [interaction, setInteraction] = useState("");
  const [invite, setInvite] = useState("");
  const [newProspectName, setNewProspectName] = useState("");
  const [checked, setChecked] = useState(false);
  const queryClient = useQueryClient();

  // React Query for fetching prospects - only enabled when in grid mode
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

  // Create a Set of prospect IDs that have existing comments
  const existingCommentProspectIds = new Set(userComments.map(c => c.prospect_id));

  if (prospectsError) {
    console.error("Error fetching prospects:", prospectsError);
  }

  const supabase = createClient();

  // React Query mutation for submitting comments
  const submitCommentMutation = useMutation({
    mutationFn: async ({ prospectData, commentData }: {
      prospectData: { id?: string; name: string };
      commentData: { comment: string; interaction: string; invite: string };
    }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.from("comments").insert([{
        prospect_id: prospectData.id || "66666" + uuidv4().slice(5),
        prospect_name: prospectData.name,
        active_id: user?.id,
        active_name: user?.user_metadata.name,
        comment: commentData.comment,
        interaction: commentData.interaction,
        invite: commentData.invite,
      }]);
      
      if (error) throw error;
      return { data, prospectName: prospectData.name };
    },
    onSuccess: (result) => {
      customToast(`Submitted comment for ${result.prospectName}: ${comment}`, "success");
      setComment("");
      setInteraction("");
      setInvite("");
      setSelectedProspect(null);
      setChecked(false);
      setNewProspectName("");
      // Invalidate prospect comments queries
      queryClient.invalidateQueries({ queryKey: ['prospectComments'] });
      queryClient.invalidateQueries({ queryKey: ['userComments'] });
    },
    onError: (error: any) => {
      customToast(`Error submitting comment: ${error.message}`, "error");
    },
  });

  const submitComment = async () => {
    if (!selectedProspect && (!checked || newProspectName.length === 0)) {
      customToast("Please enter a prospect before submitting.", "error");
      return;
    }

    if (interaction === "" || invite === "" || comment === "") {
      customToast("All fields are required.", "error");
      return;
    }

    const wordCount = comment.trim().split(/\s+/).length;
    if (wordCount < 5) {
      customToast("Comment must be at least 5 words long.", "error");
      return;
    }

    const prospectData = checked 
      ? { name: newProspectName }
      : { id: selectedProspect?.id, name: selectedProspect?.full_name || "" };
      
    const commentData = { comment, interaction, invite };
    
    submitCommentMutation.mutate({ prospectData, commentData });
  };

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
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={() => setViewMode('search')}
                  >
                    Search
                  </button>
                  <button
                    className={`flex-1 rounded-lg px-4 py-3 sm:px-6 font-semibold text-white transition-all duration-200 touch-manipulation active:scale-95 ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                        : 'bg-gray-600 hover:bg-gray-700'
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
                    className="rounded-lg bg-gray-600 px-6 py-3 text-white font-medium hover:bg-gray-700 transition-all duration-200 touch-manipulation active:scale-95 shadow-md"
                    onClick={() => setSelectedProspect(null)}
                  >
                    Back to Grid
                  </button>
                </div>
              )}

              {/* Comment Input */}
              {(selectedProspect || checked) && (
                <div className="flex flex-col" data-comment-form>
                  {/* Interaction Question */}
                  <div className="flex flex-col">
                    {checked && !selectedProspect && (
                      <textarea
                        className="rounzded border p-1 text-gray-700"
                        placeholder="Enter prospect name"
                        value={newProspectName}
                        onChange={(e) => setNewProspectName(e.target.value)}
                        rows={1}
                      />
                    )}
                    <label className="mb-2 text-gray-200">
                      How was the interaction?
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-white">
                      <button
                        className={`rounded-lg px-3 py-3 sm:px-4 font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                          interaction === "Good" 
                            ? "bg-green-600 shadow-lg border-2 border-green-400" 
                            : "bg-gray-800 hover:bg-gray-700 border-2 border-transparent"
                        }`}
                        onClick={() => setInteraction("Good")}
                      >
                        Good
                      </button>
                      <button
                        className={`rounded-lg px-3 py-3 sm:px-4 font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                          interaction === "Neutral" 
                            ? "bg-yellow-600 shadow-lg border-2 border-yellow-400" 
                            : "bg-gray-800 hover:bg-gray-700 border-2 border-transparent"
                        }`}
                        onClick={() => setInteraction("Neutral")}
                      >
                        Neutral
                      </button>
                      <button
                        className={`rounded-lg px-3 py-3 sm:px-4 font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                          interaction === "Bad" 
                            ? "bg-red-600 shadow-lg border-2 border-red-400" 
                            : "bg-gray-800 hover:bg-gray-700 border-2 border-transparent"
                        }`}
                        onClick={() => setInteraction("Bad")}
                      >
                        Bad
                      </button>
                    </div>
                  </div>

                  {/* Invite to Social Night Question */}
                  <div className="flex flex-col text-white">
                    <label className="mb-2 mt-4 text-gray-200">
                      Invite to social night?
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <button
                        className={`rounded-lg px-3 py-3 sm:px-4 font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                          invite === "Yes" 
                            ? "bg-blue-600 shadow-lg border-2 border-blue-400" 
                            : "bg-gray-800 hover:bg-gray-700 border-2 border-transparent"
                        }`}
                        onClick={() => setInvite("Yes")}
                      >
                        Yes
                      </button>
                      <button
                        className={`rounded-lg px-3 py-3 sm:px-4 font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                          invite === "No" 
                            ? "bg-blue-600 shadow-lg border-2 border-blue-400" 
                            : "bg-gray-800 hover:bg-gray-700 border-2 border-transparent"
                        }`}
                        onClick={() => setInvite("No")}
                      >
                        No
                      </button>
                      <button
                        className={`rounded-lg px-3 py-3 sm:px-4 font-medium transition-all duration-200 touch-manipulation active:scale-95 ${
                          invite === "N/A" 
                            ? "bg-blue-600 shadow-lg border-2 border-blue-400" 
                            : "bg-gray-800 hover:bg-gray-700 border-2 border-transparent"
                        }`}
                        onClick={() => setInvite("N/A")}
                      >
                        N/A
                      </button>
                    </div>
                  </div>
                  <label className="mb-2 mt-4 text-gray-200">
                    Explain the interaction (minimum 5 words):
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
                    Word count: {comment.trim() ? comment.trim().split(/\s+/).length : 0} (minimum 5 words)
                  </div>
                  <button
                    className="mb-4 mt-6 self-center rounded-lg bg-blue-600 px-8 py-4 text-white font-semibold text-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 touch-manipulation active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={submitComment}
                    disabled={submitCommentMutation.isPending}
                  >
                    {submitCommentMutation.isPending ? "Submitting..." : "Submit Comment"}
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
