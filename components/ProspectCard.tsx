import React, { memo } from 'react';

interface ProspectCardProps {
  prospect: {id: string, full_name: string, email: string, photo_url?: string};
  isSelected: boolean;
  onClick: () => void;
  hasExistingComment?: boolean;
  goodCommentCount?: number;
}

function ProspectCard({
  prospect,
  isSelected,
  onClick,
  hasExistingComment = false,
  goodCommentCount = 0,
}: ProspectCardProps) {
  return (
    <div
      className={`
        rounded-lg bg-navy-800 border border-border p-2 shadow-md transition-shadow duration-200 hover:shadow-lg cursor-pointer
        ${isSelected 
          ? 'ring-2 ring-border' 
          : ''
        }
      `}
      onClick={onClick}
    >
      <div
        className={`
          flex items-center justify-between rounded-lg px-6 py-4 transition-colors duration-200
          ${isSelected 
            ? 'bg-navy-700 text-foreground hover:bg-navy-600 border-2 border-border' 
            : 'bg-navy-850 text-foreground hover:bg-navy-800 border border-border'
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
                className={`w-16 h-16 object-cover rounded-full border-2 ${isSelected ? 'border-border' : 'border-border'}`}
              />
            ) : (
              <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center border-2 border-border">
                <span className="text-sm text-foreground font-medium">
                  {prospect.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
            )}
          </div>
          
          {/* Name and Email */}
          <div className="flex flex-col space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold truncate">
                {prospect.full_name}
              </span>
              {goodCommentCount < 2 && (
                <span className="flex-shrink-0 rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-navy-950">
                  {goodCommentCount} good
                </span>
              )}
            </div>
            <span className={`text-base truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
              {prospect.email}
            </span>
          </div>
        </div>
        {hasExistingComment && (
          <span className="ml-3 px-3 py-2 rounded-full text-sm bg-success/15 text-success border border-success/30 flex-shrink-0">
            ✓ Comment
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(ProspectCard);