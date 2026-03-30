"use client";

import React, { useState } from "react";
import { QueueType, QueueStatus } from "@/lib/types";
import customToast from "@/components/CustomToast";
import { useQueueRealtime } from "@/hooks/useQueueRealtime";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface QueueViewProps {
  onQueueUpdate?: () => void;
  isPic?: boolean;
}

const QueueView: React.FC<QueueViewProps> = ({ onQueueUpdate, isPic=false }) => {
  const { queue, isLoading, error, refetch, pendingCount } = useQueueRealtime();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { user } = useCurrentUser();
  const currentUserId = user?.id || null;
  const queryClient = useQueryClient();

  const removeFromQueueMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await fetch('/api/queue/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from queue');
      }
      
      return response.json();
    },
    onSuccess: () => {
      customToast('Removed from queue', 'success');
      refetch();
      setLastRefresh(new Date());
      if (onQueueUpdate) onQueueUpdate();
    },
    onError: (error: Error) => {
      customToast(error.message, 'error');
    },
  });

  const removeSelfFromQueueMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/queue/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ self_remove: true }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from queue');
      }
      
      return response.json();
    },
    onSuccess: () => {
      customToast('Removed yourself from queue', 'success');
      refetch();
      setLastRefresh(new Date());
      if (onQueueUpdate) onQueueUpdate();
    },
    onError: (error: Error) => {
      customToast(error.message, 'error');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ entryId, status }: { entryId: string; status: QueueStatus }) => {
      const response = await fetch('/api/queue/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry_id: entryId, status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      customToast('Status updated', 'success');
      refetch();
      setLastRefresh(new Date());
      if (onQueueUpdate) onQueueUpdate();
    },
    onError: (error: Error) => {
      customToast(error.message, 'error');
    },
  });

  const isUpdating = removeFromQueueMutation.isPending || removeSelfFromQueueMutation.isPending || updateStatusMutation.isPending;



  // Remove person from queue (called from top of queue)
  const handleRemoveFromQueue = (entryId: string) => {
    if (isUpdating) return;
    removeFromQueueMutation.mutate(entryId);
  };

  // Remove self from queue
  const handleRemoveSelfFromQueue = () => {
    if (isUpdating || !currentUserId) return;
    removeSelfFromQueueMutation.mutate();
  };

  // Mark person as speaking
  const handleSetSpeaking = (entryId: string) => {
    if (isUpdating) return;
    updateStatusMutation.mutate({ entryId, status: QueueStatus.SPEAKING });
  };


  const getQueueTypeDisplay = (queueType: QueueType) => {
    switch (queueType) {
      case QueueType.POSITIVE:
        return { icon: "", text: "PRO", color: "text-emerald-700" };
      case QueueType.NEGATIVE:
        return { icon: "", text: "CON", color: "text-red-700" };
      case QueueType.COMMENT:
        return { icon: "", text: "COMMENT", color: "text-sky-800" };
      default:
        return { icon: "", text: "UNKNOWN", color: "text-gray-600" };
    }
  };

  const getStatusDisplay = (status: QueueStatus) => {
    switch (status) {
      case QueueStatus.PENDING:
        return { text: "WAITING", color: "bg-amber-100 text-amber-950 border border-amber-300" };
      case QueueStatus.SPEAKING:
        return { text: "SPEAKING", color: "bg-emerald-100 text-emerald-950 border border-emerald-300" };
      case QueueStatus.COMPLETED:
        return { text: "COMPLETED", color: "bg-gray-200 text-gray-800 border border-gray-300" };
      default:
        return { text: "Unknown", color: "bg-gray-200 text-gray-600 border border-gray-300" };
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-black">Queue Management</h2>
        <div className="text-center text-gray-600">Loading queue...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-black">Queue Management</h2>
        <div className="text-center text-red-600">Error: {error instanceof Error ? error.message : String(error)}</div>
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-muted px-3 py-1 text-sm text-gray-800 hover:bg-muted/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black">Queue Management</h2>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            type="button"
            onClick={() => {
              refetch();
              setLastRefresh(new Date());
            }}
            disabled={isUpdating}
            className="rounded-lg border border-border bg-muted px-3 py-1 text-sm font-medium text-gray-800 hover:bg-muted/80 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="py-8 text-center text-gray-600">
          No one in queue
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((entry, index) => {
            const typeDisplay = getQueueTypeDisplay(entry.queue_type);
            const statusDisplay = getStatusDisplay(entry.status);
            const isFirst = index === 0;
            const isCurrentUser = currentUserId === entry.user_id;
            
            return (
              <div
                key={entry.id}
                className={`rounded-lg border p-4 ${
                  isFirst
                    ? 'border-primary bg-muted/40 shadow-sm'
                    : 'border-border bg-muted/30'
                } ${entry.status === QueueStatus.SPEAKING ? 'ring-2 ring-emerald-500/80' : ''} ${
                  isCurrentUser ? 'ring-2 ring-primary/60' : ''
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{typeDisplay.icon}</span>
                      <div>
                        <div className="font-semibold text-black">
                          {entry.user?.full_name || 'Unknown User'}
                          {isCurrentUser && (
                            <span className="ml-2 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className={`text-xs font-bold ${typeDisplay.color}`}>
                          {typeDisplay.text}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${statusDisplay.color}`}>
                        {statusDisplay.text}
                      </span>
                      <span className="text-xs text-gray-600">
                        {formatTime(entry.created_at)}
                      </span>
                      {isFirst && (
                        <span className="rounded bg-sky-100 px-2 py-1 text-xs font-medium text-sky-950 ring-1 ring-sky-300">
                          NEXT UP
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 gap-2">
                    {isCurrentUser ? (
                      <button
                        type="button"
                        onClick={handleRemoveSelfFromQueue}
                        disabled={isUpdating}
                        className="rounded-lg border border-border bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        Remove Myself
                      </button>
                    ) : (
                      <>
                        {entry.status === QueueStatus.PENDING && (
                          <button
                            type="button"
                            onClick={() => handleSetSpeaking(entry.id)}
                            disabled={isUpdating}
                            className="rounded-lg bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Speaking
                          </button>
                        )}
                       {isPic && ( 
                        <button
                          type="button"
                          onClick={() => handleRemoveFromQueue(entry.id)}
                          disabled={isUpdating}
                          className="rounded-lg bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-4 text-center text-sm text-gray-600">
        Total in queue: {pendingCount}
      </div>
    </div>
  );
};

export default QueueView;