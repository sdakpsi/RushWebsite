import React, { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  getApplicantAvatar,
  getApplicantCaseStudies,
  getApplicantInterviews,
  getApplicantTotalScore
} from "@/app/supabase/clientQueries";

interface Packet {
  id: string;
  created_at: string;
  full_name: string;
  is_active: boolean;
  is_pic: boolean;
  application: string | null; // Assuming application could be null
  case_study: string | null; // Assuming case_study could be null
  interview: string | null; // Assuming interview could be null
  email: string;
  active_case_studies: string | null; // Assuming active_case_studies could be null
  active_interviews: string | null; // Assuming active_interviews could be null
  total_score: number | null;
}

interface ApplicantCardProps {
  applicant: Packet;
  onViewApplication: (applicationId: string, userId: string) => void;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onViewApplication,
}) => {
  // Use React Query for optimized caching
  const { data: avatarUrl } = useQuery({
    queryKey: ['avatar', applicant.id],
    queryFn: () => getApplicantAvatar(applicant.id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const { data: caseStudiesData = [] } = useQuery({
    queryKey: ['caseStudies', applicant.id],
    queryFn: () => getApplicantCaseStudies(applicant.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: interviewsData = [] } = useQuery({
    queryKey: ['interviews', applicant.id],
    queryFn: () => getApplicantInterviews(applicant.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: totalScore = 0 } = useQuery({
    queryKey: ['totalScore', applicant.id],
    queryFn: () => getApplicantTotalScore(applicant.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Derive computed values
  const caseActives = caseStudiesData.map(item => item.active_name);
  const numCaseStudies = caseActives.length;
  const interviewActives = interviewsData.map(item => item.active_name);
  const numInterviews = interviewActives.length;

  return (
    <button
      onClick={() =>
        applicant.application &&
        onViewApplication(applicant.application, applicant.id)
      }
      className="transition duration-200 hover:scale-[1.03]"
    >
      <div className="m-2 flex flex-col items-start rounded-lg bg-slate-800 p-3 shadow-lg">
        <div className="flex flex-row">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 items-center justify-center rounded-full bg-gray-200 pt-2 text-xs">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <div className="ml-4 flex flex-col text-left">
            <h3 className="text-lg font-bold">{applicant.full_name}</h3>
            <p className="text-xs">
              <i>{applicant.email}</i>
            </p>
          </div>
        </div>
        {/* Score and evaluation data */}
        <div className="mt-2 text-left">
          {numCaseStudies >= 3 ? (
            <p className="text-xs text-green-500">
              {numCaseStudies} Cases: {caseActives.join(", ")}
            </p>
          ) : (
            <p className="text-xs text-red-500">
              {numCaseStudies} Cases: {caseActives.join(", ")}
            </p>
          )}
          {numInterviews >= 3 ? (
            <p className="text-xs text-green-500">
              {numInterviews} Interviews: {interviewActives.join(", ")}
            </p>
          ) : (
            <p className="text-xs text-red-500">
              {numInterviews} Interviews: {interviewActives.join(", ")}
            </p>
          )}
        </div>
        <div className="mt-2">
          <span>Total Score: {totalScore}</span>
        </div>
      </div>
    </button>
  );
};

export default memo(ApplicantCard);
