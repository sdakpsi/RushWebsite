"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  getActiveParticipationMetrics, 
  getEvaluationTimeline, 
  getProspectCoverage, 
  getAnalyticsSummary,
  type ActiveParticipationMetrics,
  type EvaluationTimelineData,
  type ProspectCoverageData,
  type AnalyticsSummary
} from "@/app/supabase/analytics";

export interface AllAnalyticsData {
  summary: AnalyticsSummary;
  participation: ActiveParticipationMetrics[];
  timeline: EvaluationTimelineData[];
  coverage: ProspectCoverageData[];
}

export const useAllAnalytics = () => {
  return useQuery<AllAnalyticsData>({
    queryKey: ["all-analytics"],
    queryFn: async () => {
      try {
        console.log("Fetching all analytics data...");
        
        const [summary, participation, timeline, coverage] = await Promise.all([
          getAnalyticsSummary(),
          getActiveParticipationMetrics(),
          getEvaluationTimeline(),
          getProspectCoverage()
        ]);

        const result = {
          summary,
          participation,
          timeline,
          coverage
        };

        console.log("All analytics result:", result);
        return result;
      } catch (error) {
        console.error("Error in useAllAnalytics:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};