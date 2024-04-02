import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

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

export interface Interview {
  active_name: string;
  about_yourself: string;
  career_interests: string;
  instance_for_friend: string;
  failure_overcome: string;
  disagreement_handled: string;
  handling_criticism: string;
  learning_about: string;
  silly_question: string | null;
  questions_and_commitments: string;
  why_give_bid: string;
  most_influential: string;
  more_questions: string;
  other_actives: string;
  events_attended: string;
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
  interviews: Interview[];
  userID: string;
  onClose: () => void;
}

const ApplicationPopup: React.FC<ApplicationPopupProps> = ({
  application,
  cases,
  interviews,
  userID,
  onClose,
}) => {
  const [viewDocument, setViewDocument] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('application');
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  const handleViewDocument = (documentUrl: string) => {
    setViewDocument(documentUrl);
  };

  const toggleSection = (sectionName: string) => {
    if (activeSection === sectionName) {
      setActiveSection(null); // If the current section is already active, close it
    } else {
      setActiveSection(sectionName); // Otherwise, open the clicked section
    }
  };

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [error, setError] = useState('');

  const uploadImage = async (event) => {
    setUploading(true);
    setError('');
    try {
      const file = event.target.files[0];
      if (!file) {
        throw new Error('You must select an image to upload.');
      }

      // Only allow image file types for upload
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please select an image.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userID}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Correctly handle the retrieval of the public URL
      const { data, error: urlError } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlError) {
        throw urlError;
      }

      const { data: existingEntries, error: existingError } = await supabase
        .from('user_avatar')
        .select('id')
        .eq('user_id', userID);

      if (existingError) throw existingError;

      if (existingEntries && existingEntries.length > 0) {
        // Assuming the first entry is the correct one to update
        const existingId = existingEntries[0].id;
        const { error: updateError } = await supabase
          .from('user_avatar')
          .update({ avatar_url: data.publicUrl })
          .eq('id', existingId);

        if (updateError) throw updateError;
      } else {
        // Insert new entry
        const { error: insertError } = await supabase
          .from('user_avatar')
          .insert([{ user_id: userID, avatar_url: data.publicUrl }]);

        if (insertError) throw insertError;
      }

      setAvatarUrl(data.publicUrl);
    } catch (error) {
      console.error('Upload error:', error.message);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      try {
        const { data, error } = await supabase
          .from('user_avatar')
          .select('avatar_url')
          .eq('user_id', userID)
          .single();
        if (error) throw error;
        if (data) setAvatarUrl(data.avatar_url);
      } catch (error) {
        console.error('Error fetching avatar URL:', error.message);
      }
    };

    fetchAvatarUrl();
  }, [userID, supabase]);

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
      <div className="bg-btn-background rounded-lg shadow-xl p-6 w-full space-y-4 mx-4 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">
            {application.name}'s Packet
          </h2>

          <div className="relative inline-block">
            {/* Image display */}
            <button
              onClick={() => setActiveSection('avatar')}
              className="hover:scale-[1.04] transition duration-300"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </button>
          </div>

          <div>
            <button
              onClick={() => setActiveSection('application')}
              className={`px-4 py-3 ${
                activeSection === 'application'
                  ? 'text-blue-500 border-blue-500 border-b-2'
                  : 'text-gray-500 border-transparent'
              } font-semibold hover:text-blue-500 hover:border-blue-500 focus:outline-none`}
            >
              Application
            </button>
            <button
              onClick={() => setActiveSection('cases')}
              className={`px-4 py-3 ml-2 ${
                activeSection === 'cases'
                  ? 'text-blue-500 border-blue-500 border-b-2'
                  : 'text-gray-500 border-transparent'
              } font-semibold hover:text-blue-500 hover:border-blue-500 focus:outline-none`}
            >
              Case Study Notes
            </button>
            <button
              onClick={() => setActiveSection('interviews')}
              className={`px-4 py-3 ml-2 ${
                activeSection === 'interviews'
                  ? 'text-blue-500 border-blue-500 border-b-2'
                  : 'text-gray-500 border-transparent'
              } font-semibold hover:text-blue-500 hover:border-blue-500 focus:outline-none`}
            >
              Interview Notes
            </button>
          </div>
          <div>
            <button
              onClick={() => handleViewDocument(application.resume)}
              className="px-4 py-2 ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold rounded"
            >
              Resume
            </button>
            <button
              onClick={() => handleViewDocument(application.cover_letter)}
              className="px-4 py-2 ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold rounded"
            >
              Cover Letter
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 ml-2 bg-red-500 hover:bg-red-800 text-white font-bold rounded"
            >
              Close
            </button>
          </div>
        </div>

        <div className="overflow-auto" style={{ maxHeight: '80vh' }}>
          <div className="space-y-4">
            {activeSection === 'application' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Personal Details
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-200">
                      <li>
                        <span className="font-semibold">Pronouns:</span>{' '}
                        {application.pronouns}
                      </li>
                      <li>
                        <span className="font-semibold">Phone Number:</span>{' '}
                        {application.phone_number}
                      </li>
                      <li>
                        <span className="font-semibold">Social Media:</span>
                        {application.social_media ? (
                          <ul className="list-inside">
                            {Object.entries(application.social_media).map(
                              ([platform, answer], index) => (
                                <li key={index}>
                                  {platform.charAt(0).toUpperCase() +
                                    platform.slice(1)}
                                  : <span>{answer}</span>
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          'N/A'
                        )}
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gray-700 p-6 rounded-xl shadow-lg ">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Academic Details
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-200">
                      <li>
                        <span className="font-semibold">Year:</span>{' '}
                        {application.year}
                      </li>
                      <li>
                        <span className="font-semibold">Graduation Year:</span>{' '}
                        {application.graduation_year}
                      </li>
                      <li>
                        <span className="font-semibold">
                          Graduation Quarter:
                        </span>{' '}
                        {application.graduation_qtr}
                      </li>
                      <li>
                        <span className="font-semibold">Major:</span>{' '}
                        {application.major}
                      </li>
                      {application.minors && (
                        <li>
                          <span className="font-semibold">Minors:</span>{' '}
                          {application.minors}
                        </li>
                      )}
                      <li>
                        <span className="font-semibold">GPA:</span>{' '}
                        {application.gpa}
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-700 p-6 rounded-xl shadow-lg ">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Long Response
                  </h3>
                  <div className="list-disc pl-5 space-y-2 text-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="font-semibold text-xl text-center mb-2">
                        Classes
                      </div>
                      <div>{application.classes}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-xl text-center mb-2">
                        Extracurriculars
                      </div>
                      <div className="">{application.extracirriculars}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-xl text-center mb-2">
                        Accomplishment
                      </div>
                      <div className="">{application.accomplishment}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-xl text-center mb-2">
                        Why AKPsi
                      </div>
                      <div className="">{application.why_akpsi}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-xl text-center mb-2">
                        Goals
                      </div>
                      <div className="">{application.goals}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-xl text-center mb-2">
                        Comfort Zone
                      </div>
                      <div className="">{application.comfort_zone}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-xl text-center mb-2">
                        Business Idea
                      </div>
                      <div className="">{application.business}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-xl text-center mb-2">
                        Additional Details
                      </div>
                      <div className="">{application.additional}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cases Evaluation Section */}
            {activeSection === 'cases' && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Cases Evaluation</h3>
                {/* Assuming all cases have the same structure, iterate over the keys of the first case to create a layout */}
                {cases.length > 0 &&
                  Object.keys(cases[0])
                    .filter(
                      (key) => !['id', 'prospect', 'active'].includes(key)
                    ) // Adjust as needed to exclude irrelevant keys
                    .map((attribute) => (
                      <div
                        key={attribute}
                        className="mb-2 grid grid-cols-1 md:grid-cols-4 p-2 gap-6 bg-gray-600 rounded"
                      >
                        <div className="font-semibold text-white col-span-1">
                          {attribute
                            .split('_')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(' ')}
                          :
                        </div>
                        {/* Display each case's attribute next to the type */}
                        {cases.map((caseItem, index) => (
                          <div key={index} className="md:col-span-1 text-white">
                            {/* Check if the attribute needs special formatting or handling */}
                            {typeof caseItem[attribute as keyof Case] ===
                            'number'
                              ? caseItem[attribute as keyof Case]
                              : caseItem[attribute as keyof Case]}
                          </div>
                        ))}
                      </div>
                    ))}
              </div>
            )}

            {/* Interview Responses Section */}
            {activeSection === 'interviews' && (
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Interview Responses
                </h3>
                {/* Create an array of unique keys/questions from the first interview (assuming all interviews have the same keys) */}
                {interviews.length > 0 &&
                  Object.keys(interviews[0])
                    .filter(
                      (key) => !['id', 'prospect_id', 'active_id'].includes(key)
                    )
                    .map((question) => (
                      <div
                        key={question}
                        className="mb-2 grid grid-cols-1 md:grid-cols-4 p-2 gap-6 bg-gray-700 rounded"
                      >
                        {/* Display the question */}
                        <div className="font-semibold items-center ml-2 justify-center col-span-1">
                          {question
                            .split('_')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(' ')}
                          :
                        </div>
                        {/* Display each interview's response next to the question */}
                        {interviews.map((interview, index) => (
                          <div key={index} className="md:col-span-1">
                            {interview[question as keyof Interview]}
                          </div>
                        ))}
                      </div>
                    ))}
              </div>
            )}

            {activeSection === 'avatar' && (
              <div className="flex items-center justify-center gap-8">
                <div className="flex text-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="inline-block max-h-96 w-auto object-cover"
                      style={{ maxHeight: '70vh' }}
                    />
                  ) : (
                    <div
                      className="inline-block max-h-96 w-full bg-gray-200 flex items-center justify-center"
                      style={{ maxHeight: '70vh', width: 'auto' }}
                    >
                      <span className="text-lg">No Image</span>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="avatar-upload"
                    className="inline-block text-white bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded cursor-pointer"
                  >
                    Upload New Image
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={uploadImage}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading && <p className="mt-2">Uploading...</p>}
                  {error && <p className="mt-2 text-red-500">{error}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document View Modal */}
      {viewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-lg w-full max-w-4xl h-3/4 overflow-auto">
            <iframe src={viewDocument} className="w-full h-full"></iframe>
            <button
              onClick={() => setViewDocument(null)}
              className="absolute top-0 right-0 mt-4 mr-4 text-lg bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default ApplicationPopup;
