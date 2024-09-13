import { useState, useEffect } from 'react';
import { getCases, getInterviews } from '@/app/supabase/getUsers';

export function useCasesAndInterviews(userID: string) {
  const [cases, setCases] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      if (userID) {
        const fetchedCases = await getCases(userID);
        const fetchedInterviews = await getInterviews(userID);
        setCases(fetchedCases || []);
        setInterviews(fetchedInterviews || []);
      }
    };
    fetchData();
    setIsLoading(false);
  }, [userID]);

  return { cases, interviews, isLoading };
}