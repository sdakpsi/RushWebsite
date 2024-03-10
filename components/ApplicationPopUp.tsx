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

interface ApplicationPopupProps {
  application: Application;
  onClose: () => void;
}

const ApplicationPopup: React.FC<ApplicationPopupProps> = ({
  application,
  onClose,
}) => {
  const [viewDocument, setViewDocument] = useState<string | null>(null);

  const socialMedia = application.social_media || null;

  const handleViewDocument = (documentUrl: string) => {
    setViewDocument(documentUrl);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-50">
      <div className="bg-btn-background rounded-lg shadow-xl max-w-2xl w-full space-y-6 overflow-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {application.name}'s Application
          </h2>
          <div className="border-b-2 border-gray-200 mb-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Use divs for each piece of information for better control over styling */}
          {Object.entries(application).map(([key, value]) => {
            if (
              key === 'resume' ||
              key === 'cover_letter' ||
              key === 'social_media'
            )
              return null; // Handle separately
            return (
              <div key={key} className="flex flex-col">
                <span className="font-medium capitalize">
                  {key.replace(/_/g, ' ')}:
                </span>
                <span>{value || 'N/A'}</span>
              </div>
            );
          })}
          {socialMedia && (
            <div className="col-span-2">
              <h3 className="font-semibold">Social Media:</h3>
              {Object.entries(socialMedia).map(([platform, handle]) => (
                <p
                  key={platform}
                  className=""
                >{`${platform}: ${handle}`}</p>
              ))}
            </div>
          )}
          <div className="md:col-span-2 flex justify-around mt-4">
            <button
              onClick={() => handleViewDocument(application.resume)}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition duration-300"
            >
              View Resume
            </button>
            <button
              onClick={() => handleViewDocument(application.cover_letter)}
              className="px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white transition duration-300"
            >
              View Cover Letter
            </button>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-800 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {viewDocument &&
        createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4 z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-full md:h-auto overflow-auto">
              <iframe
                src={viewDocument}
                className="w-full h-full"
                title="Document"
              ></iframe>
              <button
                onClick={() => setViewDocument(null)}
                className="absolute top-0 right-0 mt-4 mr-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-800 transition duration-300"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>,
    document.body
  );
};

export default ApplicationPopup;
