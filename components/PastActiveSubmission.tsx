"use client";
import { getActiveSubmissions } from "@/app/supabase/getUsers";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";

export default function PastActiveSubmission({
  type,
}: {
  type: "interviews" | "case_studies";
}) {
  const {
    data: prospectData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`${type}Submissions`],
    queryFn: () => getActiveSubmissions(type),
  });

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
          ? "Your past Case Study Submissions"
          : "Your past Interview Submissions"}
      </label>
      <div className="relative mt-1">
        {prospectData && prospectData.length > 0 ? (
          <ul>
            {prospectData.map((prospect, index) => (
              <li
                key={index}
                className="mx-4 my-2 shadow-lg"
                // className="m-2 rounded-lg bg-btn-background p-3 shadow-lg"
              >
                {prospect}
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
