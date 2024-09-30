"use client";
import { getInterviewProspects } from "@/app/supabase/getUsers";
import { ProspectInterview } from "@/lib/types";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import loadingImage from "./akpsilogo.png";

interface InterviewSearchBarProps {
  selectedProspect: ProspectInterview | null;
  setSelectedProspect: (prospect: ProspectInterview) => void;
}

export default function InterviewSearchBar({
  selectedProspect,
  setSelectedProspect,
}: InterviewSearchBarProps) {
  const [prospectData, setProspectData] = useState<ProspectInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filteredData, setFilteredData] = useState<ProspectInterview[]>([]);

  useEffect(() => {
    const getInterviewProspectData = async () => {
      try {
        const data = await getInterviewProspects();
        if (data) {
          setProspectData(data);
          setFilteredData(data); // Initialize filteredData with all prospects
        } else {
          setError(true); // If no data is returned, set error to true
        }
      } catch (error) {
        setError(true); // Catch any errors during fetch and set error to true
      } finally {
        setIsLoading(false); // Ensure loading state is disabled after fetch attempt
      }
    };
    getInterviewProspectData();
  }, []);

  useEffect(() => {
    const filtered =
      searchInput === ""
        ? prospectData
        : prospectData.filter((prospect) =>
            prospect.full_name.toLowerCase().includes(searchInput.toLowerCase())
          );
    setFilteredData(filtered);
  }, [searchInput, prospectData]);

  const handleSelectProspect = (prospect: ProspectInterview) => {
    setSelectedProspect(prospect);
    setSearchInput("");
  };

  if (isLoading) {
    return <div className="">Loading prospects...</div>;
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
