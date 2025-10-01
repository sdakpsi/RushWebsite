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
      <label className="block text-xl font-medium text-gray-200">
        Your Comments:
      </label>
      <div className="relative mt-1">
        {uniqueProspects && uniqueProspects.length > 0 ? (
          <ul>
            {uniqueProspects.map((comment, index) => (
              <li
                key={index}
                className="mx-4 my-2 p-3 rounded-lg bg-gray-800 border border-gray-700 shadow-lg flex items-center justify-between"
              >
                <span className="text-white">{comment.prospect_name}</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200 border border-green-700">
                  ✓ Submitted
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mx-4 my-2 text-gray-500">No previous comments submitted</p>
        )}
      </div>
    </div>
  );
}
