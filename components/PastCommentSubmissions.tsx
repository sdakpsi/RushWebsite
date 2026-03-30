"use client";
import { getUserComments } from "@/app/supabase/clientQueries";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";

interface PastCommentSubmissionsProps {
  preloadedData?: { prospect_id: string; prospect_name: string; }[];
  isPreloaded?: boolean;
}

export default function PastCommentSubmissions({
  preloadedData,
  isPreloaded = false,
}: PastCommentSubmissionsProps) {
  const {
    data: commentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userComments'],
    queryFn: getUserComments,
    enabled: !isPreloaded, // Don't fetch if data is preloaded
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Use preloaded data if available, otherwise use query data
  const finalCommentsData = isPreloaded ? preloadedData : commentsData;
  const finalIsLoading = isPreloaded ? false : isLoading;

  if (finalIsLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div>
        There was an error fetching your comments, please try refreshing.
      </div>
    );
  }

  // Get unique prospects (in case user has multiple comments for same prospect)
  const uniqueProspects = finalCommentsData
    ? Array.from(
        new Map(
          finalCommentsData.map(c => [c.prospect_id, c])
        ).values()
      )
    : [];

  return (
    <div className="mb-6">
      <label className="block text-xl font-medium text-black">
        Your Comments:
      </label>
      <div className="relative mt-1">
        {uniqueProspects && uniqueProspects.length > 0 ? (
          <ul>
            {uniqueProspects.map((comment, index) => (
              <li
                key={index}
                className="mx-4 my-2 flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm"
              >
                <span className="font-semibold text-black">
                  {comment.prospect_name}
                </span>
                <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-900">
                  ✓ Submitted
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mx-4 my-2 text-gray-600">
            No previous comments submitted
          </p>
        )}
      </div>
    </div>
  );
}
