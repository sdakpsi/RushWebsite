'use client';
import { createClient } from '@/utils/supabase/client';
import React, { useEffect, useState } from 'react';
import NextLinkButton from './NextLinkButton';
import ActiveLoginComponent from './ActiveLoginComponent';

export default function ActiveSetter() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchActiveStatus = async () => {
      try {
        const response = await fetch('/api/is-active', { method: 'GET' }); // Assuming you're intending to "get" the active status.
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data.isActive);
        setIsActive(data.isActive);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };

    fetchActiveStatus();
  }, []);

  return (
    <div>
      <p className="text-xl lg:text-xl !leading-tight max-w-xl text-left mt-8 mb-2">
        For actives:
      </p>
      {isActive ? (
        <div className="flex mt-4 justify-center items-center">
          <NextLinkButton destination="/active">Active Portal</NextLinkButton>
        </div>
      ) : (
        <ActiveLoginComponent />
      )}
    </div>
  );
}
