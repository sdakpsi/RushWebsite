import { useQuery } from '@tanstack/react-query';
import { getCurrentUserData } from '@/app/supabase/clientQueries';

export function useOptionalAuth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserData,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Key change: don't block rendering on loading state
    initialData: undefined,
    // Run immediately but don't show loading until we have no data
    enabled: true,
  });

  const hasAuthData = data !== undefined;
  
  const result = {
    user: data?.user,
    userData: data?.userData,
    isActive: data?.isActive ?? false,
    isPIC: data?.isPIC ?? false,
    hasPhoto: data?.hasPhoto ?? false,
    photoUrl: data?.photoUrl,
    isLoading: isLoading && !hasAuthData, // Only loading if we have no data at all
    hasAuthData,
    error
  };

  return result;
}