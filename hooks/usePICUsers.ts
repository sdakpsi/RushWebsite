import { useState, useEffect } from 'react';
import { getUsers } from '@/app/supabase/getUsers';
import { Packet } from '@/lib/types';

export function usePICUsers() {
  const [usersData, setUserData] = useState<Packet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsers();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return { usersData, isLoading };
}