"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { DelibQueueEntry, QueueStatus } from '@/lib/types';

export const useQueueRealtime = () => {
  const [queue, setQueue] = useState<DelibQueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchQueue = async () => {
      try {
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

        setQueue(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching queue:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch queue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueue();

    // Set up real-time subscription
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
          
          if (payload.eventType === 'INSERT') {
            // Fetch the new entry with user data
            const { data: newEntry, error } = await supabase
              .from('delib_queue')
              .select(`
                *,
                user:users!user_id (
                  full_name,
                  email
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && newEntry) {
              setQueue(prev => [...prev, newEntry].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              ));
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedEntry = payload.new as DelibQueueEntry;
            
            // If status changed to completed, remove from queue
            if (updatedEntry.status === QueueStatus.COMPLETED) {
              setQueue(prev => prev.filter(entry => entry.id !== updatedEntry.id));
            } else {
              // Update the entry in place
              setQueue(prev => prev.map(entry => 
                entry.id === updatedEntry.id 
                  ? { ...entry, ...updatedEntry }
                  : entry
              ));
            }
          } else if (payload.eventType === 'DELETE') {
            setQueue(prev => prev.filter(entry => entry.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIPTION_ERROR') {
          setError('Real-time connection failed');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    try {
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

      setQueue(data || []);
      setError(null);
    } catch (err) {
      console.error('Error refetching queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch queue');
    } finally {
      setIsLoading(false);
    }
  };

  const pendingCount = queue.filter(entry => entry.status === QueueStatus.PENDING).length;
  const speakingCount = queue.filter(entry => entry.status === QueueStatus.SPEAKING).length;

  return {
    queue,
    isLoading,
    error,
    refetch,
    pendingCount,
    speakingCount
  };
};