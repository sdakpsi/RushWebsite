"use client";

import React, { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useActiveStatus } from "@/hooks/useActiveStatus";
import { useProspectComments } from "@/hooks/useProspectComments";

export default function ProtectedPage() {
  const { isPIC, isLoading: isPICLoading } = useActiveStatus();
  const { commentsData, isLoading: isUsersLoading } = useProspectComments();

  const [expandedProspects, setExpandedProspects] = useState<string[]>([]);

  // Toggle expanded state for each prospect
  const toggleProspect = (prospectId: string) => {
    setExpandedProspects((prev) =>
      prev.includes(prospectId)
        ? prev.filter((id) => id !== prospectId)
        : [...prev, prospectId]
    );
  };

  if (isPICLoading || isUsersLoading) {
    return <LoadingSpinner />;
  }

  // Group comments by prospect_id
  const groupedComments = commentsData.reduce((acc: any, comment: any) => {
    if (!acc[comment.prospect_id]) {
      acc[comment.prospect_id] = [];
    }
    acc[comment.prospect_id].push(comment);
    return acc;
  }, {});

  return (
    <div className="flex w-full flex-1 items-center justify-center bg-gray-900 py-10 text-gray-200">
      <div className="animate-in mx-8 w-full max-w-6xl">
        <div className="mb-8 text-center">
          <p className="text-3xl font-semibold leading-tight text-gray-50 lg:text-4xl">
            PIC Portal - Prospect Comments
          </p>
        </div>

        {isPIC ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(groupedComments).map((prospectId) => {
              const prospectComments = groupedComments[prospectId];
              const prospectName =
                prospectComments[prospectComments.length - 1].prospect_name ||
                "Unknown Prospect";
              const numberOfComments = prospectComments.length;

              // Count "Yes" invites
              const yesInviteCount = prospectComments.filter(
                (comment: any) => comment.invite === "Yes"
              ).length;

              const isExpanded = expandedProspects.includes(prospectId);

              return (
                <div
                  key={prospectId}
                  className={`rounded-lg bg-gray-800 p-1 shadow-lg transition-shadow duration-200 hover:shadow-xl ${
                    isExpanded ? "" : "h-full overflow-hidden"
                  }`}
                >
                  {/* Row showing the prospect name, yes invites, and total comments */}
                  <div
                    className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-700 px-4 py-2 text-gray-200 hover:bg-gray-600"
                    onClick={() => toggleProspect(prospectId)}
                  >
                    <span className="text-lg font-bold">{prospectName}</span>
                    <span className="text-sm">
                      <span
                        className={`font-semibold ${
                          yesInviteCount >= 2
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {yesInviteCount} yes
                      </span>{" "}
                      | {numberOfComments}{" "}
                      {numberOfComments > 1 ? "comments" : "comment"}
                    </span>
                  </div>

                  {/* Dropdown for comment details */}
                  {isExpanded && (
                    <div className="mt-2 space-y-2">
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
                              <strong>
                                {comment.interaction || "No data"}
                              </strong>{" "}
                              interaction |{" "}
                              <strong>{comment.invite || "No data"}</strong>{" "}
                              invite
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
        ) : (
          <div className="mt-8 text-center">
            <p>You are not on PIC.</p>
          </div>
        )}
      </div>
    </div>
  );
}
