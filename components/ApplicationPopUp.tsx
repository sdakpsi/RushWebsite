import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface Application {
  id: string;
  created_at: string;
  name: string;
  pronouns: string;
  phone_number: string;
  social_media: string | null;
  year: string;
  graduation_qtr: string;
  graduation_year: number;
  college: string;
  major: string;
  minors: string;
  gpa: number;
  classes: string;
  extracirriculars: string;
  accomplishment: string;
  why_akpsi: string;
  goals: string;
  comfort_zone: string;
  business: string;
  additional: string;
  resume: string;
  cover_letter: string;
  submitted: string;
  last_updated: string;
  user_id: string;
}

interface Case {
  id: string;
  prospect: string;
  active: string;
  leadership_score: number;
  leadership_comments: string;
  teamwork_score: number;
  teamwork_comments: string;
  analytical_score: number;
  analytical_comments: string;
  public_speaking_score: number;
  public_speaking_comments: string;
  role: string;
  thoughts: string;
  additional: string;
}

interface ApplicationPopupProps {
  application: Application;
  cases: Case[];
  onClose: () => void;
}

const ApplicationPopup: React.FC<ApplicationPopupProps> = ({
  application,
  cases,
  onClose,
}) => {
  const [viewDocument, setViewDocument] = useState<string | null>(null);

  const socialMedia = application.social_media ? application.social_media : {};

  const handleViewDocument = (documentUrl: string) => {
    setViewDocument(documentUrl);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-40">
        <div className="bg-btn-background rounded-lg shadow-lg p-8 max-w-6xl w-full space-y-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold">
              {application.name}'s Application
            </h2>
            <button
              onClick={onClose}
              className="text-lg bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>

          <div className="overflow-auto" style={{ maxHeight: '80vh' }}>
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Details */}
                <div>
                  <h3 className="font-semibold mb-2">Personal Details</h3>
                  <p>
                    <strong>Pronouns:</strong> {application.pronouns}
                  </p>
                  <p>
                    <strong>Phone Number:</strong> {application.phone_number}
                  </p>
                  {socialMedia && (
                    <div>
                      <strong>Social Media:</strong>
                      {Object.entries(socialMedia).map(([platform, handle]) => (
                        <p key={platform}>{`${
                          platform.charAt(0).toUpperCase() + platform.slice(1)
                        }: ${handle}`}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Academic Details */}
                <div>
                  <h3 className="font-semibold mb-2">Academic Details</h3>
                  <p>
                    <strong>Year:</strong> {application.year}
                  </p>
                  <p>
                    <strong>Graduation Year:</strong>{' '}
                    {application.graduation_year}
                  </p>
                  <p>
                    <strong>Graduation Quarter:</strong>{' '}
                    {application.graduation_qtr}
                  </p>
                  <p>
                    <strong>Major:</strong> {application.major}
                  </p>
                  {application.minors && (
                    <p>
                      <strong>Minors:</strong> {application.minors}
                    </p>
                  )}
                  <p>
                    <strong>GPA:</strong> {application.gpa}
                  </p>
                </div>
              </div>

              {/* Long Answers Section */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Additional Information</h3>
                <p>
                  <strong>Classes:</strong> {application.classes}
                </p>
                <p>
                  <strong>Extracurriculars:</strong>{' '}
                  {application.extracirriculars}
                </p>
                <p>
                  <strong>Accomplishment:</strong> {application.accomplishment}
                </p>
                <p>
                  <strong>Why AKPsi:</strong> {application.why_akpsi}
                </p>
                <p>
                  <strong>Goals:</strong> {application.goals}
                </p>
                <p>
                  <strong>Comfort Zone:</strong> {application.comfort_zone}
                </p>
                <p>
                  <strong>Business Idea:</strong> {application.business}
                </p>
                <p>
                  <strong>Additional Details:</strong> {application.additional}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Cases Evaluation</h3>
                {cases.map((caseItem) => (
                  <div key={caseItem.id} className="mb-4">
                    <h4 className="font-semibold">{caseItem.prospect}</h4>
                    <div className="ml-4">
                      <p>
                        Leadership Score: {caseItem.leadership_score} -{' '}
                        {caseItem.leadership_comments}
                      </p>
                      <p>
                        Teamwork Score: {caseItem.teamwork_score} -{' '}
                        {caseItem.teamwork_comments}
                      </p>
                      <p>
                        Analytical Score: {caseItem.analytical_score} -{' '}
                        {caseItem.analytical_comments}
                      </p>
                      <p>
                        Public Speaking Score: {caseItem.public_speaking_score}{' '}
                        - {caseItem.public_speaking_comments}
                      </p>
                      <p>Role: {caseItem.role}</p>
                      <p>Thoughts: {caseItem.thoughts}</p>
                      <p>Additional: {caseItem.additional}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Documents Section */}
              <div className="flex flex-row justify-around mt-6">
                <div>
                  <button
                    onClick={() => handleViewDocument(application.resume)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    View Resume
                  </button>
                  <a
                    href={application.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 mt-2"
                    aria-label="Open resume in new window"
                  >
                    🔗
                  </a>
                </div>
                <button
                  onClick={() => handleViewDocument(application.cover_letter)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  View Cover Letter
                </button>
                <a
                  href={application.cover_letter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 mt-2"
                  aria-label="Open cover letter in new window"
                >
                  🔗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {viewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative w-full max-w-3xl h-3/4 bg-white rounded-lg overflow-auto">
            <iframe src={viewDocument} className="w-full h-full"></iframe>
            <button
              onClick={() => setViewDocument(null)}
              className="absolute top-0 right-0 mt-2 mr-2 bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default ApplicationPopup;
