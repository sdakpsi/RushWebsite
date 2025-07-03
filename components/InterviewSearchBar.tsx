"use client";
import { getInterviewProspects } from "@/app/supabase/clientQueries";
import { ProspectInterview } from "@/lib/types";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface InterviewSearchBarProps {
  selectedProspect: ProspectInterview | null;
  setSelectedProspect: (prospect: ProspectInterview) => void;
  preloadedData?: ProspectInterview[];
  isPreloaded?: boolean;
}

export default function InterviewSearchBar({
  selectedProspect,
  setSelectedProspect,
  preloadedData,
  isPreloaded = false,
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
    enabled: !isPreloaded, // Don't fetch if data is preloaded
  });

  // Use preloaded data if available, otherwise use query data
  const finalProspectData = isPreloaded ? preloadedData : prospectData;
  const finalIsLoading = isPreloaded ? false : isLoading;

  const filteredData = searchInput === "" 
    ? (finalProspectData || [])
    : (finalProspectData || []).filter((prospect) =>
        prospect.full_name.toLowerCase().includes(searchInput.toLowerCase())
      );

  const handleSelectProspect = (prospect: ProspectInterview) => {
    setSelectedProspect(prospect);
    setSearchInput("");
  };

  if (finalIsLoading) {
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

  if (!finalProspectData || finalProspectData.length === 0) {
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
        className="block text-lg sm:text-xl font-medium text-gray-200 mb-3"
      >
        Search for and select a prospect:
      </label>
      <div className="relative">
        <input
          type="text"
          name="search"
          id="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Type prospect name..."
          className="block w-full rounded-lg border-2 border-gray-300 bg-gray-200 text-black shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-4 text-base transition-all duration-200"
          style={{ fontSize: '16px' }} // Prevents zoom on iOS
        />
        {searchInput && (
          <div className="suggestions mt-2 w-full rounded-lg bg-gray-800 shadow-xl border border-gray-600 overflow-hidden">
            {filteredData.slice(0, 5).map((prospect, index) => (
              <div
                key={index}
                className="suggestion cursor-pointer border-b border-gray-700 last:border-b-0 px-4 py-4 text-white hover:bg-gray-700 active:bg-gray-600 transition-all duration-150 touch-manipulation active:scale-[0.98]"
                onClick={() => handleSelectProspect(prospect)}
              >
                <div className="font-medium text-base">{prospect.full_name}</div>
                <div className="text-sm text-gray-400">{prospect.email}</div>
              </div>
            ))}
            {filteredData.length === 0 && searchInput && (
              <div className="px-4 py-4 text-gray-400 text-center">
                No prospects found matching "{searchInput}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
