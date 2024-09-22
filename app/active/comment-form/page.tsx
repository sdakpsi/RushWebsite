'use client';
import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ActiveCaseStudyForm from '@/components/ActiveCaseStudyForm';
import InterviewSearchBar from '@/components/InterviewSearchBar';
import ActiveLoginComponent from '@/components/ActiveLoginComponent';
import { useActiveStatus } from '@/hooks/useCheckActive';
import { useSelectedProspect } from '@/hooks/useSelectedProspect';
import { useFormAnimation } from '@/hooks/useFormAnimation';

// mirror implementation of interview page

export default function ProtectedPage() {
  const { isActive, isLoading } = useActiveStatus();
  const {
    selectedProspect,
    setSelectedProspect,
    isSubmitting,
    setIsSubmitting,
  } = useSelectedProspect();
  const { showingForm, setShowingForm, animationClass, animationKey } =
    useFormAnimation();

  if (isLoading || isSubmitting) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full flex justify-center items-center">
      <div className="animate-in opacity-0 max-w-4xl w-full">
        {isActive ? (
          <div className="container mx-auto px-4 pt-6">
            {showingForm && selectedProspect ? (
              <div
                key={animationKey}
                className={`animate-in ${animationClass}`}
              >
                <ActiveCaseStudyForm
                  selectedProspect={selectedProspect}
                  setSelectedProspect={setSelectedProspect}
                  setShowingForm={setShowingForm}
                  setIsSubmitting={setIsSubmitting}
                />
              </div>
            ) : (
              <div className="flex flex-col space-y-6">
                <h1 className="text-2xl md:text-5xl font-semibold text-center mt-10">
                  Case Study Portal
                </h1>
                <p className="text-md md:text-2xl text-center">
                  Currently selected: {selectedProspect?.full_name || 'None'} (
                  {selectedProspect?.email || 'None'})
                </p>
                {selectedProspect && (
                  <button
                    className="self-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setShowingForm(true)}
                  >
                    Prospect Comment Form
                  </button>
                )}
                <InterviewSearchBar
                  selectedProspect={selectedProspect}
                  setSelectedProspect={setSelectedProspect}
                />
              </div>
            )}
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
