import { useQuery } from "@tanstack/react-query";
import { getUsers, getBulkAvatars } from "@/app/supabase/clientQueries";

export function usePICUsers() {
  const { data: usersData = [], isLoading: usersLoading, error } = useQuery({
    queryKey: ['picUsers'],
    queryFn: getUsers,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Fetch avatars in bulk once users are loaded
  const userIds = usersData.map(user => user.id);
  const { data: avatarMap = {}, isLoading: avatarsLoading } = useQuery({
    queryKey: ['bulkAvatars', userIds],
    queryFn: () => getBulkAvatars(userIds),
    enabled: userIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  if (error) {
    console.error("Error fetching PIC users:", error);
  }

  const isLoading = usersLoading || avatarsLoading;

  return { usersData, avatarMap, isLoading };
}
