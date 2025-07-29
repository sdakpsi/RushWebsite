"use client";

import React, { useState, useRef, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import { useActiveStatus } from "@/hooks/useActiveStatus";
import { useProspectComments } from "@/hooks/useProspectComments";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const { isPIC, isLoading: isPICLoading, isActive } = useActiveStatus();
  const { commentsData, isLoading: isUsersLoading, error: commentsError } = useProspectComments();

  const [expandedProspects, setExpandedProspects] = useState<{[key: string]: boolean}>({});
  
  // Use useCallback to prevent the function from being recreated on every render
  const toggleProspect = useCallback((prospectId: string, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    // console.log('Toggling prospect:', prospectId); // Debug log
    
    setExpandedProspects((prev) => {
      const isCurrentlyExpanded = Boolean(prev[prospectId]);
      
      // Toggle only the clicked prospect (allows multiple open)
      const newState = {
        ...prev,
        [prospectId]: !isCurrentlyExpanded
      };
      
      // Alternative: Close all others and open only the clicked one (uncomment if preferred)
      // const newState = {
      //   [prospectId]: !isCurrentlyExpanded
      // };
      
      return newState;
    });
  }, []);

  if (isPICLoading || isUsersLoading) {
    return <LoadingSpinner />;
  }

  // Check for errors
  if (commentsError) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="animate-in w-full max-w-7xl opacity-0">
          <div className="mt-8 flex items-center justify-center">
            <p className="text-sm sm:text-lg text-red-400">
              Error loading comments: {commentsError instanceof Error ? commentsError.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not PIC - only check PIC status, not active status
  if (!isPIC) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="animate-in w-full max-w-7xl opacity-0">
          <div className="mt-8 flex items-center justify-center">
            <p className="text-sm sm:text-lg">
              You are not on PIC.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group comments by prospect_id
  const groupedComments = commentsData.reduce((acc: any, comment: any) => {
    if (!acc[comment.prospect_id]) {
      acc[comment.prospect_id] = [];
    }
    acc[comment.prospect_id].push(comment);
    return acc;
  }, {});
  
  // Debug: Log all prospect IDs to check for duplicates (can be removed in production)
  // console.log('All prospect IDs:', Object.keys(groupedComments));

  // Separate into categories
  const sections = {
    twoPlusYes: [] as string[],
    oneYes: [] as string[],
    zeroYes: [] as string[],
    notLinked: [] as string[],
  };

  Object.entries(groupedComments).forEach(([prospectId, comments]: any) => {
    if (prospectId.slice(0, 5) === "66666") {
      sections.notLinked.push(prospectId);
      return;
    }

    const yesCount = comments.filter((c: any) => c.invite === "Yes").length;
    if (yesCount >= 2) {
      sections.twoPlusYes.push(prospectId);
    } else if (yesCount === 1) {
      sections.oneYes.push(prospectId);
    } else {
      sections.zeroYes.push(prospectId);
    }
  });

  const renderSection = (title: string, prospectIds: string[]) => {
    // console.log(`Rendering section "${title}" with prospects:`, prospectIds);
    return (
      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-gray-100">{title}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prospectIds.map((prospectId, index) => {
          const prospectComments = groupedComments[prospectId];
          const prospectName =
            prospectComments[prospectComments.length - 1].prospect_name ||
            "Unknown Prospect";
          const yesInviteCount = prospectComments.filter(
            (c: any) => c.invite === "Yes"
          ).length;
          const noInviteCount = prospectComments.filter(
            (c: any) => c.invite === "No"
          ).length;
          const numberOfComments = prospectComments.length;
          
          // Create a unique key combining section, prospectId and index to avoid conflicts
          const uniqueKey = `${title.replace(/\s+/g, '-')}-${prospectId}-${index}`;
          const uniqueProspectId = `${title.replace(/\s+/g, '-')}-${prospectId}`;
          const isExpanded = expandedProspects[uniqueProspectId] || false;
          
          // console.log(`Rendering prospect ${prospectName} with key: ${uniqueKey}, uniqueId: ${uniqueProspectId}, expanded: ${expandedProspects[uniqueProspectId]}`);

          return (
            <div
              key={uniqueKey}
              className="relative rounded-lg bg-gray-800 p-1 shadow-lg transition-shadow duration-200 hover:shadow-xl isolate overflow-hidden"
              style={{ contain: 'layout style' }}
            >
              <button
                type="button"
                className="w-full flex cursor-pointer items-center justify-between rounded-lg bg-gray-700 px-4 py-2 text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(event) => toggleProspect(uniqueProspectId, event)}
              >
                <span className="mr-2 text-lg font-bold">
                  {prospectId.slice(0, 5) === "66666" && (
                    <span className="text-red-600">*</span>
                  )}{" "}
                  {prospectName}
                </span>
                <span className="text-sm">
                  <span
                    className={`font-semibold ${
                      yesInviteCount >= 2 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {yesInviteCount} yes
                  </span>{" "}
                  |{" "}
                  <span
                    className={`font-semibold ${
                      noInviteCount <= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {noInviteCount} no
                  </span>{" "}
                  | {numberOfComments}{" "}
                  {numberOfComments > 1 ? "comments" : "comment"}
                </span>
              </button>

              {isExpanded && (
                <div 
                  className="mt-2 space-y-2 rounded-lg bg-gray-800 p-2 shadow-xl border border-gray-600 relative z-10"
                  data-prospect={prospectName}
                  data-expanded="true"
                >
                  {prospectComments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="flex items-start justify-between rounded-lg border border-gray-600 bg-gray-700 p-4"
                    >
                      <div className="flex flex-col space-y-1 text-sm">
                        <p>
                          <strong>Submitted by:</strong>{" "}
                          {comment.active_name || "Unknown"}
                        </p>
                        <p>
                          <strong>{comment.interaction || "No data"}</strong>{" "}
                          interaction |{" "}
                          <strong>{comment.invite || "No data"}</strong> invite
                        </p>
                        <p className="text-sm italic">
                          "{comment.comment || "No comment"}"
                        </p>
                        <div className="text-xs text-gray-400">
                          {new Intl.DateTimeFormat("en-US", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          }).format(new Date(comment.created_at))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    );
  };

  return (
    <div className="flex w-full items-center justify-center">
      <div className="animate-in w-full max-w-6xl opacity-0">
        {isPIC ? (
          <div className="container mx-auto px-4 pt-6 pb-32 relative">
            <div className="flex flex-col space-y-6">
              <h1 className="mt-10 text-center text-2xl font-semibold md:text-5xl">
                Prospect Comment Forms
              </h1>

              <div className="space-y-10">
                {renderSection(
                  "Prospects with 2+ Yes Invites",
                  sections.twoPlusYes
                )}
                {renderSection("Prospects with 1 Yes Invite", sections.oneYes)}
                {renderSection("Prospects with 0 Yes Invites", sections.zeroYes)}
                {renderSection("Unlinked Comment Forms", sections.notLinked)}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center">
            <ActiveLoginComponent />
          </div>
        )}
      </div>
    </div>
  );
}
