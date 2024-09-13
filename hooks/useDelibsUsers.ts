import { useState, useEffect } from 'react';
import { getDelibsUsers } from '@/app/supabase/getUsers';
import { Packet } from '@/lib/types';

export function useDelibsUsers() {
  const [usersData, setUserData] = useState<Packet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDelibsUsers();
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