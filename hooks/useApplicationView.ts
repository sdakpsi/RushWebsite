import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApplication } from '@/app/supabase/getUsers';

export function useApplicationView() {
  const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null);
  const [userID, setUserID] = useState<string>('');

  const { data: currentApplication, isLoading, error } = useQuery({
    queryKey: ['application', currentApplicationId],
    queryFn: () => getApplication(currentApplicationId!),
    enabled: !!currentApplicationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleViewApplication = (applicationId: string, userId: string) => {
    setCurrentApplicationId(applicationId);
    setUserID(userId);
  };

  const handleClosePopup = () => {
    setCurrentApplicationId(null);
  };

  return {
    currentApplicationId,
    currentApplication,
    userID,
    isLoading,
    error,
    handleViewApplication,
    handleClosePopup,
  };
}