import { useQuery } from '@tanstack/react-query';
import { getIsPIC, getIsActive } from '@/app/supabase/clientQueries';

export function useActiveStatus() {
  const { data: isPIC = false, isLoading: picLoading } = useQuery({
    queryKey: ['userIsPIC'],
    queryFn: getIsPIC,
    staleTime: 30 * 60 * 1000, // 30 minutes - roles rarely change
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: isActive = false, isLoading: activeLoading } = useQuery({
    queryKey: ['userIsActive'],
    queryFn: getIsActive,
    staleTime: 30 * 60 * 1000, // 30 minutes - roles rarely change
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  const isLoading = picLoading || activeLoading;

  return { isPIC, isActive, isLoading };
}