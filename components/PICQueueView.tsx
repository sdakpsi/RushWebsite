"use client";

import React, { useState } from "react";
import { QueueType, QueueStatus } from "@/lib/types";
import customToast from "@/components/CustomToast";
import { useQueueRealtime } from "@/hooks/useQueueRealtime";

interface PICQueueViewProps {
  onQueueUpdate?: () => void;
}

const PICQueueView: React.FC<PICQueueViewProps> = ({ onQueueUpdate }) => {
  const { queue, isLoading, error, refetch, pendingCount } = useQueueRealtime();
  const [isUpdating, setIsUpdating] = useState(false);

  // Remove person from queue (called from top of queue)
  const handleRemoveFromQueue = async (entryId: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/queue/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entry_id: entryId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove from queue');
      }

      customToast('Removed from queue', 'success');
      
      if (onQueueUpdate) {
        onQueueUpdate();
      }
    } catch (error) {
      console.error('Error removing from queue:', error);
      customToast(
        error instanceof Error ? error.message : 'Failed to remove from queue',
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Mark person as speaking
  const handleSetSpeaking = async (entryId: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/queue/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          entry_id: entryId, 
          status: QueueStatus.SPEAKING 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      customToast('Marked as speaking', 'success');
      
      if (onQueueUpdate) {
        onQueueUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      customToast(
        error instanceof Error ? error.message : 'Failed to update status',
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };


  const getQueueTypeDisplay = (queueType: QueueType) => {
    switch (queueType) {
      case QueueType.POSITIVE:
        return { icon: "", text: "Pro", color: "text-green-400" };
      case QueueType.NEGATIVE:
        return { icon: "", text: "Con", color: "text-red-400" };
      case QueueType.COMMENT:
        return { icon: "", text: "Comment", color: "text-blue-400" };
      default:
        return { icon: "", text: "Unknown", color: "text-gray-400" };
    }
  };

  const getStatusDisplay = (status: QueueStatus) => {
    switch (status) {
      case QueueStatus.PENDING:
        return { text: "Waiting", color: "bg-yellow-600" };
      case QueueStatus.SPEAKING:
        return { text: "Speaking", color: "bg-green-600" };
      case QueueStatus.COMPLETED:
        return { text: "Completed", color: "bg-gray-600" };
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
        <button
          onClick={refetch}
          disabled={isUpdating}
          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Refresh
        </button>
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
            
            return (
              <div
                key={entry.id}
                className={`p-4 rounded-lg border ${
                  isFirst 
                    ? 'bg-slate-700 border-blue-500 shadow-lg' 
                    : 'bg-slate-750 border-slate-600'
                } ${entry.status === QueueStatus.SPEAKING ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{typeDisplay.icon}</span>
                      <div>
                        <div className="font-semibold text-white">
                          {entry.user?.full_name || 'Unknown User'}
                        </div>
                        <div className={`text-sm ${typeDisplay.color}`}>
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
                          NEXT
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {entry.status === QueueStatus.PENDING && (
                      <button
                        onClick={() => handleSetSpeaking(entry.id)}
                        disabled={isUpdating}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Speaking
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleRemoveFromQueue(entry.id)}
                      disabled={isUpdating}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
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

export default PICQueueView;