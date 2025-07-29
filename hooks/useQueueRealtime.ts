"use client";

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { DelibQueueEntry, QueueStatus } from '@/lib/types';

const fetchQueueData = async (): Promise<DelibQueueEntry[]> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('delib_queue')
    .select(`
      *,
      user:users!user_id (
        full_name,
        email
      )
    `)
    .in('status', [QueueStatus.PENDING, QueueStatus.SPEAKING])
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const useQueueRealtime = () => {
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Use React Query for initial data fetching
  const { data: queue = [], isLoading, error, refetch } = useQuery({
    queryKey: ['delibQueue'],
    queryFn: fetchQueueData,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    const supabase = createClient();

    // Set up real-time subscription to invalidate and refetch data
    const subscription = supabase
      .channel('delib_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'delib_queue'
        },
        async (payload) => {
          console.log('Queue change received:', payload);
          
          // Invalidate and refetch the queue data whenever there's a change
          queryClient.invalidateQueries({ queryKey: ['delibQueue'] });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'CHANNEL_ERROR') {
          setRealtimeError('Real-time connection failed');
        } else {
          setRealtimeError(null);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [queryClient]);

  const pendingCount = queue.filter(entry => entry.status === QueueStatus.PENDING).length;
  const speakingCount = queue.filter(entry => entry.status === QueueStatus.SPEAKING).length;

  // Combine React Query error with realtime error
  const combinedError = error || realtimeError;
  
  if (combinedError) {
    console.error('Queue error:', combinedError);
  }

  return {
    queue,
    isLoading,
    error: combinedError,
    refetch,
    pendingCount,
    speakingCount
  };
};