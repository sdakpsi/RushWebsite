'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from './useCurrentUser';

export function useHydrationSafeAuth() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, isActive, isPIC, isLoading, error } = useCurrentUser();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During SSR and initial hydration, return safe defaults
  if (!isHydrated) {
    return {
      user: null,
      isActive: false,
      isPIC: false,
      isLoading: true,
      hasAuthData: false,
      error: null
    };
  }

  // After hydration, return actual data
  const hasAuthData = user !== undefined && user !== null;
  
  return {
    user,
    isActive: !!isActive,
    isPIC: !!isPIC,
    isLoading: isLoading && !hasAuthData,
    hasAuthData,
    error
  };
}