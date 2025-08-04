import { useQuery } from '@tanstack/react-query';
import { getCurrentUserData } from '@/app/supabase/clientQueries';

export function useCurrentUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserData,
    staleTime: 10 * 60 * 1000, // 10 minutes - user data changes infrequently
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
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