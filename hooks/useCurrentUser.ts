import { useQuery } from '@tanstack/react-query';
import { getCurrentUserData } from '@/app/supabase/clientQueries';

export function useCurrentUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserData,
    staleTime: 30 * 60 * 1000, // 30 minutes - user data changes very infrequently
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  const result = {
    user: data?.user,
    userData: data?.userData,
    isActive: data?.isActive ?? false,
    isPIC: data?.isPIC ?? false,
    hasPhoto: data?.hasPhoto ?? false,
    photoUrl: data?.photoUrl,
    isLoading,
    error
  };

  return result;
}