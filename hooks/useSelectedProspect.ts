import { useState, useEffect } from 'react';
import { ProspectInterview } from '@/lib/types';

const STORAGE_KEY = 'selectedProspect';

export function useSelectedProspect() {
  const [selectedProspect, setSelectedProspect] = useState<ProspectInterview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedProspect = localStorage.getItem(STORAGE_KEY);
    if (savedProspect) {
      setSelectedProspect(JSON.parse(savedProspect));
    }
  }, [isSubmitting]);

  useEffect(() => {
    const handleSaveState = () => {
      if (selectedProspect) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProspect));
      }
    };

    handleSaveState();
    window.addEventListener('beforeunload', handleSaveState);
    return () => {
      window.removeEventListener('beforeunload', handleSaveState);
    };
  }, [selectedProspect]);

  return { selectedProspect, setSelectedProspect, isSubmitting, setIsSubmitting };
}