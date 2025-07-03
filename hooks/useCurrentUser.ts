import { useQuery } from '@tanstack/react-query';
import { getCurrentUserData } from '@/app/supabase/clientQueries';

export function useCurrentUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
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