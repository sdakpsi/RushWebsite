"use client";
import React, { useEffect, useState } from 'react';
import ActiveLoginComponent from '@/components/ActiveLoginComponent';
import { getIsActive } from '@/app/supabase/getUsers';
import { ProspectInterview } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ActiveInterviewForm from '@/components/ActiveInterviewForm';
import InterviewSearchBar from '@/components/InterviewSearchBar';
import ActiveCaseStudyForm from '@/components/ActiveCaseStudyForm';


// highkey this should be code reused from interview page but im too lazy to refactor

export default function ProtectedPage() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [animationClass, setAnimationClass] = useState('');
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectInterview | null>(null);
    const [showingForm, setShowingForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkActive = async () => {
      const isUserActive = await getIsActive();
      setIsActive(isUserActive);
      setIsLoading(false);
    };
    checkActive();
  }, []);

  useEffect(() => {
    setAnimationClass('');
    setAnimationKey((prevKey) => prevKey + 1);
    setTimeout(() => {
      setAnimationClass('fadeInUp');
    }, 0);
  }, [showingForm]);

  useEffect(() => {
    const savedProspect = localStorage.getItem('selectedProspectCase');
    if (savedProspect) {
      setSelectedProspect(JSON.parse(savedProspect));
      setShowingForm(true);
    }
  }, []);

  useEffect(() => {
    const handleSaveState = () => {
      if (selectedProspect) {
        console.log('Saving selectedProspect to localStorage');
        localStorage.setItem(
          'selectedProspectCase',
          JSON.stringify(selectedProspect)
        );
      }
    };

    handleSaveState();

    window.addEventListener('beforeunload', handleSaveState);

    return () => {
      window.removeEventListener('beforeunload', handleSaveState);
    };
  }, [selectedProspect]);

  if (isLoading || isSubmitting) {
    return <LoadingSpinner/>;
  }
  
  return (
    <div className="flex-1 w-full flex justify-center items-center">
      <div className="animate-in opacity-0 max-w-4xl w-full">
        <div className="flex flex-col justify-center">
          {isActive ? (
                <div className="container mx-auto px-4 pt-6">
                {showingForm && selectedProspect ? (
                  <div key={animationKey} className={`animate-in ${animationClass}`}>
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
                      Case study Portal
                    </h1>
                    {isActive ? (
                      <>
                        <p className="text-md md:text-2xl text-center">
                          Currently selected: {selectedProspect?.full_name || 'None'} (
                          {selectedProspect?.email || 'None'})
                        </p>
                        {selectedProspect && (
                          <button
                            className="self-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => setShowingForm(true)}
                          >
                            Start Case Study Form
                          </button>
                        )}
                        <InterviewSearchBar
                          selectedProspect={selectedProspect}
                          setSelectedProspect={setSelectedProspect}
                        />
                      </>
                    ) : (
                      <div className="mt-4">
                        <ActiveLoginComponent />
                      </div>
                    )}
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
    </div>
  );
}
