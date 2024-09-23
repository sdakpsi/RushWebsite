"use client";
import { getInterviewProspects } from "@/app/supabase/getUsers";
import { ProspectInterview } from "@/lib/types";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./LoadingSpinner";

interface InterviewSearchBarProps {
  selectedProspect: ProspectInterview | null;
  setSelectedProspect: (prospect: ProspectInterview) => void;
}

export default function InterviewSearchBar({
  selectedProspect,
  setSelectedProspect,
}: InterviewSearchBarProps) {
  const [searchInput, setSearchInput] = useState("");

  const {
    data: prospectData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["interviewProspects"],
    queryFn: () => getInterviewProspects(),
  });

  const filteredData = useMemo(() => {
    if (!prospectData) return [];
    return searchInput === ""
      ? prospectData
      : prospectData.filter((prospect) =>
          prospect.full_name.toLowerCase().includes(searchInput.toLowerCase())
        );
  }, [searchInput, prospectData]);

  const handleSelectProspect = (prospect: ProspectInterview) => {
    setSelectedProspect(prospect);
    setSearchInput("");
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
      <label
        htmlFor="search"
        className="block text-xl font-medium text-gray-200"
      >
        Search
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
        <div className="suggestions max-h-150 absolute z-10 mt-2 w-full overflow-auto rounded-md bg-gray-800 shadow-lg">
          {filteredData.map((prospect, index) => (
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
