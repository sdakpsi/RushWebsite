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

export const useAnalyticsSummary = () => {
  return useQuery<AnalyticsSummary>({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      try {
        console.log("Fetching analytics summary...");
        const result = await getAnalyticsSummary();
        console.log("Analytics summary result:", result);
        return result;
      } catch (error) {
        console.error("Error in useAnalyticsSummary:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useActiveParticipation = () => {
  return useQuery<ActiveParticipationMetrics[]>({
    queryKey: ["active-participation"],
    queryFn: async () => {
      try {
        console.log("Fetching active participation...");
        const result = await getActiveParticipationMetrics();
        console.log("Active participation result:", result);
        return result;
      } catch (error) {
        console.error("Error in useActiveParticipation:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEvaluationTimeline = () => {
  return useQuery<EvaluationTimelineData[]>({
    queryKey: ["evaluation-timeline"],
    queryFn: async () => {
      try {
        console.log("Fetching evaluation timeline...");
        const result = await getEvaluationTimeline();
        console.log("Evaluation timeline result:", result);
        return result;
      } catch (error) {
        console.error("Error in useEvaluationTimeline:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProspectCoverage = () => {
  return useQuery<ProspectCoverageData[]>({
    queryKey: ["prospect-coverage"],
    queryFn: async () => {
      try {
        console.log("Fetching prospect coverage...");
        const result = await getProspectCoverage();
        console.log("Prospect coverage result:", result);
        return result;
      } catch (error) {
        console.error("Error in useProspectCoverage:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};