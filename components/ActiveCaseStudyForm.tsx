import { CaseStudyForm, InterviewForm, ProspectInterview } from '@/lib/types';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { debounce } from 'lodash';
import { questions, scorableTraits } from '../lib/InterviewQuestions';
import { createCaseStudy, createInterview, createOrUpdateCaseStudy, getExistingCaseStudy, autoSaveCaseStudy } from '@/app/supabase/interview';
import { caseStudyData } from '@/lib/CaseStudyQuestions';
import customToast from '@/components/CustomToast';
import { createClient } from '@/utils/supabase/client';
import { formatTimestamp } from '@/utils/format';

interface ActiveInterviewFormProps {
  selectedProspect: ProspectInterview;
  setSelectedProspect?: (prospect: ProspectInterview | null) => void;
  setShowingForm?: (showingForm: boolean) => void;
  setIsSubmitting?: (isSubmitting: boolean) => void;
  // New props for multi-form context
  formData?: Partial<CaseStudyForm>;
  onFormDataChange?: (data: Partial<CaseStudyForm>) => void;
  onFieldChange?: (formData: Partial<CaseStudyForm>) => void;
  onFormSubmit?: () => void;
  onFormComplete?: () => void;
  onFormClose?: () => void;
  isSubmitting?: boolean;
  isMultiFormContext?: boolean;
  // New props for edit mode
  existingSubmissionId?: string;
  isEditing?: boolean;
  preloadedData?: Partial<CaseStudyForm>;
}
export default function ActiveCaseStudyForm({
  selectedProspect,
  setSelectedProspect,
  setShowingForm,
  setIsSubmitting,
  formData: externalFormData,
  onFormDataChange,
  onFormSubmit,
  onFormComplete,
  onFormClose,
  isSubmitting: externalIsSubmitting,
  isMultiFormContext = false,
  existingSubmissionId,
  isEditing: initialIsEditing = false,
  onFieldChange,
  preloadedData
}: ActiveInterviewFormProps) {
  const storageKey = isMultiFormContext ? null : `formDataCase_${selectedProspect.id}`;
  const savedFormData = storageKey ? JSON.parse(localStorage.getItem(storageKey) || '{}') : {};
  
  // Initialize form data based on context
  const getInitialFormData = () => {
    if (preloadedData) {
      return preloadedData;
    }
    if (externalFormData) {
      return externalFormData;
    }
    if (savedFormData && Object.keys(savedFormData).length > 0) {
      return savedFormData;
    }
    return {};
  };
  
  const initialFormData = getInitialFormData();
  const isUserTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [submissionId, setSubmissionId] = useState(existingSubmissionId);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialFormData,
  });

  // Watch all form fields
  const currentFormData = watch();

  // Auto-save functionality - only triggers on actual changes
  const debouncedAutoSave = useCallback(
    debounce(async () => {
      // Only auto-save if not in multi-form context (handled separately)
      if (isMultiFormContext) return;

      const formData = watch(); // Get fresh form data

      // Don't auto-save if form is empty or only has the user's name
      const hasContent = Object.entries(formData).some(([key, value]) =>
        key !== 'name' && value && value.toString().trim() !== ''
      );

      if (!hasContent) return;

      setIsAutoSaving(true);

      try {
        const result = await autoSaveCaseStudy(formData, selectedProspect, submissionId);

        // If this was a new submission, store the ID for future updates
        if (!submissionId && result.data && result.data[0]) {
          setSubmissionId(result.data[0].id);
          setIsEditing(true);
        }

        setLastAutoSaved(formatTimestamp(new Date()));
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't show error toast for auto-save failures - too intrusive
      } finally {
        setIsAutoSaving(false);
      }
    }, 1000), // 1 second delay like NameForm
    [selectedProspect, submissionId, isMultiFormContext, watch]
  );

  // Fetch current user's name and auto-populate
  useEffect(() => {
    const fetchUserName = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata?.name) {
        const userName = user.user_metadata.name;
        setCurrentUserName(userName);
        // Always set the user's name, overriding any existing value
        setValue('name', userName, { shouldValidate: true });
      }
    };

    fetchUserName();
  }, [setValue]);


  // Handle user typing detection
  const handleUserInput = () => {
    if (isMultiFormContext) {
      isUserTypingRef.current = true;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to mark typing as finished
      typingTimeoutRef.current = setTimeout(() => {
        isUserTypingRef.current = false;
      }, 1000); // 1 second after user stops typing
    }
  };

  // Debounced form data update for multi-form context
  useEffect(() => {
    if (isMultiFormContext && onFormDataChange && !isUserTypingRef.current) {
      // Only update if user is not currently typing
      const timeoutId = setTimeout(() => {
        onFormDataChange(currentFormData);
      }, 100); // Reduced debounce time

      return () => clearTimeout(timeoutId);
    } else if (storageKey) {
      // In single form context, save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(currentFormData));
    }
  }, [currentFormData, isMultiFormContext, onFormDataChange, storageKey]);


  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);

  // Custom register that includes auto-save
  const registerWithAutoSave = (fieldName: string, options?: any) => {
    const registration = register(fieldName, options);

    return {
      ...registration,
      onChange: (e: any) => {
        // Call the original onChange first
        registration.onChange(e);

        // Then trigger auto-save or field change callback
        if (isMultiFormContext) {
          // Use setTimeout to get updated form data after the onChange
          setTimeout(() => {
            const freshData = watch();
            if (onFormDataChange) {
              onFormDataChange(freshData);
            }
            if (onFieldChange) {
              onFieldChange(freshData);
            }
          }, 0);
        } else if (!isMultiFormContext) {
          // Use setTimeout to get updated form data after the onChange
          setTimeout(() => {
            debouncedAutoSave();
          }, 0);
        }
      }
    };
  };

  // Initial form data setup only - no ongoing updates to prevent interference
  useEffect(() => {
    if (isMultiFormContext && externalFormData && Object.keys(externalFormData).length > 0) {
      // Only set initial values, don't continuously update
      const hasCurrentData = Object.keys(currentFormData).some(key => currentFormData[key as keyof CaseStudyForm]);

      if (!hasCurrentData) {
        Object.keys(externalFormData).forEach(key => {
          setValue(key as keyof CaseStudyForm, externalFormData[key as keyof CaseStudyForm]);
        });
      }
    }
  }, []); // Empty dependency array - only run once on mount

  // Reset form when prospect changes (only for single form context)
  useEffect(() => {
    if (!isMultiFormContext && !isEditing) {
      // Clear form data when switching to a different prospect
      const formKeys = Object.keys(watch());
      formKeys.forEach(key => {
        if (key !== 'name') { // Keep the active name
          setValue(key as keyof CaseStudyForm, '');
        }
      });
    }
  }, [selectedProspect.id, isMultiFormContext, isEditing, setValue, watch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const onSubmit = async (data: CaseStudyForm) => {
    // Handle submission for both single and multi-form contexts
    const isCurrentlySubmitting = externalIsSubmitting || false;

    if (setIsSubmitting && !isMultiFormContext) setIsSubmitting(true);
    if (onFormSubmit && isMultiFormContext) {
      // Notify parent that submission is starting
      onFormSubmit();
    }

    try {
      const result = await createOrUpdateCaseStudy(data, selectedProspect, submissionId);

      if (result.isUpdate) {
        customToast('Case study updated successfully!', 'success');
      } else {
        customToast('Case study submitted successfully!', 'success');
        // If it was a new submission, switch to edit mode for future changes
        setIsEditing(true);
      }

      if (!isMultiFormContext) {
        // Single form context - reset form
        if (setSelectedProspect) setSelectedProspect(null);
        localStorage.removeItem('selectedProspectCase');
        if (setShowingForm) setShowingForm(false);
        if (storageKey) localStorage.removeItem(storageKey);
      } else {
        // Multi-form context - close form after submission
        if (onFormClose) {
          onFormClose();
        }
      }

    } catch (error) {
      customToast('Error saving case study: ' + error, 'error');
    } finally {
      if (setIsSubmitting && !isMultiFormContext) setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    const errorMessages = Object.values(errors).map((error: any) => error.message || 'An error occurred');
    const errorMessageString = errorMessages.join(', ');
    customToast(`Form submission errors: ${errorMessageString}`, 'error');
  };

  const handleBack = () => {
    if (isMultiFormContext) {
      // In multi-form context, this shouldn't be called as there's no back button
      return;
    }
    if (setSelectedProspect) setSelectedProspect(null);
    localStorage.removeItem('selectedProspectCase');
    if (setShowingForm) setShowingForm(false);
    // Don't remove form data on back - let user resume if they come back to same prospect
  };

  const isCurrentlySubmitting = externalIsSubmitting || false;

  return (
    <div className="bg-black text-white p-5">
      <div className="flex items-center justify-between mb-5">
        {!isMultiFormContext && (
          <button
            type="button"
            onClick={() => handleBack()}
            className="px-4 py-2 text-base rounded-lg text-white border-none cursor-pointer hover:bg-gray-700"
          >
            &lt; Back{' '}
          </button>
        )}
        <div className="text-center">
          <h1 className="text-2xl text-white">
            Case Study: {selectedProspect.full_name}
          </h1>
          {!isMultiFormContext && (
            <div className="text-sm text-gray-400 mt-1">
              {isAutoSaving ? "Auto-saving..." : lastAutoSaved && `Last saved: ${lastAutoSaved}`}
            </div>
          )}
        </div>
        <div></div>
      </div>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="mb-5">
          <label htmlFor="name" className="block mb-2">
            Active Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full p-2.5 rounded-lg text-base text-black bg-gray-100 cursor-not-allowed"
            readOnly
            {...register('name', {
              required: 'Name is required',
            })}
          />
          {errors.name && (
            <p className="text-red-500">{`${errors.name.message ?? 'Required!'
              }`}</p>
          )}
        </div>
        <div className="mb-5">
          <label htmlFor="otherActives" className="block mb-2">
            Other Actives on Panel
          </label>
          <input
            type="text"
            id="otherActives"
            className="w-full p-2.5 rounded-lg text-base text-black"
            onInput={handleUserInput}
            {...registerWithAutoSave('otherActives', {
              required: 'Other Actives on Panel is required',
            })}
          />
          {errors.otherActives && (
            <p className="text-red-500">{`${errors.otherActives.message ?? 'Required!'
              }`}</p>
          )}
        </div>

        <div>
          {/* im like the look at me using a loop n shi */}
          {caseStudyData.map((question, index) => (
            <div key={index} className="mb-5">
              <label htmlFor={question.name} className="block mb-2">
                {index <= 3 ? `${question.name} Comments` : question.name}
              </label>
              <textarea
                id={question.name}
                className="w-full p-2.5 text-base text-black rounded-lg"
                onInput={handleUserInput}
                {...registerWithAutoSave(index <= 3 ? `${question.label}_comments` : question.label, {
                  required: `Field  ${index <= 3 ? `${question.name} Comments` : question.name} is required`
                })}
              ></textarea>
              {errors[index <= 3 ? `${question.label}_comments` : question.label] && (
                <p className="text-red-500">{`${errors[index <= 3 ? `${question.label}_comments` : question.label]?.message || 'Required!'
                  }`}</p>
              )}{' '}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-evenly">
          {caseStudyData.slice(0, 4).map((trait) => (
            <div key={trait.label} className="mb-5">
              <label>{trait.name + " Score"}</label>
              <div className="mt-1">
                <select
                  className="p-2.5 text-base rounded-lg text-black"
                  {...registerWithAutoSave(`${trait.label}_score`, {
                    required: `Please select a value for ${trait.name}`,
                  })}
                >
                  <option value="">Score</option>
                  {[1, 2, 3, 4, 5].map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
              </div>
              {errors[`${trait.label}_score`] && (
                <p className="text-red-500">{`${errors[`${trait.label}_score`]?.message || 'Required!'
                  }`}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5">
          <label htmlFor={"additionalComments"} className="block mb-2">
            Additional Comments
          </label>
          <textarea
            id={"additionalComments"}
            className="w-full p-2.5 text-base text-black rounded-lg"
            onInput={handleUserInput}
            {...register("additionalComments", {
            })}
          ></textarea>
          {errors["additionalComments"] && (
            <p className="text-red-500">{`${errors["additionalComments"]?.message || 'Required!'
              }`}</p>
          )}{' '}
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={isCurrentlySubmitting}
            className={`px-5 rounded-xl py-2.5 text-base border-none cursor-pointer disabled:opacity-50 ${isMultiFormContext
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-500 hover:bg-blue-700 text-black'
              }`}
          >
            {isCurrentlySubmitting
              ? (isEditing ? 'Updating...' : 'Submitting...')
              : isEditing
                ? 'Update Case Study'
                : 'Submit Case Study'
            }
          </button>
        </div>
      </form>
    </div>
  );
}
