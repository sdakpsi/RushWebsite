import { useState, useEffect } from 'react';
import { getApplication } from '@/app/supabase/getUsers';

export function useApplicationView() {
  const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null);
  const [userID, setUserID] = useState<string>('');
  const [currentApplication, setCurrentApplication] = useState<any | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (currentApplicationId) {
        const applicationData = await getApplication(currentApplicationId);
        setCurrentApplication(applicationData);
      }
    };
    fetchApplication();
  }, [currentApplicationId]);

  const handleViewApplication = (applicationId: string, userId: string) => {
    setCurrentApplicationId(applicationId);
    setUserID(userId);
  };

  const handleClosePopup = () => {
    setCurrentApplication(null);
    setCurrentApplicationId(null);
  };

  return {
    currentApplicationId,
    currentApplication,
    userID,
    handleViewApplication,
    handleClosePopup,
  };
}