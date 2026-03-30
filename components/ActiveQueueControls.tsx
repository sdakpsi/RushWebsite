"use client";

import React, { useState } from "react";
import { QueueType } from "@/lib/types";
import customToast from "@/components/CustomToast";

interface ActiveQueueControlsProps {
  userId: string;
  onQueueJoin?: () => void;
}

const ActiveQueueControls: React.FC<ActiveQueueControlsProps> = ({ 
  userId, 
  onQueueJoin 
}) => {
  const [isJoining, setIsJoining] = useState(false);

  const handleRaiseHand = async (queueType: QueueType) => {
    if (isJoining) return;
    
    setIsJoining(true);
    
    try {
      const response = await fetch('/api/queue/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          queue_type: queueType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join queue');
      }

      const data = await response.json();
      customToast(`Added to queue: ${queueType}`, 'success');
      
      if (onQueueJoin) {
        onQueueJoin();
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      customToast(
        error instanceof Error ? error.message : 'Failed to join queue',
        'error'
      );
    } finally {
      setIsJoining(false);
    }
  };

  const getButtonStyle = (queueType: QueueType) => {
    const baseStyle = "flex items-center justify-center rounded-md px-4 py-2 text-xs lg:text-lg font-semibold focus:outline-none focus:ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
    
    switch (queueType) {
      case QueueType.POSITIVE:
        return `${baseStyle} bg-green-600 text-white hover:bg-green-700`;
      case QueueType.NEGATIVE:
        return `${baseStyle} bg-red-600 text-white hover:bg-red-700`;
      case QueueType.COMMENT:
        return `${baseStyle} bg-blue-600 text-white hover:bg-blue-700`;
      default:
        return `${baseStyle} bg-btn-background hover:bg-btn-background-hover`;
    }
  };

  const getButtonText = (queueType: QueueType) => {
    switch (queueType) {
      case QueueType.POSITIVE:
        return "PRO";
      case QueueType.NEGATIVE:
        return "CON";
      case QueueType.COMMENT:
        return "COMMENT";
      default:
        return "Raise Hand";
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-center text-lg font-semibold text-black">
        Delibs Queue
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => handleRaiseHand(QueueType.POSITIVE)}
          disabled={isJoining}
          className={getButtonStyle(QueueType.POSITIVE)}
        >
          {isJoining ? "Joining..." : getButtonText(QueueType.POSITIVE)}
        </button>
        
        <button
          onClick={() => handleRaiseHand(QueueType.NEGATIVE)}
          disabled={isJoining}
          className={getButtonStyle(QueueType.NEGATIVE)}
        >
          {isJoining ? "Joining..." : getButtonText(QueueType.NEGATIVE)}
        </button>
        
        <button
          onClick={() => handleRaiseHand(QueueType.COMMENT)}
          disabled={isJoining}
          className={getButtonStyle(QueueType.COMMENT)}
        >
          {isJoining ? "Joining..." : getButtonText(QueueType.COMMENT)}
        </button>
      </div>
      
      <p className="mt-3 text-center text-sm text-gray-600">
        Click a button to join the delib queue
      </p>
    </div>
  );
};

export default ActiveQueueControls;