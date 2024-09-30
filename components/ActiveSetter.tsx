'use client';
import { createClient } from '@/utils/supabase/client';
import React, { useEffect, useState } from 'react';
import NextLinkButton from './NextLinkButton';
import ActiveLoginComponent from './ActiveLoginComponent';
import { redirect } from 'next/navigation';
import { getIsActive } from '@/app/supabase/getUsers';
import LoadingSpinner from './LoadingSpinner';

export default function ActiveSetter() {
  const supabase = createClient();

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initialize loading state

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Begin loading
      try {
        const activeStatus = await getIsActive();
        setIsActive(activeStatus);
        setIsLoading(false); // End loading
      } catch (error) {
        setIsLoading(false); // End loading
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // if (!user) {
  //   return redirect('/');
  // }

  if (isLoading) {
    return <LoadingSpinner />; // Placeholder for a loading state
  }

  return (
    <div>
      <p className="text-xl lg:text-4xl !leading-tight text-center mb-2">
        Active Portal
      </p>
      {isActive ? (
        <div className="flex flex-col gap-6 mt-4 justify-center items-center">
          <NextLinkButton destination="/active/comment-form">
            Comment Form
          </NextLinkButton>
          <NextLinkButton destination="/active/case">
            Case Study Portal
          </NextLinkButton>
          <NextLinkButton destination="/active/interview">
            Interview Portal
          </NextLinkButton>
          <NextLinkButton destination="/active/delibs">
            Delibs Portal
          </NextLinkButton>
        </div>
      ) : (
        <div className="flex mt-8 justify-center items-center">
          <ActiveLoginComponent />
        </div>
      )}
    </div>
  );
}
