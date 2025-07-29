import { useQuery } from '@tanstack/react-query';
import { getComments } from "@/app/supabase/clientQueries";
import { Comment } from "@/lib/types";

export function useProspectComments() {
  const { data: commentsData = [], isLoading, error } = useQuery({
    queryKey: ['prospectComments'],
    queryFn: getComments,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (error) {
    console.error("Error fetching prospect comments:", error);
  }

  return { commentsData, isLoading, error };
}
