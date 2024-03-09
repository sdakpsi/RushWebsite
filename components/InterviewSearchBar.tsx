"use client"
import { getInterviewProspects } from '@/app/supabase/getUsers';
import { ProspectInterview } from '@/lib/types';
import React, { useEffect, useState } from 'react'
import LoadingSpinner from './LoadingSpinner';

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
  const [searchInput, setSearchInput] = useState('');
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
      searchInput === ''
        ? prospectData
        : prospectData.filter((prospect) =>
            prospect.full_name.toLowerCase().includes(searchInput.toLowerCase())
          );
    setFilteredData(filtered);
  }, [searchInput, prospectData]);

  const handleSelectProspect = (prospect: ProspectInterview) => {
    setSelectedProspect(prospect);
    setSearchInput('');
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
      <div className="mt-1 relative">
        <input
          type="text"
          name="search"
          id="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 block w-full sm:text-lg bg-gray-200 border-gray-300 rounded-md text-black"
        />
        <div className="suggestions absolute z-10 w-full bg-gray-800 mt-2 rounded-md shadow-lg max-h-150 overflow-auto">
          {filteredData.map((prospect, index) => (
            <div
              key={index}
              className="suggestion px-4 py-2 border-b border-gray-700 text-white cursor-pointer hover:bg-gray-700"
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