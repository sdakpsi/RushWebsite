import { useState, useEffect } from 'react';
import { getIsPIC, getIsActive } from '@/app/supabase/getUsers';

export function useActiveStatus() {
  const [isPIC, setIsPIC] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const picStatus = await getIsPIC();
      const activeStatus = await getIsActive();
      setIsPIC(picStatus);
      setIsActive(activeStatus);
      setIsLoading(false);
    };
    checkStatus();
  }, []);

  return { isPIC, isActive, isLoading };
}