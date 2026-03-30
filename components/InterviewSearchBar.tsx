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
    return (
      <div className="text-gray-600">Loading prospects...</div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-800">
          There was an error fetching the prospects, please try refreshing.
        </div>
      </div>
    );
  }

  if (!finalProspectData || finalProspectData.length === 0) {
    return (
      <div className="mb-6">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-center text-amber-900">
          No prospects available at this time.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label
        htmlFor="search"
        className="mb-3 block text-lg font-medium text-black sm:text-xl"
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
          className="block w-full rounded-lg border-2 border-border bg-background px-4 py-4 text-base text-black shadow-md transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/30"
          style={{ fontSize: '16px' }} // Prevents zoom on iOS
        />
        {searchInput && (
          <div className="suggestions mt-2 w-full overflow-hidden rounded-lg border border-border bg-card shadow-xl">
            {filteredData.slice(0, 5).map((prospect, index) => (
              <div
                key={index}
                className="suggestion cursor-pointer border-b border-border px-4 py-4 text-black transition-all duration-150 hover:bg-muted active:bg-muted/80 touch-manipulation active:scale-[0.98] last:border-b-0"
                onClick={() => handleSelectProspect(prospect)}
              >
                <div className="flex items-center gap-3">
                  {prospect.photo_url ? (
                    <img
                      src={prospect.photo_url}
                      alt={prospect.full_name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-semibold text-gray-600">
                        {prospect.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-base text-black">{prospect.full_name}</div>
                    <div className="text-sm text-gray-600">
                      {prospect.email}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && searchInput && (
              <div className="px-4 py-4 text-center text-gray-600">
                No prospects found matching "{searchInput}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
