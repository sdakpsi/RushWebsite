import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-toastify';

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

      toast.success('Delibs submitted successfully');
      setSelectedApplicants([]);
    } catch (error) {
      console.error('Error handling delibs:', error);
      toast.error('Failed to handle delibs');
    }
  };

  return { selectedApplicants, toggleApplicantSelection, handleSubmitDelibs };
}