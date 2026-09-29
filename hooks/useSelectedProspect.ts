import { useState } from 'react';
import { ProspectInterview } from '@/lib/types';

export function useSelectedProspect() {
  const [selectedProspect, setSelectedProspect] = useState<ProspectInterview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return { selectedProspect, setSelectedProspect, isSubmitting, setIsSubmitting };
}
