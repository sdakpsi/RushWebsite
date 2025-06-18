"use client";
import { getActiveSubmissions, getActiveSubmissionsWithStatus } from "@/app/supabase/getUsers";
import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";

export default function PastActiveSubmission({
  type,
  showingForm,
}: {
  type: "interviews" | "case_studies";
  showingForm: boolean;
}) {
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
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prospect.status === 'complete'
                      ? 'bg-green-900 text-green-200 border border-green-700'
                      : 'bg-yellow-900 text-yellow-200 border border-yellow-700'
                  }`}
                >
                  {prospect.status === 'complete' ? '✓ Complete' : '⧖ In Progress'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mx-4 my-2 text-gray-500">No previous submissions</p>
        )}
      </div>
    </div>
  );
}
