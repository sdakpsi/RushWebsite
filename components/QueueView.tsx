"use client";

import React, { useState, useEffect } from "react";
import { QueueType, QueueStatus } from "@/lib/types";
import customToast from "@/components/CustomToast";
import { useQueueRealtime } from "@/hooks/useQueueRealtime";
import { createClient } from "@/utils/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface QueueViewProps {
  onQueueUpdate?: () => void;
  isPic?: boolean;
}

const QueueView: React.FC<QueueViewProps> = ({ onQueueUpdate, isPic=false }) => {
  const { queue, isLoading, error, refetch, pendingCount } = useQueueRealtime();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);


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
        return { icon: "", text: "PRO", color: "text-green-400" };
      case QueueType.NEGATIVE:
        return { icon: "", text: "CON", color: "text-red-400" };
      case QueueType.COMMENT:
        return { icon: "", text: "COMMENT", color: "text-blue-400" };
      default:
        return { icon: "", text: "UNKNOWN", color: "text-gray-400" };
    }
  };

  const getStatusDisplay = (status: QueueStatus) => {
    switch (status) {
      case QueueStatus.PENDING:
        return { text: "WAITING", color: "bg-yellow-600" };
      case QueueStatus.SPEAKING:
        return { text: "SPEAKING", color: "bg-green-600" };
      case QueueStatus.COMPLETED:
        return { text: "COMPLETED", color: "bg-gray-600" };
      default:
        return { text: "Unknown", color: "bg-gray-600" };
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
      <div className="bg-background rounded-lg p-6 border border-foreground/20">
        <h2 className="text-xl font-semibold text-foreground mb-4">Queue Management</h2>
        <div className="text-center text-foreground/60">Loading queue...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background rounded-lg p-6 border border-foreground/20">
        <h2 className="text-xl font-semibold text-foreground mb-4">Queue Management</h2>
        <div className="text-center text-red-400">Error: {error}</div>
        <div className="text-center mt-2">
          <button
            onClick={refetch}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg p-6 border border-foreground/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Queue Management</h2>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400">
            Last updated: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button
            onClick={() => {
              refetch();
              setLastRefresh(new Date());
            }}
            disabled={isUpdating}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="text-center text-foreground/60 py-8">
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
                className={`p-4 rounded-lg border ${
                  isFirst 
                    ? 'bg-slate-750 border-blue-500 shadow-lg' 
                    : 'bg-slate-750 border-slate-600'
                } ${entry.status === QueueStatus.SPEAKING ? 'ring-2 ring-green-500' : ''} ${
                  isCurrentUser ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{typeDisplay.icon}</span>
                      <div>
                        <div className="font-semibold text-white">
                          {entry.user?.full_name || 'Unknown User'}
                          {isCurrentUser && (
                            <span className="ml-2 px-1 py-0.5 bg-purple-600 text-white text-xs rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${typeDisplay.color} font-bold`}>
                          {typeDisplay.text}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs text-white ${statusDisplay.color}`}>
                        {statusDisplay.text}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatTime(entry.created_at)}
                      </span>
                      {isFirst && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          NEXT UP
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {isCurrentUser ? (
                      // Self-removal button for current user
                      <button
                        onClick={handleRemoveSelfFromQueue}
                        disabled={isUpdating}
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                      >
                        Remove Myself
                      </button>
                    ) : (
                      // PIC controls for other users
                      <>
                        {entry.status === QueueStatus.PENDING && (
                          <button
                            onClick={() => handleSetSpeaking(entry.id)}
                            disabled={isUpdating}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Speaking
                          </button>
                        )}
                       {isPic && ( 
                        <button
                          onClick={() => handleRemoveFromQueue(entry.id)}
                          disabled={isUpdating}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
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
      
      <div className="mt-4 text-sm text-slate-400 text-center">
        Total in queue: {pendingCount}
      </div>
    </div>
  );
};

export default QueueView;