import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/app/supabase/clientQueries";

export function usePICUsers() {
  const { data: usersData = [], isLoading, error } = useQuery({
    queryKey: ['picUsers'],
    queryFn: getUsers,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  if (error) {
    console.error("Error fetching PIC users:", error);
  }

  return { usersData, isLoading };
}
