import { CaseStudyForm, InterviewForm, ProspectInterview } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { questions, scorableTraits } from '../lib/InterviewQuestions';
import { createCaseStudy, createInterview } from '@/app/supabase/interview';
import { toast } from 'react-toastify';
import { caseStudyData } from '@/lib/CaseStudyQuestions';
import { createClient } from '@/utils/supabase/client';

interface ActiveInterviewFormProps {
  selectedProspect: ProspectInterview;
  setSelectedProspect?: (prospect: ProspectInterview | null) => void;
  setShowingForm?: (showingForm: boolean) => void;
  setIsSubmitting?: (isSubmitting: boolean) => void;
  // New props for multi-form context
  formData?: Partial<CaseStudyForm>;
  onFormDataChange?: (data: Partial<CaseStudyForm>) => void;
  onFormSubmit?: () => void;
  onFormComplete?: () => void;
  isSubmitting?: boolean;
  isMultiFormContext?: boolean;
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
  isSubmitting: externalIsSubmitting,
  isMultiFormContext = false
}: ActiveInterviewFormProps) {
  const storageKey = isMultiFormContext ? null : 'formDataCase';
  const savedFormData = storageKey ? JSON.parse(localStorage.getItem(storageKey) || '{}') : {};
  const initialFormData = externalFormData || savedFormData;
  const isUserTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [currentUserName, setCurrentUserName] = useState<string>('');
  
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const onSubmit = async (data: CaseStudyForm) => {
    if (isMultiFormContext) {
      // In multi-form context, mark as complete and let parent handle submission
      if (onFormComplete) {
        onFormComplete();
      }
      toast.success('Form marked as complete! You can submit it from the main panel.');
      return;
    }

    // Single form context - handle submission directly
    if (setIsSubmitting) setIsSubmitting(true);
    try {
      await createCaseStudy(data, selectedProspect);
      toast.success('Form submitted successfully');
      if (setSelectedProspect) setSelectedProspect(null);
      localStorage.removeItem('selectedProspectCase');
      if (setShowingForm) setShowingForm(false);
      localStorage.removeItem('formDataCase');
    } catch (error) {
      toast.error('Error uploading interview form: ' + error);
    } finally {
      if (setIsSubmitting) setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    const errorMessages = Object.values(errors).map((error: any) => error.message || 'An error occurred');
    const errorMessageString = errorMessages.join(', ');
    toast.error(`Form submission errors: ${errorMessageString}`);
  };

  const handleBack = () => {
    if (isMultiFormContext) {
      // In multi-form context, this shouldn't be called as there's no back button
      return;
    }
    if (setSelectedProspect) setSelectedProspect(null);
    localStorage.removeItem('selectedProspectCase');
    if (setShowingForm) setShowingForm(false);
  };

  const isCurrentlySubmitting = externalIsSubmitting || false;

  return (
    <div className="bg-black text-white p-5">
      <div className="flex items-center justify-between mb-5">
        {!isMultiFormContext && (
          <button
            type="button"
            onClick={() => handleBack()}
            className="px-4 py-2 text-base rounded-lg text-white border-none cursor-pointer"
          >
            &lt; Back{' '}
          </button>
        )}
        <h1 className="text-2xl text-center text-white">
          Case Study: {selectedProspect.full_name}
        </h1>
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
            <p className="text-red-500">{`${
              errors.name.message ?? 'Required!'
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
            {...register('otherActives', {
              required: 'Other Actives on Panel is required',
            })}
          />
          {errors.otherActives && (
            <p className="text-red-500">{`${
              errors.otherActives.message ?? 'Required!'
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
                {...register(index <= 3 ? `${question.label}_comments` : question.label, {
                  required: `Field  ${index <= 3 ? `${question.name} Comments` : question.name} is required`
                })}
              ></textarea>
             {errors[index <= 3 ? `${question.label}_comments` : question.label] && (
                <p className="text-red-500">{`${
                  errors[index <= 3 ? `${question.label}_comments` : question.label]?.message || 'Required!'
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
                  onChange={handleUserInput}
                  {...register(`${trait.label}_score`, {
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
                <p className="text-red-500">{`${
                  errors[`${trait.label}_score`]?.message || 'Required!'
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
                <p className="text-red-500">{`${
                  errors["additionalComments"]?.message || 'Required!'
                }`}</p>
              )}{' '}
            </div>
        <div className="mt-4">
            <button
              type="submit"
              disabled={isCurrentlySubmitting}
              className={`px-5 rounded-xl py-2.5 text-base border-none cursor-pointer disabled:opacity-50 ${
                isMultiFormContext 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-700 text-black'
              }`}
            >
              {isCurrentlySubmitting 
                ? 'Submitting...' 
                : isMultiFormContext 
                  ? 'Mark as Complete' 
                  : 'Submit'
              }
            </button>
        </div>
      </form>
    </div>
  );
}
