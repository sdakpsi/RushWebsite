import { useQuery } from '@tanstack/react-query';
import { getCases, getInterviews } from '@/app/supabase/clientQueries';

export function useCasesAndInterviews(userID: string) {
  const { data: cases = [], isLoading: casesLoading } = useQuery({
    queryKey: ['cases', userID],
    queryFn: () => getCases(userID),
    enabled: !!userID,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: interviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ['interviews', userID],
    queryFn: () => getInterviews(userID),
    enabled: !!userID,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const isLoading = casesLoading || interviewsLoading;

  return { cases, interviews, isLoading };
}