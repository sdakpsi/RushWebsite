import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

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
  onViewApplication: (applicationId: string, userId: string) => void; // Add onViewApplication function prop
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onViewApplication,
}) => {
  // const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [numCaseStudies, setNumCaseStudies] = useState<number>(0);
  const [caseActives, setCaseActives] = useState<string[]>([]);

  const [numInterviews, setNumInterviews] = useState<number>(0);
  const [interviewActives, setInterviewActives] = useState<string[]>([]);

  const [total, setTotal] = useState(0);
  const supabase = createClient();
  // useEffect(() => {
  //   const fetchAvatarUrl = async () => {
  //     try {
  //       const { data, error } = await supabase
  //         .from("user_avatar")
  //         .select("avatar_url")
  //         .eq("user_id", applicant.id)
  //         .single();
  //       if (error) throw error;
  //       if (data) setAvatarUrl(data.avatar_url);
  //     } catch (error: any) {
  //       console.error("Error fetching avatar URL:", error.message);
  //     }
  //   };

  //   fetchAvatarUrl();
  // }, [applicant.id]);
  useEffect(() => {
    const fetchNumCaseStudies = async () => {
      try {
        const { data, error } = await supabase
          .from("case_studies")
          .select("active_name") // Ensure 'active_name' is included in your select clause
          .eq("prospect", applicant.id);

        if (error) {
          console.error("Error fetching active names:", error);
          return;
        }

        // Assuming 'data' is an array of objects where each object contains 'active_name'
        const names = data.map((item) => item.active_name);
        setCaseActives(names); // Setting the state with the array of names
        setNumCaseStudies(names.length);
      } catch (error: any) {
        console.error("Error fetching number of case studies:", error.message);
      }
    };
    fetchNumCaseStudies();
  }, []); // Add applicant.id as a dependency

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const { data, error } = await supabase
          .from("interviews")
          .select("active_name") // Ensure 'active_name' is included in your select clause
          .eq("prospect_id", applicant.id);

        if (error) {
          console.error("Error fetching active names:", error);
          return;
        }

        // Assuming 'data' is an array of objects where each object contains 'active_name'
        const names = data.map((item) => item.active_name);
        setInterviewActives(names); // Setting the state with the array of names
        setNumInterviews(names.length);
      } catch (error: any) {
        console.error("Error fetching number of interviews:", error.message);
      }
    };
    fetchInterviews();
  }, []); // Add applicant.id as a dependency

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("total_score")
          .eq("id", applicant.id);

        if (error) throw error;
        if (data) setTotal(data[0].total_score);
      } catch (error: any) {
        console.error("Error fetching avatar URL:", error.message);
      }
    };

    fetchTotal();
  }, [applicant.id]);

  return (
    <button
      onClick={() =>
        applicant.application &&
        onViewApplication(applicant.application, applicant.id)
      }
      className="transition duration-200 hover:scale-[1.03]"
    >
      <div className="m-2 flex flex-col items-start rounded-lg bg-btn-background p-3 shadow-lg">
        <div className="flex flex-row">
          {/* {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 items-center justify-center rounded-full bg-gray-200 pt-2 text-xs">
              <span className="text-gray-500">No Image</span>
            </div>
          )} */}
          <div className="ml-4 flex flex-col text-left">
            <h3 className="text-lg font-bold">{applicant.full_name}</h3>
            <p className="text-xs">
              <i>{applicant.email}</i>
            </p>
          </div>
        </div>
        <div className="mt-2 text-left">
          {numCaseStudies === 3 ? (
            <p className="text-xs text-green-500">
              {numCaseStudies} Cases: {caseActives.join(", ")}
            </p>
          ) : (
            <p className="text-xs text-red-500">
              {numCaseStudies} Cases: {caseActives.join(", ")}
            </p>
          )}
          {numInterviews === 3 ? (
            <p className="text-xs text-green-500">
              {numInterviews} IVs: {interviewActives.join(", ")}
            </p>
          ) : (
            <p className="text-xs text-red-500">
              {numInterviews} IVs: {interviewActives.join(", ")}
            </p>
          )}
        </div>
        <div className="mt-2">
          <span>Total Score: {total}</span>
        </div>
      </div>
    </button>
  );
};

export default ApplicantCard;
