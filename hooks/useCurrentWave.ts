import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export function useCurrentWave() {
  const [currentWaveCount, setCurrentWaveCount] = useState<number>(0);
  const [currentWaveNames, setCurrentWaveNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchCurrentWave = async () => {
    try {
      const { data: delibsData, error: delibsError } = await supabase
        .from('delibs')
        .select('prospect_id');

      if (delibsError) throw delibsError;

      const prospectIds = delibsData?.map(d => d.prospect_id) || [];
      setCurrentWaveCount(prospectIds.length);

      if (prospectIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('full_name')
          .in('id', prospectIds)
          .order('full_name', { ascending: true });

        if (usersError) throw usersError;

        setCurrentWaveNames(usersData?.map(u => u.full_name) || []);
      } else {
        setCurrentWaveNames([]);
      }
    } catch (error) {
      console.error('Error fetching current wave:', error);
      setCurrentWaveCount(0);
      setCurrentWaveNames([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentWave();
  }, []);

  return { currentWaveCount, currentWaveNames, isLoading, refetch: fetchCurrentWave };
}