import { useState, useEffect, useCallback } from 'react';
import { ProspectInterview, CaseStudyForm } from '@/lib/types';

export interface CaseFormInstance {
  id: string;
  prospect: ProspectInterview;
  formData: Partial<CaseStudyForm>;
  status: 'editing' | 'completed' | 'submitting' | 'submitted' | 'error';
  lastUpdated: Date;
  existingSubmissionId?: string;
  isEditing?: boolean;
}

const STORAGE_KEY = 'multipleCaseForms';

export function useMultipleCaseForms() {
  const [forms, setForms] = useState<CaseFormInstance[]>([]);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);

  // Load forms from localStorage on mount
  useEffect(() => {
    const savedForms = localStorage.getItem(STORAGE_KEY);
    if (savedForms) {
      try {
        const parsedForms = JSON.parse(savedForms);
        // Convert date strings back to Date objects
        const formsWithDates = parsedForms.map((form: any) => ({
          ...form,
          lastUpdated: new Date(form.lastUpdated)
        }));
        setForms(formsWithDates);
        
        // Set active form to the first form if none is set
        if (formsWithDates.length > 0 && !activeFormId) {
          setActiveFormId(formsWithDates[0].id);
        }
      } catch (error) {
        console.error('Error loading forms from localStorage:', error);
      }
    }
  }, []);

  // Save forms to localStorage whenever forms change
  useEffect(() => {
    if (forms.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [forms]);

  // Add a new form for a prospect
  const addForm = useCallback((prospect: ProspectInterview, existingData?: Partial<CaseStudyForm>, existingSubmissionId?: string) => {
    // Check if form already exists for this prospect
    const existingForm = forms.find(form => form.prospect.id === prospect.id);
    if (existingForm) {
      setActiveFormId(existingForm.id);
      return existingForm.id;
    }

    const newFormId = `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newForm: CaseFormInstance = {
      id: newFormId,
      prospect,
      formData: existingData || {},
      status: 'editing',
      lastUpdated: new Date(),
      existingSubmissionId,
      isEditing: !!existingSubmissionId
    };

    setForms(prev => [...prev, newForm]);
    setActiveFormId(newFormId);
    return newFormId;
  }, [forms]);

  // Update form data
  const updateFormData = useCallback((formId: string, data: Partial<CaseStudyForm>) => {
    setForms(prev => prev.map(form => {
      if (form.id === formId) {
        // Check if the data has actually changed to prevent unnecessary updates
        const hasChanged = Object.keys(data).some(key => 
          form.formData[key as keyof CaseStudyForm] !== data[key as keyof CaseStudyForm]
        );
        
        if (hasChanged) {
          return { ...form, formData: { ...form.formData, ...data }, lastUpdated: new Date() };
        }
      }
      return form;
    }));
  }, []);

  // Update form status
  const updateFormStatus = useCallback((formId: string, status: CaseFormInstance['status']) => {
    setForms(prev => prev.map(form =>
      form.id === formId
        ? { ...form, status, lastUpdated: new Date() }
        : form
    ));
  }, []);

  // Remove a form
  const removeForm = useCallback((formId: string) => {
    setForms(prev => {
      const updated = prev.filter(form => form.id !== formId);
      
      // If we're removing the active form, switch to another form
      if (activeFormId === formId && updated.length > 0) {
        setActiveFormId(updated[0].id);
      } else if (updated.length === 0) {
        setActiveFormId(null);
      }
      
      return updated;
    });
  }, [activeFormId]);

  // Get active form
  const activeForm = activeFormId ? forms.find(form => form.id === activeFormId) || null : null;

  // Get forms by status
  const getFormsByStatus = useCallback((status: CaseFormInstance['status']) => {
    return forms.filter(form => form.status === status);
  }, [forms]);

  // Clear all forms
  const clearAllForms = useCallback(() => {
    setForms([]);
    setActiveFormId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    forms,
    activeForm,
    activeFormId,
    setActiveFormId,
    addForm,
    updateFormData,
    updateFormStatus,
    removeForm,
    getFormsByStatus,
    clearAllForms
  };
}