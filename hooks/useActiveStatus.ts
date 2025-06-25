import { useQuery } from '@tanstack/react-query';
import { getIsPIC, getIsActive } from '@/app/supabase/clientQueries';

export function useActiveStatus() {
  const { data: isPIC = false, isLoading: picLoading } = useQuery({
    queryKey: ['userIsPIC'],
    queryFn: getIsPIC,
    staleTime: 15 * 60 * 1000, // 15 minutes - roles rarely change
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const { data: isActive = false, isLoading: activeLoading } = useQuery({
    queryKey: ['userIsActive'],
    queryFn: getIsActive,
    staleTime: 15 * 60 * 1000, // 15 minutes - roles rarely change
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const isLoading = picLoading || activeLoading;

  return { isPIC, isActive, isLoading };
}