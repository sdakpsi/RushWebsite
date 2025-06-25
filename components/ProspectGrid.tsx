import React, { useState } from 'react';
import ProspectCard from './ProspectCard';
import { type ProspectInterview } from '@/lib/types';

interface ProspectGridProps {
  prospects: Array<{id: string, full_name: string, email: string, photo_url?: string}>;
  selectedProspect: ProspectInterview | null;
  onSelectProspect: (prospect: ProspectInterview) => void;
  isLoading?: boolean;
}

export default function ProspectGrid({ 
  prospects, 
  selectedProspect, 
  onSelectProspect,
  isLoading = false 
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
      email: prospect.email
    };
    onSelectProspect(prospectInterview);
    
    // Scroll to comment form after a short delay to let state update
    setTimeout(() => {
      const commentForm = document.querySelector('[data-comment-form]');
      if (commentForm) {
        commentForm.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
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