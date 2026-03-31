"use client";

import React, { useState, useRef, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProspectComments } from "@/hooks/useProspectComments";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsersForComments } from "@/app/supabase/clientQueries";
import { createClient } from "@/utils/supabase/client";
import customToast from "@/components/CustomToast";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const { isPIC, isLoading: isPICLoading, isActive } = useCurrentUser();
  const { commentsData, isLoading: isUsersLoading, error: commentsError } = useProspectComments();
  const queryClient = useQueryClient();

  // Fetch all prospects for linking
  const { data: prospectsData = [], isLoading: isProspectsLoading } = useQuery({
    queryKey: ['prospectsForLinking'],
    queryFn: getUsersForComments,
    enabled: isPIC,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const [expandedProspects, setExpandedProspects] = useState<{[key: string]: boolean}>({});
  const [linkingMode, setLinkingMode] = useState<{[key: string]: boolean}>({});
  const [selectedProspectForLinking, setSelectedProspectForLinking] = useState<{[key: string]: string}>({});

  // Mutation to link comments to prospects
  const linkCommentsMutation = useMutation({
    mutationFn: async ({ unlinkedProspectId, targetProspectId, targetProspectName }: {
      unlinkedProspectId: string;
      targetProspectId: string;
      targetProspectName: string;
    }) => {
      const supabase = createClient();
      
      // Update all comments with the unlinked prospect_id to use the target prospect's details
      const { data, error } = await supabase
        .from('comments')
        .update({
          prospect_id: targetProspectId,
          prospect_name: targetProspectName
        })
        .eq('prospect_id', unlinkedProspectId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      customToast(`Successfully linked comments to ${variables.targetProspectName}`, 'success');
      // Invalidate comments query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['prospectComments'] });
      // Reset linking state
      setLinkingMode(prev => ({ ...prev, [variables.unlinkedProspectId]: false }));
      setSelectedProspectForLinking(prev => ({ ...prev, [variables.unlinkedProspectId]: '' }));
    },
    onError: (error) => {
      customToast(`Error linking comments: ${error}`, 'error');
    }
  });

  // Helper function to find similar prospects by name
  const findSimilarProspects = useCallback((unlinkedName: string) => {
    if (!unlinkedName || !prospectsData.length) return [];
    
    const normalizeString = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedUnlinked = normalizeString(unlinkedName);
    
    return prospectsData
      .map(prospect => ({
        ...prospect,
        similarity: calculateSimilarity(normalizedUnlinked, normalizeString(prospect.full_name))
      }))
      .filter(prospect => prospect.similarity > 0.3) // Only show prospects with >30% similarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // Show top 5 matches
  }, [prospectsData]);

  // Simple string similarity calculation (Levenshtein distance based)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    // Initialize matrix
    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len2][len1]) / maxLen;
  };
  
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

  if (isPICLoading || isUsersLoading || isProspectsLoading) {
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
            <p className="text-sm text-foreground sm:text-lg">
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

    // Count unique active members who said "Yes" (only one comment per active)
    const uniqueYesActives = new Set(
      comments
        .filter((c: any) => c.invite === "Yes")
        .map((c: any) => c.active_id)
    );
    const yesCount = uniqueYesActives.size;

    if (yesCount >= 2) {
      sections.twoPlusYes.push(prospectId);
    } else if (yesCount === 1) {
      sections.oneYes.push(prospectId);
    } else {
      sections.zeroYes.push(prospectId);
    }
  });

  // Copy function for prospect names
  const copyProspectNames = (prospectIds: string[]) => {
    const names = prospectIds
      .map(prospectId => {
        const prospectComments = groupedComments[prospectId];
        return prospectComments[prospectComments.length - 1]?.prospect_name || "Unknown";
      })
      .filter(name => name !== "Unknown")
      .join(", ");

    navigator.clipboard.writeText(names).then(() => {
      customToast("Names copied to clipboard!", "success");
    }).catch(() => {
      customToast("Failed to copy names", "error");
    });
  };

  const renderSection = (title: string, prospectIds: string[]) => {
    // console.log(`Rendering section "${title}" with prospects:`, prospectIds);
    const isUnlinkedSection = title === "Unlinked Comment Forms";

    return (
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {title}
            {isUnlinkedSection && (
              <span className="ml-2 text-sm text-muted-foreground">
                ({prospectIds.length} unlinked)
              </span>
            )}
          </h2>
          {!isUnlinkedSection && prospectIds.length > 0 && (
            <button
              onClick={() => copyProspectNames(prospectIds)}
              className="btn btn-primary rounded-lg px-4 py-2 text-sm font-semibold shadow-md"
            >
              Copy Names ({prospectIds.length})
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-6">
          {prospectIds.map((prospectId, index) => {
          const prospectComments = groupedComments[prospectId];
          const prospectName =
            prospectComments[prospectComments.length - 1].prospect_name ||
            "Unknown Prospect";
          const prospectPhotoUrl = prospectComments[prospectComments.length - 1].prospect_photo_url;

          // Count unique active members for Yes/No invites (one comment per active)
          const uniqueYesActives = new Set(
            prospectComments
              .filter((c: any) => c.invite === "Yes")
              .map((c: any) => c.active_id)
          );
          const uniqueNoActives = new Set(
            prospectComments
              .filter((c: any) => c.invite === "No")
              .map((c: any) => c.active_id)
          );
          const yesInviteCount = uniqueYesActives.size;
          const noInviteCount = uniqueNoActives.size;
          const numberOfComments = prospectComments.length;
          
          // Create a truly unique key for this specific card instance
          const uniqueKey = `${title}-${prospectId}-${index}-${prospectComments[0]?.id || 'unknown'}`;
          const cardId = `card-${index}-${prospectComments[0]?.id || Math.random()}`;
          const isExpanded = expandedProspects[cardId] || false;
          
          // console.log(`Rendering prospect ${prospectName} with key: ${uniqueKey}, uniqueId: ${uniqueProspectId}, expanded: ${expandedProspects[uniqueProspectId]}`);

          return (
            <div
              key={uniqueKey}
              className="relative w-full flex-shrink-0 self-start rounded-lg border border-border bg-card p-1 shadow-sm transition-shadow duration-200 hover:shadow-md sm:w-80 lg:w-96"
              style={{ height: 'fit-content' }}
            >
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-muted px-4 py-2 text-left text-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={(event) => toggleProspect(cardId, event)}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {prospectPhotoUrl ? (
                    <img
                      src={prospectPhotoUrl}
                      alt={prospectName}
                      className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {prospectName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="min-w-0 truncate text-lg font-bold text-foreground">
                    {prospectId.slice(0, 5) === "66666" && (
                      <span className="text-red-600">*</span>
                    )}{" "}
                    {prospectName}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="whitespace-nowrap text-sm text-muted-foreground">
                    <span className="font-semibold text-green-600">
                      {yesInviteCount} Yes
                    </span>{" "}
                    |{" "}
                    <span className="font-semibold text-red-600">
                      {noInviteCount} No
                    </span>{" "}
                    | {numberOfComments}{" "}
                    {numberOfComments > 1 ? "Comments" : "Comment"}
                  </span>
                  {isUnlinkedSection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLinkingMode(prev => ({ ...prev, [prospectId]: !prev[prospectId] }));
                      }}
                      className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {linkingMode[prospectId] ? 'Cancel' : 'Link'}
                    </button>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div 
                  className="mt-2 space-y-2 rounded-lg border border-border bg-muted/40 p-2 shadow-sm"
                  data-card-id={cardId}
                  data-prospect={prospectName}
                  data-expanded="true"
                >
                  {prospectComments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="flex items-start justify-between rounded-lg border border-border bg-background p-4 text-foreground"
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
                        <div className="text-xs text-muted-foreground">
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

              {/* Linking interface for unlinked comments */}
              {isUnlinkedSection && linkingMode[prospectId] && (
                <div className="mt-2 rounded-lg border border-sky-200 bg-sky-50/80 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-sky-950">
                    Link "{prospectName}" to an existing prospect:
                  </h4>
                  
                  {/* Show similar prospects if any */}
                  {(() => {
                    const similarProspects = findSimilarProspects(prospectName);
                    return similarProspects.length > 0 ? (
                      <div className="mb-4">
                        <p className="mb-2 text-xs text-muted-foreground">Suggested matches:</p>
                        <div className="space-y-2">
                          {similarProspects.map((prospect: any) => (
                            <div key={prospect.id} className="flex items-center justify-between rounded border border-border bg-background p-2">
                              <div className="flex-1">
                                <span className="text-sm text-foreground">{prospect.full_name}</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({Math.round(prospect.similarity * 100)}% match)
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  linkCommentsMutation.mutate({
                                    unlinkedProspectId: prospectId,
                                    targetProspectId: prospect.id,
                                    targetProspectName: prospect.full_name
                                  });
                                }}
                                disabled={linkCommentsMutation.isPending}
                                className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {linkCommentsMutation.isPending ? 'Linking...' : 'Link'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="mb-3 text-xs text-muted-foreground">No similar prospects found</p>
                    );
                  })()}

                  {/* Manual prospect selection */}
                  <div className="space-y-2">
                    <label className="text-xs text-foreground">Or select a prospect manually:</label>
                    <select
                      value={selectedProspectForLinking[prospectId] || ''}
                      onChange={(e) => setSelectedProspectForLinking(prev => ({ 
                        ...prev, 
                        [prospectId]: e.target.value 
                      }))}
                      className="w-full rounded border border-border bg-background p-2 text-sm text-foreground"
                    >
                      <option value="">Select a prospect...</option>
                      {prospectsData
                        .sort((a, b) => a.full_name.localeCompare(b.full_name))
                        .map(prospect => (
                          <option key={prospect.id} value={prospect.id}>
                            {prospect.full_name} ({prospect.email})
                          </option>
                        ))}
                    </select>
                    
                    {selectedProspectForLinking[prospectId] && (
                      <button
                        onClick={() => {
                          const selectedProspect = prospectsData.find(p => p.id === selectedProspectForLinking[prospectId]);
                          if (selectedProspect) {
                            linkCommentsMutation.mutate({
                              unlinkedProspectId: prospectId,
                              targetProspectId: selectedProspect.id,
                              targetProspectName: selectedProspect.full_name
                            });
                          }
                        }}
                        disabled={linkCommentsMutation.isPending}
                        className="btn btn-primary w-full rounded px-4 py-2 text-sm disabled:opacity-50"
                      >
                        {linkCommentsMutation.isPending ? 'Linking...' : 'Link Comments'}
                      </button>
                    )}
                  </div>
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
              <h1 className="mt-10 text-center text-2xl font-semibold text-foreground md:text-5xl">
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
