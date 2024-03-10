import React from 'react';

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
}

interface ApplicantCardProps {
  applicant: Packet;
  onViewApplication: (applicationId: string) => void; // Add onViewApplication function prop
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onViewApplication,
}) => {
  return (
    <div className="bg-btn-background rounded-lg shadow-lg p-4 m-2 flex flex-col items-start">
      <h3 className="font-bold text-lg">{applicant.full_name}</h3>
      <p className="text-sm">{applicant.email}</p>
      {applicant.application && (
        <button
          // Ensure application ID is passed to onViewApplication; handle potential null value
          onClick={() =>
            applicant.application && onViewApplication(applicant.application)
          }
          className="mt-2 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-700 transition duration-300"
        >
          View Application
        </button>
      )}
    </div>
  );
};

export default ApplicantCard;
