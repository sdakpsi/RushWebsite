"use client";
import React, { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import InterviewSearchBar from "@/components/InterviewSearchBar";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import { useActiveStatus } from "@/hooks/useActiveStatus";
import customToast from "@/components/CustomToast";
import { createClient } from "@/utils/supabase/client";
import Checkbox from "@/components/Checkbox";
import { v4 as uuidv4 } from "uuid";
import { getUsersForComments } from "@/app/supabase/getUsers";
import ProspectGrid from "@/components/ProspectGrid";
import { useEffect } from "react";

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
  const { isActive, isLoading } = useActiveStatus();
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
  const [prospects, setProspects] = useState<Array<{id: string, full_name: string, email: string}>>([]);
  const [prospectsLoading, setProspectsLoading] = useState(false);

  useEffect(() => {
    if (viewMode === 'grid' && prospects.length === 0) {
      const fetchProspects = async () => {
        setProspectsLoading(true);
        try {
          const data = await getUsersForComments();
          if (data) {
            setProspects(data);
          }
        } catch (error) {
          console.error("Error fetching prospects:", error);
        } finally {
          setProspectsLoading(false);
        }
      };
      fetchProspects();
    } else if (viewMode === 'search') {
      // Clear loading state when switching back to search
      setProspectsLoading(false);
    }
  }, [viewMode, prospects.length]);

  const supabase = createClient();

  const submitComment = async () => {
    if (!selectedProspect) {
      if (checked && newProspectName.length == 0) {
        customToast("Please enter a prospect before submitting.", "error");
        return;
      }
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

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (checked) {
        const { data, error } = await supabase.from("comments").insert([
          {
            prospect_id: "66666" + uuidv4().slice(5),
            prospect_name: newProspectName,
            active_id: user?.id,
            active_name: user?.user_metadata.name,
            comment: comment,
            interaction: interaction, // Storing interaction result
            invite: invite, // Storing invite response
          },
        ]);
        setNewProspectName("");

        if (error) {
          throw new Error(error.message);
        }

        customToast(
          `Submitted comment for ${newProspectName}: ${comment}`,
          "success"
        );
      } else {
        const { data, error } = await supabase.from("comments").insert([
          {
            prospect_id: selectedProspect?.id,
            prospect_name: selectedProspect?.full_name,
            active_id: user?.id,
            active_name: user?.user_metadata.name,
            comment: comment,
            interaction: interaction, // Storing interaction result
            invite: invite, // Storing invite response
          },
        ]);

        if (error) {
          throw new Error(error.message);
        }

        customToast(
          `Submitted comment for ${selectedProspect?.full_name}: ${comment}`,
          "success"
        );
      }
      setComment("");
      setInteraction("");
      setInvite("");
      setSelectedProspect(null);
      setChecked(false);
    } catch (error: any) {
      customToast(`Error submitting comment: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="animate-in w-full max-w-4xl opacity-0">
        {isActive ? (
          <div className="container mx-auto px-4 pt-6 pb-8">
            <div className="flex flex-col space-y-6">
              <h1 className="mt-10 text-center text-2xl font-semibold md:text-5xl">
                Prospect Comment Form
              </h1>

              <div className="flex flex-col items-center space-y-4">
                <div className="flex gap-4">
                  <button
                    className={`rounded px-6 py-3 font-semibold text-white transition-colors ${
                      viewMode === 'search'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={() => setViewMode('search')}
                  >
                     View
                  </button>
                  <button
                    className={`rounded px-6 py-3 font-semibold text-white transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={() => setViewMode('grid')}
                  >
                    Grid View
                  </button>
                </div>
                <p className="text-sm text-gray-400 text-center max-w-2xl">
                  Use <strong>Search View</strong> to search for prospects manually. <br></br>
                  Use <strong>Grid View</strong> to browse all prospects in a grid layout.
                </p>
              </div>
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
                />
              )}

              <p className="text-md text-left md:text-2xl">
                Selected Prospect: {selectedProspect?.full_name || "None"} -{" "}
                {selectedProspect?.email || "None"}
              </p>
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
                    className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
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
                    <div className="flex space-x-4 text-white">
                      <button
                        className={`rounded px-4 py-2 ${interaction === "Good" ? "bg-blue-700" : "bg-gray-900"}`}
                        onClick={() => setInteraction("Good")}
                      >
                        Good
                      </button>
                      <button
                        className={`rounded px-4 py-2 ${interaction === "Neutral" ? "bg-blue-700" : "bg-gray-900"}`}
                        onClick={() => setInteraction("Neutral")}
                      >
                        Neutral
                      </button>
                      <button
                        className={`rounded px-4 py-2 ${interaction === "Bad" ? "bg-blue-700" : "bg-gray-900"}`}
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
                    <div className="flex space-x-4">
                      <button
                        className={`rounded px-4 py-2 ${invite === "Yes" ? "bg-blue-700" : "bg-gray-900"}`}
                        onClick={() => setInvite("Yes")}
                      >
                        Yes
                      </button>
                      <button
                        className={`rounded px-4 py-2 ${invite === "No" ? "bg-blue-700" : "bg-gray-900"}`}
                        onClick={() => setInvite("No")}
                      >
                        No
                      </button>
                      <button
                        className={`rounded px-4 py-2 ${invite === "N/A" ? "bg-blue-700" : "bg-gray-900"}`}
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
                    className="rounded border p-2 text-gray-700"
                    placeholder="Be detailed, this will be used in delibs!"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    className="mb-4 mt-4 self-center rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={submitComment}
                  >
                    Submit Comment
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
