import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { Toast } from 'react-toastify/dist/components';

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
  other_actives: string;
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
  events_attended: string;
  empathy: number;
  open_minded: number;
  pledgeable: number;
  motivated: number;
  socially_aware: number;
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

interface Comment {
  active_name: string;
  comment: string;
}

interface ApplicationPopupProps {
  application: Application;
  cases: Case[];
  interviews: Interview[];
  userID: string;
  isPIC: boolean;
  onClose: () => void;
}

const ApplicationPopup: React.FC<ApplicationPopupProps> = ({
  application,
  cases,
  interviews,
  userID,
  isPIC,
  onClose,
}) => {
  const [viewDocument, setViewDocument] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('application');
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [score, setScore] = useState('');
  const [currentScore, setCurrentScore] = useState('');

  const [scoreResume, setScoreResume] = useState('');
  const [activeName, setActiveName] = useState('');
  const [comment, setComment] = useState('');
  const [prospectComments, setProspectComments] = useState<Comment[]>([]);
  const [submissionCount, setSubmissionCount] = useState(0);

  const [currentScoreResume, setCurrentScoreResume] = useState(''); // State to store the current score fetched from the database

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('active_name, comment')
          .eq('prospect_id', userID);

        if (error) {
          throw error;
        }

        if (data) {
          setProspectComments(data);
        }
      } catch (error: any) {
        console.error('Error fetching comments:', error.message);
      }
    };

    fetchComments();
  }, [submissionCount]);

  const handleViewDocument = (documentUrl: string) => {
    setViewDocument(documentUrl);
  };

  const toggleSection = (sectionName: string) => {
    if (activeSection === sectionName) {
      setActiveSection(activeSection); // If the current section is already active, close it
    } else {
      setActiveSection(sectionName); // Otherwise, open the clicked section
    }
  };

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const [ivAverages, setIvAverages] = useState({
    empathy: 0,
    open_minded: 0,
    pledgeable: 0,
    motivated: 0,
    socially_aware: 0,
    events_attended: 0,
  });

  const [averages, setAverages] = useState({
    leadership_avg: 0,
    teamwork_avg: 0,
    analytical_avg: 0,
    public_speaking_avg: 0,
  });
  useEffect(() => {
    setIvAverages(calculateIvAverages(interviews));
  }, [interviews]);

  const calculateIvAverages = (interviews: Interview[]) => {
    const totalScores = interviews.reduce(
      (acc, curr) => {
        const eventsCount = curr.events_attended
          ? curr.events_attended.split(',').length
          : 0;
        return {
          empathy: acc.empathy + curr.empathy,
          open_minded: acc.open_minded + curr.open_minded,
          pledgeable: acc.pledgeable + curr.pledgeable,
          motivated: acc.motivated + curr.motivated,
          socially_aware: acc.socially_aware + curr.socially_aware,
          events_attended: acc.events_attended + eventsCount,
        };
      },
      {
        empathy: 0,
        open_minded: 0,
        pledgeable: 0,
        motivated: 0,
        socially_aware: 0,
        events_attended: 0,
      }
    );

    const averages = {
      empathy: totalScores.empathy / interviews.length,
      open_minded: totalScores.open_minded / interviews.length,
      pledgeable: totalScores.pledgeable / interviews.length,
      motivated: totalScores.motivated / interviews.length,
      socially_aware: totalScores.socially_aware / interviews.length,
      events_attended: Math.ceil(
        totalScores.events_attended / interviews.length
      ),
    };

    return averages;
  };

  useEffect(() => {
    setAverages(calculateAverages(cases));
  }, [cases]);

  const calculateAverages = (cases: Case[]) => {
    const totalScores = cases.reduce(
      (acc, curr) => ({
        leadership_score: acc.leadership_score + curr.leadership_score,
        teamwork_score: acc.teamwork_score + curr.teamwork_score,
        analytical_score: acc.analytical_score + curr.analytical_score,
        public_speaking_score:
          acc.public_speaking_score + curr.public_speaking_score,
      }),
      {
        leadership_score: 0,
        teamwork_score: 0,
        analytical_score: 0,
        public_speaking_score: 0,
      }
    );

    const averages = {
      leadership_avg: totalScores.leadership_score / cases.length,
      teamwork_avg: totalScores.teamwork_score / cases.length,
      analytical_avg: totalScores.analytical_score / cases.length,
      public_speaking_avg: totalScores.public_speaking_score / cases.length,
    };

    return averages;
  };

  const handleScoreChange = (e: any) => {
    const value = e.target.value;
    const numValue = Number(value);
    if (value === '' || (numValue >= 1 && numValue <= 10)) {
      setScore(value);
    }
  };

  useEffect(() => {
    const fetchCurrentScore = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('app_score')
        .eq('id', userID)
        .single();

      if (error) {
        console.error('Error fetching current score:', error.message);
      } else if (data) {
        setCurrentScore(data.app_score); // Update state with the fetched score
      }
    };

    if (userID) {
      fetchCurrentScore();
    }
  }, [userID]);

  const handleScoreChangeResume = (e: any) => {
    const value = e.target.value;
    const numValue = Number(value);
    if (value === '' || (numValue >= 1 && numValue <= 10)) {
      setScoreResume(value);
    }
  };

  const handleActiveName = (e: any) => {
    const value = e.target.value;
    setActiveName(value);
  };

  const handleComment = (e: any) => {
    const value = e.target.value;
    setComment(value);
  };

  useEffect(() => {
    const fetchCurrentScoreResume = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('resume_score')
        .eq('id', userID)
        .single();

      if (error) {
        console.error('Error fetching current score:', error.message);
      } else if (data) {
        setCurrentScoreResume(data.resume_score); // Update state with the fetched score
      }
    };

    if (userID) {
      fetchCurrentScoreResume();
    }
  }, [userID]);

  const handleSubmit = async () => {
    if (score === '') {
      toast.error('Please enter a score before submitting.');
      return;
    }

    setCurrentScore(score);

    const { data, error } = await supabase
      .from('users')
      .update({ app_score: score })
      .eq('id', userID);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success('Score updated successfully!');
      setScore(''); // Optionally reset the score input after successful submission
    }
  };

  const handleSubmitResume = async () => {
    if (scoreResume === '') {
      alert('Please enter a score before submitting.');
      return;
    }

    setCurrentScoreResume(scoreResume);

    const { data, error } = await supabase
      .from('users')
      .update({ resume_score: scoreResume })
      .eq('id', userID);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert('Score updated successfully!');
      setScoreResume(''); // Optionally reset the score input after successful submission
    }
  };

  const handleCommentSubmit = async () => {
    if (activeName === '' || comment === '') {
      toast.error('Please enter a name and comment before submitting.');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('comments').insert([
      {
        prospect_id: userID,
        active_id: user?.id,
        active_name: activeName,
        comment: comment,
      },
    ]);

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success('Comment submitted.');
      setSubmissionCount((count) => count + 1);
      setActiveName(''); // Optionally reset the score input after successful submission
      setComment('');
    }
  };

  const uploadImage = async (event: any) => {
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
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

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
    } catch (error: any) {
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
      } catch (error: any) {
        console.error('Error fetching avatar URL:', error.message);
      }
    };

    fetchAvatarUrl();
  }, [userID, supabase]);

  const scoreComponents = useMemo(() => {
    const pledgeFactor = Number((ivAverages.pledgeable / 5).toFixed(2)) * 15;
    const professionalFactor =
      Number((ivAverages.open_minded / 5).toFixed(2)) * 10;
    const curious = Number((ivAverages.motivated / 5).toFixed(2)) * 7;
    const events = Number(ivAverages.events_attended - 2);
    const resumeScore =
      Number((parseInt(currentScoreResume) / 8).toFixed(2)) * 14;
    const coverLetterScore = application.cover_letter ? 1 : 0;
    const applicationScore =
      Number((parseInt(currentScore) / 8).toFixed(2)) * 25;
    const teamworkScore = Number((averages.teamwork_avg / 5).toFixed(2)) * 10;
    const leadershipScore =
      Number((averages.leadership_avg / 5).toFixed(2)) * 10;
    const analyticalScore =
      Number((averages.analytical_avg / 5).toFixed(2)) * 5;

    const totalScore =
      pledgeFactor +
      professionalFactor +
      curious +
      events +
      resumeScore +
      coverLetterScore +
      applicationScore +
      teamworkScore +
      leadershipScore +
      analyticalScore;

    return {
      totalScore,
      components: {
        pledgeFactor: { score: pledgeFactor, outOf: 15 },
        professionalFactor: { score: professionalFactor, outOf: 10 },
        curious: { score: curious, outOf: 7 },
        events: { score: events, outOf: 3 },
        resumeScore: { score: resumeScore, outOf: 14 },
        coverLetterScore: { score: coverLetterScore, outOf: 1 },
        applicationScore: { score: applicationScore, outOf: 25 },
        teamworkScore: { score: teamworkScore, outOf: 10 },
        leadershipScore: { score: leadershipScore, outOf: 10 },
        analyticalScore: { score: analyticalScore, outOf: 5 },
      },
    };
  }, [
    ivAverages,
    averages,
    currentScore,
    currentScoreResume,
    application.cover_letter,
  ]);

  useEffect(() => {
    const updateTot = async () => {
      if (scoreComponents.totalScore > 0) {
        const { data, error } = await supabase
          .from('users')
          .update({ total_score: scoreComponents.totalScore })
          .eq('id', userID);

        if (error) {
          alert(`Error: ${error.message}`);
        }
        if (isPIC) {
          toast.success('Total Score Updated');
        }
      }
    };
    updateTot();
  }, [scoreComponents.totalScore]);

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
              Case Study
            </button>
            <button
              onClick={() => setActiveSection('interviews')}
              className={`px-4 py-3 ml-2 ${
                activeSection === 'interviews'
                  ? 'text-blue-500 border-blue-500 border-b-2'
                  : 'text-gray-500 border-transparent'
              } font-semibold hover:text-blue-500 hover:border-blue-500 focus:outline-none`}
            >
              Interview
            </button>
            <button
              onClick={() => setActiveSection('comments')}
              className={`px-4 py-3 ml-2 ${
                activeSection === 'comments'
                  ? 'text-blue-500 border-blue-500 border-b-2'
                  : 'text-gray-500 border-transparent'
              } font-semibold hover:text-blue-500 hover:border-blue-500 focus:outline-none`}
            >
              Comments
            </button>
            {isPIC && (
              <button
                onClick={() => setActiveSection('scoring')}
                className={`px-4 py-3 ml-2 ${
                  activeSection === 'comments'
                    ? 'text-blue-500 border-blue-500 border-b-2'
                    : 'text-gray-500 border-transparent'
                } font-semibold hover:text-blue-500 hover:border-blue-500 focus:outline-none`}
              >
                Scoring
              </button>
            )}
          </div>
          <div>
            <button
              onClick={() => handleViewDocument(application.resume)}
              className={
                application.resume
                  ? 'px-4 py-2 ml-2 bg-green-500 hover:bg-green-700 text-white font-bold rounded'
                  : 'px-4 py-2 ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold rounded'
              }
            >
              Resume
            </button>

            <button
              onClick={() => handleViewDocument(application.cover_letter)}
              className={
                application.cover_letter
                  ? 'px-4 py-2 ml-2 bg-green-500 hover:bg-green-700 text-white font-bold rounded'
                  : 'px-4 py-2 ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold rounded'
              }
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="bg-gray-700 p-6 rounded-xl shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Scoring
                    </h3>
                    <div>
                      <p>type shiiiittt lmaooooooo</p>
                    </div>
                    {/* <ul className="list-disc pl-5 space-y-2 text-gray-200">
                      <li>
                        <span className="font-semibold">Case Study:</span>{' '}
                        {Object.values(averages)
                          .reduce((acc, cur) => acc + cur, 0)
                          .toFixed(2)}
                      </li>
                      <li>
                        <span className="font-semibold">Interview:</span>{' '}
                        {Object.values(ivAverages)
                          .reduce((acc, cur) => acc + cur, 0)
                          .toFixed(2)}
                      </li>
                      <li>
                        <span className="font-semibold">
                          Application Score:
                        </span>{' '}
                        <span>
                          {currentScore !== '' ? currentScore : 'not set'}
                        </span>
                        {isPIC ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              inputMode="numeric" // Helps bring up numeric keypad on mobile devices
                              pattern="[1-7]|8" // Ensures only numbers between 1 and 10 are accepted
                              className="input mt-1 p-1 rounded text-xs text-black"
                              placeholder="Enter a score (1-8)"
                              value={score}
                              onChange={handleScoreChange}
                            />
                            <button
                              onClick={handleSubmit}
                              className="bg-blue-500 hover:bg-blue-700 text-xs text-white font-bold mt-1 py-1 px-2 rounded"
                            >
                              Submit
                            </button>
                          </div>
                        ) : (
                          <></>
                        )}
                      </li>
                      <li>
                        <span className="font-semibold">Resume Score:</span>{' '}
                        <span>
                          {currentScoreResume !== ''
                            ? currentScoreResume
                            : 'not set'}
                        </span>
                        {isPIC ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              inputMode="numeric" // Helps bring up numeric keypad on mobile devices
                              pattern="[1-7]|8" // Ensures only numbers between 1 and 10 are accepted
                              className="input mt-1 p-1 rounded text-xs text-black"
                              placeholder="Enter a score (1-8)"
                              value={scoreResume}
                              onChange={handleScoreChangeResume}
                            />
                            <button
                              onClick={handleSubmitResume}
                              className="bg-blue-500 hover:bg-blue-700 text-xs text-white font-bold mt-1 py-1 px-2 rounded"
                            >
                              Submit
                            </button>
                          </div>
                        ) : (
                          <></>
                        )}
                      </li>
                      <li>
                        <span className="font-semibold">
                          Total Score: {scoreComponents.totalScore.toFixed(2)}
                        </span>
                      </li>
                    </ul> */}
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
                <h3 className="font-semibold text-lg mb-2">Case Study Notes</h3>
                <div className="flex justify-center items-center gap-4 flex-wrap mt-2 mb-4">
                  <div className="p-4 rounded-lg shadow-md bg-gray-600 text-center">
                    <span className="mb-2 font-semibold text-lg">
                      Leadership:{' '}
                    </span>
                    <span className="text-md font-bold">
                      {/* {averages.leadership_avg.toFixed(2)} */}
                      t
                    </span>
                  </div>
                  <div className="p-4 rounded-lg shadow-md bg-gray-600 text-center">
                    <span className="mb-2 font-semibold text-lg">
                      Teamwork:{' '}
                    </span>
                    <span className="text-md font-bold">
                      {/* {averages.teamwork_avg.toFixed(2)} */}
                      y
                    </span>
                  </div>
                  <div className="p-4 rounded-lg shadow-md bg-gray-600 text-center">
                    <span className="mb-2 font-semibold text-lg">
                      Analytical:{' '}
                    </span>
                    <span className="text-md font-bold">
                      {/* {averages.analytical_avg.toFixed(2)} */}
                      p
                    </span>
                  </div>
                  <div className="p-4 rounded-lg shadow-md bg-gray-600 text-center">
                    <span className="mb-2 font-semibold text-lg">
                      Public Speaking:{' '}
                    </span>
                    <span className="text-md font-bold">
                      {/* {averages.public_speaking_avg.toFixed(2)} */}
                      e
                    </span>
                  </div>
                </div>
                {/* Assuming all cases have the same structure, iterate over the keys of the first case to create a layout */}
                {cases.length > 0 &&
                  Object.keys(cases[0])
                    .filter((key) => ['active_name'].includes(key)) // Adjust as needed to exclude irrelevant keys
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
                {cases.length > 0 &&
                  Object.keys(cases[0])
                    .filter((key) => ['other_actives'].includes(key)) // Adjust as needed to exclude irrelevant keys
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
                {cases.length > 0 &&
                  Object.keys(cases[0])
                    .filter(
                      (key) =>
                        ![
                          'id',
                          'prospect',
                          'active',
                          'active_name',
                          'other_actives',
                        ].includes(key)
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
                <h3 className="font-semibold text-lg mb-2">Interview Notes</h3>
                <div className="flex justify-center items-center gap-4 flex-wrap mt-2 mb-4">
                  {Object.entries(ivAverages).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-4 rounded-lg shadow-md bg-gray-600 text-center"
                    >
                      <span className="mb-2 font-semibold text-lg capitalize">
                        {key}:{' '}
                      </span>
                      <span className="text-md font-bold">
                        {/* {isNaN(value) ? 'N/A' : value.toFixed(2)} */}
                        type shitttt
                      </span>
                    </div>
                  ))}
                </div>
                {/* Create an array of unique keys/questions from the first interview (assuming all interviews have the same keys) */}
                {interviews.length > 0 && (
                  <>
                    {/* Manually render active_name and other_actives first if they exist */}
                    {['active_name', 'other_actives'].map((key) => (
                      <div
                        key={key}
                        className="mb-2 grid grid-cols-1 md:grid-cols-4 p-2 gap-6 bg-gray-700 rounded"
                      >
                        <div className="font-semibold items-center ml-2 justify-center col-span-1">
                          {key
                            .split('_')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(' ')}
                          :
                        </div>
                        {interviews.map((interview, index) => (
                          <div key={index} className="md:col-span-1">
                            {interview[key as keyof Interview]}
                          </div>
                        ))}
                      </div>
                    ))}
                    {/* Dynamically render the rest of the keys excluding active_name and other_actives */}
                    {Object.keys(interviews[0])
                      .filter(
                        (key) =>
                          ![
                            'id',
                            'prospect_id',
                            'active_id',
                            'active_name',
                            'other_actives',
                          ].includes(key)
                      )
                      .map((question) => (
                        <div
                          key={question}
                          className="mb-2 grid grid-cols-1 md:grid-cols-4 p-2 gap-6 bg-gray-700 rounded"
                        >
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
                          {interviews.map((interview, index) => (
                            <div key={index} className="md:col-span-1">
                              {interview[question as keyof Interview]}
                            </div>
                          ))}
                        </div>
                      ))}
                  </>
                )}
              </div>
            )}

            {activeSection === 'comments' && (
              <div className="">
                <h3 className="font-semibold text-xl mb-2">
                  Prospect Comments
                </h3>
                {isPIC ? (
                  <>
                    <h3 className="font-semibold text-lg mb-2">
                      Comment Input
                    </h3>
                    <div className="flex gap-4 flex-wrap mt-2 mb-4">
                      <div className="flex items-center">
                        <input
                          type="text"
                          className="input mt-1 py-1 px-2 mr-2 rounded text-lg text-black"
                          placeholder="Active name"
                          value={activeName}
                          onChange={handleActiveName}
                        />{' '}
                        <div className="w-full">
                          <input
                            type="text"
                            className="input mt-1 py-1 px-2 mr-2 rounded text-lg text-black"
                            placeholder="Prospect comment"
                            value={comment}
                            onChange={handleComment}
                          />
                        </div>
                        <button
                          onClick={handleCommentSubmit}
                          className="bg-blue-500 hover:bg-blue-700 text-lg text-white font-bold mt-1 py-1 px-2 rounded"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <></>
                )}
                <div className="">
                  <h3 className="font-semibold text-lg mb-2">Comments</h3>
                  <ul>
                    {prospectComments.map((comment, index) => (
                      <li key={index} className="mt-4 text-lg text-white">
                        <span className="font-bold bg-gray-700 rounded p-2">
                          {comment.active_name}:
                        </span>
                        <span className="font-regular ml-2 bg-gray-700 rounded p-2">
                          {comment.comment}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {activeSection === 'scoring' && (
              <div>
              <h3 className="font-semibold text-xl mb-2">Prospect Scoring</h3>
              <div>
                <h4 className="font-semibold text-lg">Score Components</h4>
                <ul>
                  {Object.entries(scoreComponents.components).map(([key, { score, outOf }]) => (
                    <li key={key}>{`${key}: ${score.toFixed(2)} / ${outOf}`}</li>
                  ))}
                </ul>
                {/* <p>Total Score: {scoreComponents.totalScore.toFixed(2)}</p> */}
              </div>
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
                {isPIC ? (
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
                ) : (
                  <></>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document View Modal */}
      {viewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative bg-white rounded-lg w-full max-w-4xl h-3/4 overflow-auto">
            {viewDocument.endsWith('.doc') || viewDocument.endsWith('.docx') ? (
              // Render this iframe if viewDocument ends with .doc or .docx
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${viewDocument}`}
                className="w-full h-full"
              ></iframe>
            ) : (
              // Render this iframe if it does not end with .doc or .docx
              <iframe src={viewDocument} className="w-full h-full"></iframe>
            )}
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
