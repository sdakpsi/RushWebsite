"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

const ApplicationButton: React.FC<{}> = () => {
  const router = useRouter();

  const handleClick = async () => {
    try {
      const response = await fetch('/api/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
    throw new Error('Failed to fetch data');
      } else{
          router.push('/application');
      }


      // Assuming the fetch is successful, navigate to /application
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleNavigate = () => {
    router.push('/application');
  };

  return (
    <button
      onClick={handleNavigate}
      className="btn-primary"
    >
      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Application
    </button>
  );
};

export default ApplicationButton;