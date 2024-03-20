"use client"
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NextLinkButton from '../../../components/NextLinkButton';
import { User } from '@supabase/supabase-js'; // Ensure you import the User type
import { redirect } from 'next/navigation';
import ActiveLoginComponent from '@/components/ActiveLoginComponent';
import { getInterviewProspects, getIsActive } from '@/app/getUsers';
import InterviewSearchBar from '@/components/InterviewSearchBar';
import { ProspectInterview } from '@/lib/types';
import ActiveInterviewForm from '@/components/ActiveInterviewForm';
import './InterviewPage.css';

export default function ProtectedPage() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<ProspectInterview | null>(null);
  const [showingForm, setShowingForm] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    const checkActive = async () => {
      const isUserActive = await getIsActive();
      setIsActive(isUserActive);
      setIsLoading(false);
    };
    checkActive();
  }, [])

  useEffect(() => {
    if (showingForm) {
      setAnimationClass('fadeOutDown');
    }
  }, [showingForm]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (showingForm) {
    return(
      <div className={`animate-in ${animationClass === 'fadeOutDown' ? 'fadeInUp' : ''}`}>
        <ActiveInterviewForm 
        selectedProspect={selectedProspect}/>
        </div>
    )
  }

  return (
    <div className={`flex-1 w-full flex justify-center items-center animate-in ${animationClass}`}>      <div className="animate-in opacity-0 max-w-4xl w-full">
        <div className="flex flex-col justify-center">
          <p className="text-xl lg:text-4xl !leading-tight text-center mb-2">
            Interview Portal
          </p>
          {isActive ? (
            <div>
              <p className="text-xl lg:text-2xl !leading-tight text-left mb-2">
                Interview Prospects:
              </p>
              {/* {interviewProspects.map((ivName, index) => (
                <p
                  key={index}
                  className="text-xl lg:text-xl !leading-tight text-left mb-2"
                >
                  {ivName}
                </p>
              {/* ))} */}
              <InterviewSearchBar
                selectedProspect={selectedProspect}
                setSelectedProspect={setSelectedProspect}
               />
               {selectedProspect && (
               <button
                 className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-2 px-4 rounded-full"
                 onClick={() => setShowingForm(true)}
               >
                 Continue
               </button>
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
