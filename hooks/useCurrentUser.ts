import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getCurrentUserData } from '@/app/supabase/clientQueries';

export function useCurrentUser() {
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['currentUser'], // This replaces both userIsPIC and userIsActive queries
    queryFn: getCurrentUserData,
    staleTime: 30 * 60 * 1000, // 30 minutes - user data changes very infrequently
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    // Enable background refetching while showing stale data
    refetchOnMount: 'always',
    // Don't show loading on background updates
    notifyOnChangeProps: ['data', 'error'],
  });

  // Memoize result to prevent unnecessary re-renders
  const result = useMemo(() => ({
    user: data?.user,
    userData: data?.userData,
    isActive: data?.isActive ?? false,
    isPIC: data?.isPIC ?? false,
    hasPhoto: data?.hasPhoto ?? false,
    photoUrl: data?.photoUrl,
    isLoading: isLoading && !data, // Only consider loading if we have no data at all
    isFetching,
    error
  }), [data, isLoading, isFetching, error]);

  return result;
}