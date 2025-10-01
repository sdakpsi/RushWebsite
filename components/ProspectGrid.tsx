import React, { useState } from 'react';
import ProspectCard from './ProspectCard';
import { type ProspectInterview } from '@/lib/types';

interface ProspectGridProps {
  prospects: Array<{id: string, full_name: string, email: string, photo_url?: string}>;
  selectedProspect: ProspectInterview | null;
  onSelectProspect: (prospect: ProspectInterview) => void;
  isLoading?: boolean;
  existingCommentProspectIds?: Set<string>;
}

export default function ProspectGrid({
  prospects,
  selectedProspect,
  onSelectProspect,
  isLoading = false,
  existingCommentProspectIds
}: ProspectGridProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter prospects based on search term
  const filteredProspects = prospects.filter(prospect =>
    prospect.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prospect.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProspectClick = (prospect: {id: string, full_name: string, email: string, photo_url?: string}) => {
    // Convert to ProspectInterview format
    const prospectInterview: ProspectInterview = {
      id: prospect.id,
      full_name: prospect.full_name,
      email: prospect.email,
      photo_url: prospect.photo_url
    };
    onSelectProspect(prospectInterview);

    // Scroll to selected prospect box after a longer delay to let DOM fully update
    setTimeout(() => {
      const selectedProspectBox = document.querySelector('[data-selected-prospect]');
      if (selectedProspectBox) {
        const element = selectedProspectBox as HTMLElement;
        const navbarHeight = 80; // Approximate navbar height
        const yOffset = -navbarHeight - 20; // Extra 20px padding
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      }
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* Loading skeleton cards */}
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="rounded-lg bg-gray-800 p-2 shadow-lg animate-pulse">
              <div className="flex items-center justify-between rounded-lg px-6 py-4 bg-gray-700">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
                  <div className="flex flex-col space-y-2 flex-1">
                    <div className="h-6 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProspects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProspects.map(prospect => (
            <ProspectCard
              key={prospect.id}
              prospect={prospect}
              isSelected={selectedProspect?.id === prospect.id}
              onClick={() => handleProspectClick(prospect)}
              hasExistingComment={existingCommentProspectIds?.has(prospect.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          {searchTerm ? 'No prospects match your search.' : 'No prospects available.'}
        </div>
      )}

      {/* Summary */}
      <div className="text-center text-sm text-gray-400">
        Showing {filteredProspects.length} of {prospects.length} prospects
      </div>
    </div>
  );
}