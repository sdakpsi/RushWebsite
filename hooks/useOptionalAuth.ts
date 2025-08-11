import { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';

export function useOptionalAuth() {
  // Reuse the consolidated user data query
  const { user, userData, isActive, isPIC, hasPhoto, photoUrl, isLoading, error } = useCurrentUser();
  
  const hasAuthData = user !== undefined;
  
  // Memoize result to prevent unnecessary re-renders
  const result = useMemo(() => ({
    user,
    userData,
    isActive,
    isPIC,
    hasPhoto,
    photoUrl,
    isLoading: isLoading && !hasAuthData, // Only loading if we have no data at all
    hasAuthData,
    error
  }), [user, userData, isActive, isPIC, hasPhoto, photoUrl, isLoading, hasAuthData, error]);

  return result;
}