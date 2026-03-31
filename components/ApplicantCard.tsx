import React, { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBatchedApplicantData } from "@/app/supabase/clientQueries";
import type { Packet } from "@/lib/types";

interface ApplicantCardProps {
  applicant: Packet;
  onViewApplication: (applicationId: string, userId: string) => void;
  /** Optional pre-resolved URL from parent (e.g. legacy avatar map) */
  avatarUrl?: string | null;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onViewApplication,
  avatarUrl: prefetchedAvatarUrl,
}) => {
  const { data: applicantData } = useQuery({
    queryKey: ["applicantData", applicant.id],
    queryFn: () => getBatchedApplicantData(applicant.id),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const caseStudiesData = applicantData?.caseStudies || [];
  const interviewsData = applicantData?.interviews || [];
  const totalScore = applicantData?.totalScore ?? 0;

  const resolvedAvatar =
    applicantData?.avatarUrl?.trim() ||
    prefetchedAvatarUrl?.trim() ||
    applicant.photo_url?.trim() ||
    null;

  const caseActives = caseStudiesData.map((item: { active_name: string }) => item.active_name);
  const numCaseStudies = caseActives.length;
  const interviewActives = interviewsData.map((item: { active_name: string }) => item.active_name);
  const numInterviews = interviewActives.length;

  return (
    <button
      type="button"
      onClick={() =>
        applicant.application &&
        onViewApplication(applicant.application, applicant.id)
      }
      className="transition duration-200 hover:scale-[1.03]"
    >
      <div className="m-2 flex flex-col items-start rounded-lg border border-border bg-card p-3 text-left shadow-sm">
        <div className="flex flex-row">
          {resolvedAvatar ? (
            <img
              src={resolvedAvatar}
              alt=""
              className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
              <span className="text-[10px] text-muted-foreground">No Image</span>
            </div>
          )}
          <div className="ml-4 flex min-w-0 flex-col">
            <h3 className="truncate text-lg font-bold text-foreground">
              {applicant.full_name}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              <i>{applicant.email}</i>
            </p>
          </div>
        </div>
        <div className="mt-2 text-left">
          {numCaseStudies >= 3 ? (
            <p className="text-xs text-emerald-700">
              {numCaseStudies} Cases: {caseActives.join(", ")}
            </p>
          ) : (
            <p className="text-xs text-rose-600">
              {numCaseStudies} Cases: {caseActives.join(", ")}
            </p>
          )}
          {numInterviews >= 3 ? (
            <p className="text-xs text-emerald-700">
              {numInterviews} Interviews: {interviewActives.join(", ")}
            </p>
          ) : (
            <p className="text-xs text-rose-600">
              {numInterviews} Interviews: {interviewActives.join(", ")}
            </p>
          )}
        </div>
        <div className="mt-2 text-sm text-foreground">
          <span>Total Score: {totalScore}</span>
        </div>
      </div>
    </button>
  );
};

export default memo(ApplicantCard);
