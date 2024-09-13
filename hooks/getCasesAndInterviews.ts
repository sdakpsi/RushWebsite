import { useState, useEffect } from 'react';
import { getCases, getInterviews } from '@/app/supabase/getUsers';

export function getCasesAndInterviews(userID: string) {
  const [cases, setCases] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (userID) {
        const fetchedCases = await getCases(userID);
        const fetchedInterviews = await getInterviews(userID);
        setCases(fetchedCases || []);
        setInterviews(fetchedInterviews || []);
      }
    };
    fetchData();
  }, [userID]);

  return { cases, interviews };
}