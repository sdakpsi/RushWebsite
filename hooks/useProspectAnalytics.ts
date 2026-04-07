"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getProspectAnalytics,
  type ProspectAnalyticsRow,
} from "@/app/supabase/analytics";

export const useProspectAnalytics = () => {
  return useQuery<ProspectAnalyticsRow[]>({
    queryKey: ["prospect-analytics"],
    queryFn: async () => {
      try {
        return await getProspectAnalytics();
      } catch (error) {
        console.error("Error in useProspectAnalytics:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
