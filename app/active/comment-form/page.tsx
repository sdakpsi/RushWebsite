'use client';
import React, { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import InterviewSearchBar from '@/components/InterviewSearchBar';
import ActiveLoginComponent from '@/components/ActiveLoginComponent';
import { useActiveStatus } from '@/hooks/useCheckActive';
import customToast from '@/components/CustomToast';
import { createClient } from '@/utils/supabase/client';

// Mirror implementation of interview page

import { ProspectInterview } from '@/lib/types';

function useSelectedProspect() {
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectInterview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return {
    selectedProspect,
    setSelectedProspect,
    isSubmitting,
    setIsSubmitting,
  };
}

export default function Page() {
  const { isActive, isLoading } = useActiveStatus();
  const {
    selectedProspect,
    setSelectedProspect,
    isSubmitting,
    setIsSubmitting,
  } = useSelectedProspect();

  const [comment, setComment] = useState('');
  const [interaction, setInteraction] = useState('');
  const [invite, setInvite] = useState('');
  const supabase = createClient();

  const submitComment = async () => {
    if (!selectedProspect) {
      customToast('Please select a prospect before submitting.', 'error');
      return;
    }

    if (interaction === '' || invite === '' || comment === '') {
      customToast('All fields are required.', 'error');
      return;
    }

    const wordCount = comment.trim().split(/\s+/).length;
    if (wordCount < 5) {
      customToast('Comment must be at least 5 words long.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase.from('comments').insert([
        {
          prospect_id: selectedProspect.id,
          prospect_name: selectedProspect.full_name,
          active_id: user?.id,
          active_name: user?.user_metadata.name,
          comment: comment,
          interaction: interaction, // Storing interaction result
          invite: invite, // Storing invite response
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      customToast(
        `Submitted comment for ${selectedProspect.full_name}: ${comment}`,
        'success'
      );
      setComment('');
      setInteraction('');
      setInvite('');
      setSelectedProspect(null);
    } catch (error: any) {
      customToast(`Error submitting comment: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full flex justify-center items-center">
      <div className="animate-in opacity-0 max-w-4xl w-full">
        {isActive ? (
          <div className="container mx-auto px-4 pt-6">
            <div className="flex flex-col space-y-6">
              <h1 className="text-2xl md:text-5xl font-semibold text-center mt-10">
                Prospect Comment Form
              </h1>
              <InterviewSearchBar
                selectedProspect={selectedProspect}
                setSelectedProspect={setSelectedProspect}
              />
              <p className="text-md md:text-2xl text-left">
                Selected Prospect: {selectedProspect?.full_name || 'None'} -{' '}
                {selectedProspect?.email || 'None'}
              </p>

              {/* Comment Input */}
              {selectedProspect && (
                <div className="flex flex-col">
                  {/* Interaction Question */}
                  <div className="flex flex-col">
                    <label className="text-gray-200 mb-2">
                      How was the interaction?
                    </label>
                    <div className="flex space-x-4 text-white">
                      <button
                        className={`px-4 py-2 rounded ${interaction === 'Good' ? 'bg-blue-700' : 'bg-gray-900'}`}
                        onClick={() => setInteraction('Good')}
                      >
                        Good
                      </button>
                      <button
                        className={`px-4 py-2 rounded ${interaction === 'Neutral' ? 'bg-blue-700' : 'bg-gray-900'}`}
                        onClick={() => setInteraction('Neutral')}
                      >
                        Neutral
                      </button>
                      <button
                        className={`px-4 py-2 rounded ${interaction === 'Bad' ? 'bg-blue-700' : 'bg-gray-900'}`}
                        onClick={() => setInteraction('Bad')}
                      >
                        Bad
                      </button>
                    </div>
                  </div>

                  {/* Invite to Social Night Question */}
                  <div className="flex flex-col text-white">
                    <label className="mt-4 text-gray-200 mb-2">
                      Invite to social night?
                    </label>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-2 rounded ${invite === 'Yes' ? 'bg-blue-700' : 'bg-gray-900'}`}
                        onClick={() => setInvite('Yes')}
                      >
                        Yes
                      </button>
                      <button
                        className={`px-4 py-2 rounded ${invite === 'No' ? 'bg-blue-700' : 'bg-gray-900'}`}
                        onClick={() => setInvite('No')}
                      >
                        No
                      </button>
                    </div>
                  </div>
                  <label className="text-gray-200 mt-4 mb-2">
                    Explain the interaction (minimum 5 words):
                  </label>
                  <textarea
                    className="border rounded p-2 text-gray-700"
                    placeholder="Be detailed, this will be used in delibs!"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    className="self-center mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    onClick={submitComment}
                  >
                    Submit Comment
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex mt-8 justify-center items-center">
            <ActiveLoginComponent />
          </div>
        )}
      </div>
    </div>
  );
}
