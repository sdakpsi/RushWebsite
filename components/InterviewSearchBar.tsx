"use client";
import { getInterviewProspects } from "@/app/supabase/clientQueries";
import { ProspectInterview } from "@/lib/types";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface InterviewSearchBarProps {
  selectedProspect: ProspectInterview | null;
  setSelectedProspect: (prospect: ProspectInterview) => void;
}

export default function InterviewSearchBar({
  selectedProspect,
  setSelectedProspect,
}: InterviewSearchBarProps) {
  const [searchInput, setSearchInput] = useState("");

  const { data: prospectData, isLoading, error } = useQuery({
    queryKey: ['interviewProspects'],
    queryFn: async () => {
      const prospects = await getInterviewProspects();
      // If no prospects returned, check if user has permissions
      if (!prospects || prospects.length === 0) {
        // This could be due to no prospects existing or permission issues
        // We'll just return empty array and let the component handle it
        return [];
      }
      return prospects;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const filteredData = searchInput === "" 
    ? (prospectData || [])
    : (prospectData || []).filter((prospect) =>
        prospect.full_name.toLowerCase().includes(searchInput.toLowerCase())
      );

  const handleSelectProspect = (prospect: ProspectInterview) => {
    setSelectedProspect(prospect);
    setSearchInput("");
  };

  if (isLoading) {
    return <div className="">Loading prospects...</div>;
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-md">
          There was an error fetching the prospects, please try refreshing.
        </div>
      </div>
    );
  }

  if (!prospectData || prospectData.length === 0) {
    return (
      <div className="mb-6">
        <div className="text-yellow-400 text-center p-4 bg-yellow-900/20 rounded-md">
          No prospects available for interviews at this time.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label
        htmlFor="search"
        className="block text-xl font-medium text-gray-200"
      >
        Search for and select a prospect:
      </label>
      <div className="relative mt-1">
        <input
          type="text"
          name="search"
          id="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="block w-full rounded-md border-gray-300 bg-gray-200 text-black shadow-sm focus:ring-indigo-500 sm:text-lg"
        />
        <div className="suggestions mt-2 w-full rounded-md bg-gray-800 shadow-lg">
          {filteredData.slice(0, 5).map((prospect, index) => (
            <div
              key={index}
              className="suggestion cursor-pointer border-b border-gray-700 px-4 py-2 text-white hover:bg-gray-700"
              onClick={() => handleSelectProspect(prospect)}
            >
              {prospect.full_name} - {prospect.email}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
