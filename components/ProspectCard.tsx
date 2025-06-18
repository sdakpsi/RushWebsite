import React from 'react';

interface ProspectCardProps {
  prospect: {id: string, full_name: string, email: string};
  isSelected: boolean;
  onClick: () => void;
  hasExistingComment?: boolean;
}

export default function ProspectCard({ 
  prospect, 
  isSelected, 
  onClick, 
  hasExistingComment = false 
}: ProspectCardProps) {
  return (
    <div
      className={`
        rounded-lg bg-gray-800 p-1 shadow-lg transition-shadow duration-200 hover:shadow-xl cursor-pointer
        ${isSelected 
          ? 'ring-2 ring-blue-500' 
          : ''
        }
      `}
      onClick={onClick}
    >
      <div
        className={`
          flex items-center justify-between rounded-lg px-4 py-2 text-gray-200 transition-colors duration-200
          ${isSelected 
            ? 'bg-blue-700 hover:bg-blue-600' 
            : 'bg-gray-700 hover:bg-gray-600'
          }
        `}
      >
        <div className="flex flex-col space-y-1 flex-1 min-w-0">
          <span className="text-lg font-bold truncate">
            {prospect.full_name}
          </span>
          <span className="text-sm text-gray-400 truncate">
            {prospect.email}
          </span>
        </div>
        {hasExistingComment && (
          <span className="ml-2 px-2 py-1 rounded-full text-xs bg-green-900 text-green-200 border border-green-700 flex-shrink-0">
            ✓
          </span>
        )}
      </div>
    </div>
  );
}