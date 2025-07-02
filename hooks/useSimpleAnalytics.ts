"use client";

import { useQuery } from "@tanstack/react-query";
import { getSimpleAnalytics } from "@/app/supabase/analyticsSimple";

export const useSimpleAnalytics = () => {
  return useQuery({
    queryKey: ["simple-analytics"],
    queryFn: async () => {
      try {
        console.log("Starting simple analytics query...");
        const result = await getSimpleAnalytics();
        console.log("Simple analytics result:", result);
        return result;
      } catch (error) {
        console.error("Error in useSimpleAnalytics:", error);
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1,
  });
};