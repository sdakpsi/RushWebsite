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
      className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
    >
      Application
    </button>
  );
};

export default ApplicationButton;