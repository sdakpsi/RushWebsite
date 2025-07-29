import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

const fetchCurrentWaveData = async () => {
  const supabase = createClient();
  
  const { data: delibsData, error: delibsError } = await supabase
    .from('delibs')
    .select('prospect_id');

  if (delibsError) throw delibsError;

  const prospectIds = delibsData?.map(d => d.prospect_id) || [];
  const currentWaveCount = prospectIds.length;

  let currentWaveNames: string[] = [];
  if (prospectIds.length > 0) {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('full_name')
      .in('id', prospectIds)
      .order('full_name', { ascending: true });

    if (usersError) throw usersError;

    currentWaveNames = usersData?.map(u => u.full_name) || [];
  }

  return { currentWaveCount, currentWaveNames };
};

export function useCurrentWave() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['currentWave'],
    queryFn: fetchCurrentWaveData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (error) {
    console.error('Error fetching current wave:', error);
  }

  return {
    currentWaveCount: data?.currentWaveCount || 0,
    currentWaveNames: data?.currentWaveNames || [],
    isLoading,
    error,
    refetch
  };
}