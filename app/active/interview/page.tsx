'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NextLinkButton from '../../../components/NextLinkButton';
import { User } from '@supabase/supabase-js'; // Ensure you import the User type
import { redirect } from 'next/navigation';
import ActiveLoginComponent from '@/components/ActiveLoginComponent';
import { getInterviewProspects, getIsActive } from '@/app/supabase/getUsers';
import InterviewSearchBar from '@/components/InterviewSearchBar';
import { ProspectInterview } from '@/lib/types';
import ActiveInterviewForm from '@/components/ActiveInterviewForm';
import './InterviewPage.css';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProtectedPage() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] =
    useState<ProspectInterview | null>(null);
  const [showingForm, setShowingForm] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [animationKey, setAnimationKey] = useState(0);
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
    // Load the saved state from local storage when the component mounts
    const savedProspect = localStorage.getItem('selectedProspect');
    if (savedProspect) {
      console.log('found prospect');
      setSelectedProspect(JSON.parse(savedProspect));
      setShowingForm(true);
    }
  }, [isSubmitting]);

  useEffect(() => {
    const handleSaveState = () => {
      if (selectedProspect) {
        console.log('Saving selectedProspect to localStorage');
        localStorage.setItem(
          'selectedProspect',
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
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 pt-6">
      {showingForm && selectedProspect ? (
        <div key={animationKey} className={`animate-in ${animationClass}`}>
          <ActiveInterviewForm
            selectedProspect={selectedProspect}
            setSelectedProspect={setSelectedProspect}
            setShowingForm={setShowingForm}
            setIsSubmitting={setIsSubmitting}
          />
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          <h1 className="text-2xl md:text-5xl font-semibold text-center mt-10">
            Interview Portal
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
                  Start Interview Form
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
  );
}
