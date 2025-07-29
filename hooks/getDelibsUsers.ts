import { useQuery } from '@tanstack/react-query';
import { getDelibsUsers as fetchDelibsUsers } from '@/app/supabase/getUsers';
import { Packet } from '@/lib/types';

export function useDelibsUsers() {
  const { data: usersData = [], isLoading, error } = useQuery({
    queryKey: ['delibsUsers'],
    queryFn: fetchDelibsUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (error) {
    console.error('Error fetching deliberation users:', error);
  }

  return { usersData, isLoading, error };
}