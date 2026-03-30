"use client";
import { getActiveSubmissionsWithStatus } from "@/app/supabase/getUsers";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import customToast from "./CustomToast";

interface PastActiveSubmissionProps {
  type: "interviews" | "case_studies";
  showingForm: boolean;
  preloadedData?: { name: string; status: "complete" | "incomplete"; id: string; }[];
  isPreloaded?: boolean;
}

export default function PastActiveSubmission({
  type,
  showingForm,
  preloadedData,
  isPreloaded = false,
}: PastActiveSubmissionProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  
  const {
    data: prospectData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [`${type}SubmissionsWithStatus`, showingForm],
    queryFn: () => getActiveSubmissionsWithStatus(type),
    enabled: !isPreloaded, // Don't fetch if data is preloaded
  });

  // Use preloaded data if available, otherwise use query data
  const finalProspectData = isPreloaded ? preloadedData : prospectData;
  const finalIsLoading = isPreloaded ? false : isLoading;

  useEffect(() => {
    void refetch();
  }, [showingForm, refetch]);

  const handleDeleteClick = (prospectId: string) => {
    // Calculate modal position based on current scroll position
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const modalTop = scrollY + (viewportHeight / 2) - 80; // Move up by 80px
    
    setModalPosition({ top: modalTop, left: 50 }); // 50% for horizontal center
    setConfirmDeleteId(prospectId);
  };

  const handleConfirmDelete = async (prospectId: string, prospectName: string) => {
    if (type !== "case_studies") {
      customToast("Delete functionality is only available for case studies", "error");
      return;
    }

    setDeletingId(prospectId);
    setConfirmDeleteId(null);

    try {
      const response = await fetch('/api/case-studies/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prospect_id: prospectId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete case study');
      }

      customToast(`Deleted case study for ${prospectName}`, 'success');
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error deleting case study:', error);
      customToast(
        error instanceof Error ? error.message : 'Failed to delete case study',
        'error'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  if (finalIsLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div>
        There was an error fetching the prospects, please try refreshing.
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label className="block text-xl font-medium text-black">
        {type === "case_studies"
          ? "Your Case Studies:"
          : "Your Interviews:"}
      </label>
      <div className="relative mt-1">
        {finalProspectData && finalProspectData.length > 0 ? (
          <ul>
            {finalProspectData.map((prospect, index) => (
              <li
                key={index}
                className="mx-4 my-2 flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm"
              >
                <span className="font-semibold text-black">{prospect.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-medium ${
                      prospect.status === "complete"
                        ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                        : "border-amber-300 bg-amber-100 text-amber-900"
                    }`}
                  >
                    {prospect.status === "complete" ? "✓ Complete" : "⧖ In Progress"}
                  </span>
                  {type === "case_studies" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(prospect.id)}
                      disabled={deletingId === prospect.id}
                      className="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-800 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === prospect.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mx-4 my-2 text-gray-600">No previous submissions</p>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-foreground/40">
          <div 
            className="absolute max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
            style={{
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}%`,
              transform: 'translateX(-50%) translateY(-50%)',
              maxWidth: 'calc(100vw - 2rem)'
            }}
          >
            <h3 className="mb-4 text-lg font-semibold text-black">Confirm Delete</h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete the case study for{" "}
              <span className="font-semibold text-black">
                {finalProspectData?.find(p => p.id === confirmDeleteId)?.name}
              </span>
              ? This action cannot be undone. No like fr this CANNOT be undone, PIC cannot help you after this.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="rounded-lg border border-border bg-muted px-4 py-2 text-gray-800 transition-colors hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const prospect = finalProspectData?.find(p => p.id === confirmDeleteId);
                  if (prospect) {
                    handleConfirmDelete(confirmDeleteId, prospect.name);
                  }
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
