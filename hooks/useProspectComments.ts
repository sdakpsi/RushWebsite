import { useQuery } from '@tanstack/react-query';
import { getComments } from "@/app/supabase/clientQueries";
import { Comment } from "@/lib/types";

export function useProspectComments() {
  const { data: commentsData = [], isLoading, error } = useQuery({
    queryKey: ['prospectComments'],
    queryFn: getComments,
    staleTime: 5 * 60 * 1000, // 5 minutes - comments don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  if (error) {
    console.error("Error fetching prospect comments:", error);
  }

  return { commentsData, isLoading, error };
}
