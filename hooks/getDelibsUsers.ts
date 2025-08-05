import { useQuery } from '@tanstack/react-query';
import { getDelibsUsers as fetchDelibsUsers } from '@/app/supabase/getUsers';
import { Packet } from '@/lib/types';

export function useDelibsUsers() {
  const { data: usersData = [], isLoading, error } = useQuery({
    queryKey: ['delibsUsers'],
    queryFn: fetchDelibsUsers,
    staleTime: 15 * 60 * 1000, // 15 minutes - deliberation users change infrequently
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  if (error) {
    console.error('Error fetching deliberation users:', error);
  }

  return { usersData, isLoading, error };
}