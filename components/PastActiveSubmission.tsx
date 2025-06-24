"use client";
import { getActiveSubmissionsWithStatus } from "@/app/supabase/getUsers";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";
import customToast from "./CustomToast";

export default function PastActiveSubmission({
  type,
  showingForm,
}: {
  type: "interviews" | "case_studies";
  showingForm: boolean;
}) {
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
  });

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

  if (isLoading) {
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
      <label className="block text-xl font-medium text-gray-200">
        {type === "case_studies"
          ? "Your Case Studies:"
          : "Your Interviews:"}
      </label>
      <div className="relative mt-1">
        {prospectData && prospectData.length > 0 ? (
          <ul>
            {prospectData.map((prospect, index) => (
              <li
                key={index}
                className="mx-4 my-2 p-3 rounded-lg bg-gray-800 border border-gray-700 shadow-lg flex items-center justify-between"
              >
                <span className="text-white">{prospect.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prospect.status === 'complete'
                        ? 'bg-green-900 text-green-200 border border-green-700'
                        : 'bg-yellow-900 text-yellow-200 border border-yellow-700'
                    }`}
                  >
                    {prospect.status === 'complete' ? '✓ Complete' : '⧖ In Progress'}
                  </span>
                  {type === "case_studies" && (
                    <button
                      onClick={() => handleDeleteClick(prospect.id)}
                      disabled={deletingId === prospect.id}
                      className="px-2 py-1 text-xs font-medium text-red-200 bg-red-900 border border-red-700 rounded hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === prospect.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mx-4 my-2 text-gray-500">No previous submissions</p>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div 
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md absolute"
            style={{
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}%`,
              transform: 'translateX(-50%) translateY(-50%)',
              maxWidth: 'calc(100vw - 2rem)'
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the case study for{' '}
              <span className="font-semibold">
                {prospectData?.find(p => p.id === confirmDeleteId)?.name}
              </span>
              ? This action cannot be undone. No like fr this CANNOT be undone, PIC cannot help you after this.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-300 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const prospect = prospectData?.find(p => p.id === confirmDeleteId);
                  if (prospect) {
                    handleConfirmDelete(confirmDeleteId, prospect.name);
                  }
                }}
                className="px-4 py-2 text-white bg-red-600 border border-red-500 rounded hover:bg-red-700 transition-colors"
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
