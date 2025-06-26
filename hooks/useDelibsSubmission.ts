import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import customToast from '@/components/CustomToast';

export function useDelibsSubmission() {
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const supabase = createClient();

  const toggleApplicantSelection = (applicantId: string) => {
    setSelectedApplicants((prevSelected) => {
      if (prevSelected.includes(applicantId)) {
        return prevSelected.filter((id) => id !== applicantId);
      } else {
        return [...prevSelected, applicantId];
      }
    });
  };

  const clearSelections = () => {
    setSelectedApplicants([]);
  };

  const handleSubmitDelibs = async () => {
    try {
      const { data: delibsData, error: fetchError } = await supabase
        .from('delibs')
        .select('id');

      if (fetchError) throw fetchError;

      const deletePromises = delibsData.map((delib) =>
        supabase.from('delibs').delete().match({ id: delib.id })
      );

      await Promise.all(deletePromises);

      const rowsToInsert = selectedApplicants.map((applicantId) => ({
        prospect_id: applicantId,
      }));

      const { error: insertError } = await supabase
        .from('delibs')
        .insert(rowsToInsert);

      if (insertError) throw insertError;

      customToast('Delibs submitted successfully', 'success');
      setSelectedApplicants([]);
    } catch (error) {
      console.error('Error handling delibs:', error);
      customToast('Failed to handle delibs', 'error');
    }
  };

  return { selectedApplicants, toggleApplicantSelection, handleSubmitDelibs, clearSelections };
}