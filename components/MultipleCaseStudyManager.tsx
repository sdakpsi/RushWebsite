import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { ProspectInterview } from '@/lib/types';
import { useMultipleCaseForms, CaseFormInstance } from '@/hooks/useMultipleCaseForms';
import CaseStudyTabs from './CaseStudyTabs';
import ActiveCaseStudyForm from './ActiveCaseStudyForm';
import InterviewSearchBar from './InterviewSearchBar';
import { createOrUpdateCaseStudy, getExistingCaseStudy, autoSaveCaseStudy } from '@/app/supabase/interview';
import customToast from '@/components/CustomToast';

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
    clearAllForms
  } = useMultipleCaseForms();

  const [showProspectSelector, setShowProspectSelector] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<ProspectInterview | null>(null);
  const [lastKeyPress, setLastKeyPress] = useState<{ key: string; time: number } | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<{[formId: string]: {saving: boolean, lastSaved?: string}}>({});

  // Auto-save for multiple forms - simpler approach
  const debouncedAutoSave = useCallback(
    debounce(async (formId: string, formData: any, prospect: ProspectInterview, existingSubmissionId?: string) => {
      // Don't auto-save if form is empty or only has the user's name
      const hasContent = Object.entries(formData).some(([key, value]) => 
        key !== 'name' && value && value.toString().trim() !== ''
      );
      
      if (!hasContent) return;

      setAutoSaveStatus(prev => ({
        ...prev,
        [formId]: { saving: true, lastSaved: prev[formId]?.lastSaved }
      }));
      
      try {
        const result = await autoSaveCaseStudy(formData, prospect, existingSubmissionId);
        
        setAutoSaveStatus(prev => ({
          ...prev,
          [formId]: { saving: false, lastSaved: new Date().toLocaleTimeString() }
        }));
      } catch (error) {
        console.error('Auto-save failed for form:', formId, error);
        setAutoSaveStatus(prev => ({
          ...prev,
          [formId]: { saving: false, lastSaved: prev[formId]?.lastSaved }
        }));
      }
    }, 1000), // 1 second delay like single form
    []
  );

  // Create a wrapper for form data change that triggers auto-save
  const handleFormDataChangeWithAutoSave = useCallback((formId: string, data: any, prospect: ProspectInterview, existingSubmissionId?: string) => {
    updateFormData(formId, data);
    debouncedAutoSave(formId, data, prospect, existingSubmissionId);
  }, [updateFormData, debouncedAutoSave]);

  // Keyboard navigation with debouncing
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle arrow keys when there are forms and no input/textarea is focused
    if (forms.length === 0 || 
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT') {
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      
      const now = Date.now();
      const debounceTime = 150; // 150ms debounce
      
      // Check if this is a repeated key press within the debounce time
      if (lastKeyPress && 
          lastKeyPress.key === event.key && 
          now - lastKeyPress.time < debounceTime) {
        return;
      }
      
      setLastKeyPress({ key: event.key, time: now });
      
      const currentIndex = forms.findIndex(form => form.id === activeFormId);
      if (currentIndex === -1) return;

      let nextIndex;
      if (event.key === 'ArrowLeft') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : forms.length - 1;
      } else {
        nextIndex = currentIndex < forms.length - 1 ? currentIndex + 1 : 0;
      }

      const nextForm = forms[nextIndex];
      if (nextForm) {
        setActiveFormId(nextForm.id);
      }
    }
  }, [forms, activeFormId, setActiveFormId, lastKeyPress]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);


  const handleAddForm = async (prospect: ProspectInterview) => {
    try {
      // Check if form already exists for this prospect
      const existingForm = forms.find(form => form.prospect.id === prospect.id);
      if (existingForm) {
        setActiveFormId(existingForm.id);
        setShowProspectSelector(false);
        setSelectedProspect(null);
        customToast(`Form for ${prospect.full_name} is already open`, 'info');
        return;
      }

      // Check for existing submission in database
      const existingSubmission = await getExistingCaseStudy(prospect.id);
      
      let formId;
      if (existingSubmission) {
        // Load existing submission data
        const existingData = {
          name: existingSubmission.active_name,
          otherActives: existingSubmission.other_actives,
          leadership_score: existingSubmission.leadership_score,
          teamwork_score: existingSubmission.teamwork_score,
          publicSpeaking_score: existingSubmission.public_speaking_score,
          analytical_score: existingSubmission.analytical_score,
          leadership_comments: existingSubmission.leadership_comments,
          teamwork_comments: existingSubmission.teamwork_comments,
          publicSpeaking_comments: existingSubmission.public_speaking_comments,
          analytical_comments: existingSubmission.analytical_comments,
          additionalComments: existingSubmission.additional,
          role: existingSubmission.role,
          thoughts: existingSubmission.thoughts,
        };

        formId = addForm(prospect, existingData, existingSubmission.id);
        customToast(`Loading existing case study for ${prospect.full_name}`, 'info');
      } else {
        formId = addForm(prospect);
        customToast(`Created new form for ${prospect.full_name}`, 'success');
      }

      setShowProspectSelector(false);
      setSelectedProspect(null);
    } catch (error) {
      console.error('Error checking for existing submission:', error);
      // Fall back to creating new form
      const formId = addForm(prospect);
      setShowProspectSelector(false);
      setSelectedProspect(null);
      customToast('Could not check for existing submission, created new form', 'warning');
    }
  };

  const handleTabClose = (formId: string) => {
    removeForm(formId);
  };

  const handleFormSubmit = async (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    updateFormStatus(formId, 'submitting');
    
    try {
      const result = await createOrUpdateCaseStudy(form.formData as any, form.prospect, form.existingSubmissionId);
      updateFormStatus(formId, 'submitted');
      
      if (result.isUpdate) {
        customToast(`Case study for ${form.prospect.full_name} updated successfully`, 'success');
      } else {
        customToast(`Case study for ${form.prospect.full_name} submitted successfully`, 'success');
      }
    } catch (error) {
      updateFormStatus(formId, 'error');
      customToast(`Error saving case study for ${form.prospect.full_name}: ${error}`, 'error');
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
          className="px-4 py-2 text-base rounded-lg text-white border-none cursor-pointer hover:bg-gray-700"
          >
            &lt; Back{' '}
          </button>
        
        <h1 className="text-2xl font-semibold text-center text-white absolute left-1/2 transform -translate-x-1/2">
          Multiple Case Studies
        </h1>
        
        <div className="flex gap-2">
          {forms.length > 0 && (
            <>
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
            onClick={() => setShowProspectSelector(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Form
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
                  className="px-4 py-2 rounded bg-blue-500 font-bold text-white hover:bg-blue-700"
                >
                  Start Case Study Form
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
        autoSaveStatus={autoSaveStatus}
      />

      {/* Active Form */}
      {activeForm && (
        <div className="border border-gray-700 rounded-lg bg-black">
          <ActiveCaseStudyForm
            key={activeForm.id} // Add key to force re-mount when switching forms
            selectedProspect={activeForm.prospect}
            formData={activeForm.formData}
            onFormDataChange={(data) => updateFormData(activeForm.id, data)}
            onFieldChange={(formData) => {
              // Use the fresh form data passed from the form
              debouncedAutoSave(activeForm.id, formData, activeForm.prospect, activeForm.existingSubmissionId);
            }}
            onFormSubmit={() => handleFormSubmit(activeForm.id)}
            onFormClose={() => handleTabClose(activeForm.id)}
            isSubmitting={activeForm.status === 'submitting'}
            isMultiFormContext={true}
            existingSubmissionId={activeForm.existingSubmissionId}
            isEditing={activeForm.isEditing}
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