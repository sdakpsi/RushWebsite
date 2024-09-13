import { useState, useEffect } from 'react';
import { getIsActive } from '@/app/supabase/getUsers';

export function useActiveStatus() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkActive = async () => {
      const isUserActive = await getIsActive();
      setIsActive(isUserActive);
      setIsLoading(false);
    };
    checkActive();
  }, []);

  return { isActive, isLoading };
}