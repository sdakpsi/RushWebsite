import React, { useState } from 'react';
import { ProspectInterview } from '@/lib/types';
import { useMultipleCaseForms, CaseFormInstance } from '@/hooks/useMultipleCaseForms';
import CaseStudyTabs from './CaseStudyTabs';
import ActiveCaseStudyForm from './ActiveCaseStudyForm';
import InterviewSearchBar from './InterviewSearchBar';
import { createCaseStudy } from '@/app/supabase/interview';
import { toast } from 'react-toastify';

interface MultipleCaseStudyManagerProps {
  showingManager: boolean;
  setShowingManager: (showing: boolean) => void;
}

export default function MultipleCaseStudyManager({ 
  showingManager, 
  setShowingManager 
}: MultipleCaseStudyManagerProps) {
  const {
    forms,
    activeForm,
    activeFormId,
    setActiveFormId,
    addForm,
    updateFormData,
    updateFormStatus,
    removeForm,
    completedFormsCount,
    clearAllForms,
    isSubmittingAll,
    setIsSubmittingAll
  } = useMultipleCaseForms();

  const [showProspectSelector, setShowProspectSelector] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<ProspectInterview | null>(null);

  const handleAddForm = (prospect: ProspectInterview) => {
    const formId = addForm(prospect);
    setShowProspectSelector(false);
    setSelectedProspect(null);
  };

  const handleTabClose = (formId: string) => {
    removeForm(formId);
  };

  const handleFormSubmit = async (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    updateFormStatus(formId, 'submitting');
    
    try {
      await createCaseStudy(form.formData as any, form.prospect);
      updateFormStatus(formId, 'submitted');
      toast.success(`Case study for ${form.prospect.full_name} submitted successfully`);
    } catch (error) {
      updateFormStatus(formId, 'error');
      toast.error(`Error submitting case study for ${form.prospect.full_name}: ${error}`);
    }
  };

  const handleBulkSubmit = async () => {
    const completedForms = forms.filter(form => form.status === 'completed');
    if (completedForms.length === 0) {
      toast.warning('No completed forms to submit');
      return;
    }

    setIsSubmittingAll(true);
    const results = [];

    for (const form of completedForms) {
      updateFormStatus(form.id, 'submitting');
      
      try {
        await createCaseStudy(form.formData as any, form.prospect);
        updateFormStatus(form.id, 'submitted');
        results.push({ success: true, name: form.prospect.full_name });
      } catch (error) {
        updateFormStatus(form.id, 'error');
        results.push({ success: false, name: form.prospect.full_name, error });
      }
    }

    setIsSubmittingAll(false);

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast.success(`${successCount} case studies submitted successfully`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} case studies failed to submit`);
    }
  };

  const handleBack = () => {
    setShowingManager(false);
  };

  if (!showingManager) return null;

  return (
    <div className="w-full max-w-6xl mx-auto bg-black text-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleBack}
          className="px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600"
        >
          ← Back to Portal
        </button>
        
        <h1 className="text-2xl font-semibold text-center text-white absolute left-1/2 transform -translate-x-1/2">
          Multiple Case Studies
        </h1>
        
        <div className="flex gap-2">
          {forms.length > 0 && (
            <>
              <span className="px-3 py-2 text-sm bg-blue-600 text-white rounded">
                {completedFormsCount}/{forms.length} completed
              </span>
              {completedFormsCount > 0 && (
                <button
                  onClick={handleBulkSubmit}
                  disabled={isSubmittingAll}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmittingAll ? 'Submitting...' : `Submit All (${completedFormsCount})`}
                </button>
              )}
              <button
                onClick={clearAllForms}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add New Form Section */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Add New Case Study</h2>
          <button
            onClick={() => setShowProspectSelector(!showProspectSelector)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Another Form
          </button>
        </div>
        
        {showProspectSelector && (
          <div className="mt-4">
            <InterviewSearchBar
              selectedProspect={selectedProspect}
              setSelectedProspect={setSelectedProspect}
            />
            {selectedProspect && (
              <div className="mt-4 flex items-center gap-4">
                <span className="text-sm text-white">
                  Selected: {selectedProspect.full_name} ({selectedProspect.email})
                </span>
                <button
                  onClick={() => handleAddForm(selectedProspect)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create Form
                </button>
                <button
                  onClick={() => {
                    setSelectedProspect(null);
                    setShowProspectSelector(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Forms Tabs */}
      <CaseStudyTabs
        forms={forms}
        activeFormId={activeFormId}
        onTabClick={setActiveFormId}
        onTabClose={handleTabClose}
      />

      {/* Active Form */}
      {activeForm && (
        <div className="border border-gray-700 rounded-lg bg-black">
          <ActiveCaseStudyForm
            key={activeForm.id} // Add key to force re-mount when switching forms
            selectedProspect={activeForm.prospect}
            formData={activeForm.formData}
            onFormDataChange={(data) => updateFormData(activeForm.id, data)}
            onFormSubmit={() => handleFormSubmit(activeForm.id)}
            onFormComplete={() => updateFormStatus(activeForm.id, 'completed')}
            isSubmitting={activeForm.status === 'submitting'}
            isMultiFormContext={true}
          />
        </div>
      )}

      {forms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-300 text-lg">No case study forms open</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add Another Form" to get started</p>
        </div>
      )}
    </div>
  );
}