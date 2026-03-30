import React, { memo } from 'react';

interface ProspectCardProps {
  prospect: {id: string, full_name: string, email: string, photo_url?: string};
  isSelected: boolean;
  onClick: () => void;
  hasExistingComment?: boolean;
}

function ProspectCard({
  prospect,
  isSelected,
  onClick,
  hasExistingComment = false
}: ProspectCardProps) {
  return (
    <div
      className={`
        rounded-lg bg-gray-800 border border-gray-700 p-2 shadow-md transition-shadow duration-200 hover:shadow-lg cursor-pointer
        ${isSelected
          ? 'ring-2 ring-gray-400'
          : ''
        }
      `}
      onClick={onClick}
    >
      <div
        className={`
          flex items-center justify-between rounded-lg px-6 py-4 transition-colors duration-200
          ${isSelected
            ? 'bg-gray-600 text-gray-100 hover:bg-gray-500 border-2 border-gray-400'
            : 'bg-gray-900 text-gray-100 hover:bg-gray-800 border border-gray-700'
          }
        `}
      >
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Photo */}
          <div className="flex-shrink-0">
            {prospect.photo_url ? (
              <img
                src={prospect.photo_url}
                alt={`${prospect.full_name}'s photo`}
                className={`w-16 h-16 object-cover rounded-full border-2 ${isSelected ? 'border-gray-400' : 'border-gray-600'}`}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600">
                <span className="text-sm text-gray-300 font-medium">
                  {prospect.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            )}
          </div>

          {/* Name and Email */}
          <div className="flex flex-col space-y-1 flex-1 min-w-0">
            <span className="text-xl font-bold truncate">
              {prospect.full_name}
            </span>
            <span className={`text-base truncate ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
              {prospect.email}
            </span>
          </div>
        </div>
        {hasExistingComment && (
          <span className="ml-3 px-3 py-2 rounded-full text-sm bg-green-900/40 text-green-300 border border-green-700 flex-shrink-0">
            ✓ Comment
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(ProspectCard);
