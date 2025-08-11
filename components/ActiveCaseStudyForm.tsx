import { CaseStudyForm, InterviewForm, ProspectInterview } from "@/lib/types";
import { useEffect, useState, useRef, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { debounce } from "lodash";
import { questions, scorableTraits } from "../lib/InterviewQuestions";
import {
  createCaseStudy,
  createInterview,
  createOrUpdateCaseStudy,
  getExistingCaseStudy,
  autoSaveCaseStudy,
} from "@/app/supabase/interview";
import { caseStudyData } from "@/lib/CaseStudyQuestions";
import customToast from "@/components/CustomToast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatTimestamp } from "@/utils/format";

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
  preloadedData,
}: ActiveInterviewFormProps) {
  const storageKey = isMultiFormContext
    ? null
    : `formDataCase_${selectedProspect.id}`;
  const savedFormData = storageKey
    ? JSON.parse(localStorage.getItem(storageKey) || "{}")
    : {};

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
  const [currentUserName, setCurrentUserName] = useState<string>("");
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
      const hasContent = Object.entries(formData).some(
        ([key, value]) =>
          key !== "name" && value && value.toString().trim() !== ""
      );

      if (!hasContent) return;

      setIsAutoSaving(true);

      try {
        const result = await autoSaveCaseStudy(
          formData,
          selectedProspect,
          submissionId
        );

        // If this was a new submission, store the ID for future updates
        if (!submissionId && result.data && result.data[0]) {
          setSubmissionId(result.data[0].id);
          setIsEditing(true);
        }

        setLastAutoSaved(formatTimestamp(new Date()));
      } catch (error) {
        console.error("Auto-save failed:", error);
        // Don't show error toast for auto-save failures - too intrusive
      } finally {
        setIsAutoSaving(false);
      }
    }, 1000), // 1 second delay like NameForm
    [selectedProspect, submissionId, isMultiFormContext, watch]
  );

  // Use React Query hook for current user data
  const { user } = useCurrentUser();
  
  // Auto-populate user name when user data is available
  useEffect(() => {
    if (user?.user_metadata?.name) {
      const userName = user.user_metadata.name;
      setCurrentUserName(userName);
      setValue("name", userName, { shouldValidate: true });
    }
  }, [user?.user_metadata?.name, setValue]);

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

  // Handle form data changes based on context
  useEffect(() => {
    if (isMultiFormContext && onFormDataChange && !isUserTypingRef.current) {
      const timeoutId = setTimeout(() => {
        onFormDataChange(currentFormData);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
    
    if (storageKey && !isMultiFormContext) {
      localStorage.setItem(storageKey, JSON.stringify(currentFormData));
    }
  }, [currentFormData, isMultiFormContext, onFormDataChange, storageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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
      },
    };
  };

  // Initial form data setup for multi-form context
  useEffect(() => {
    if (isMultiFormContext && externalFormData && Object.keys(externalFormData).length > 0) {
      const hasCurrentData = Object.keys(currentFormData).some(
        (key) => currentFormData[key as keyof CaseStudyForm]
      );

      if (!hasCurrentData) {
        Object.entries(externalFormData).forEach(([key, value]) => {
          setValue(key as keyof CaseStudyForm, value);
        });
      }
    }
  }, []); // Run once on mount

  // Reset form when prospect changes (single form context only)
  useEffect(() => {
    if (!isMultiFormContext && !isEditing) {
      Object.keys(currentFormData).forEach((key) => {
        if (key !== "name") {
          setValue(key as keyof CaseStudyForm, "");
        }
      });
    }
  }, [selectedProspect.id, isMultiFormContext, isEditing, setValue]);


  const onSubmit = async (data: CaseStudyForm) => {
    // Handle submission for both single and multi-form contexts

    if (setIsSubmitting && !isMultiFormContext) setIsSubmitting(true);
    if (onFormSubmit && isMultiFormContext) {
      // Notify parent that submission is starting
      onFormSubmit();
    }

    try {
      const result = await createOrUpdateCaseStudy(
        data,
        selectedProspect,
        submissionId
      );

      if (result.isUpdate) {
        customToast("Case study updated successfully!", "success");
      } else {
        customToast("Case study submitted successfully!", "success");
        // If it was a new submission, switch to edit mode for future changes
        setIsEditing(true);
      }

      if (!isMultiFormContext) {
        // Single form context - reset form
        if (setSelectedProspect) setSelectedProspect(null);
        localStorage.removeItem("selectedProspectCase");
        if (setShowingForm) setShowingForm(false);
        if (storageKey) localStorage.removeItem(storageKey);
      } else {
        // Multi-form context - close form after submission
        if (onFormClose) {
          onFormClose();
        }
      }
    } catch (error) {
      customToast("Error saving case study: " + error, "error");
    } finally {
      if (setIsSubmitting && !isMultiFormContext) setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    const errorMessages = Object.values(errors).map(
      (error: any) => error.message || "An error occurred"
    );
    const errorMessageString = errorMessages.join(", ");
    customToast(`Form submission errors: ${errorMessageString}`, "error");
  };

  const handleBack = () => {
    if (isMultiFormContext) {
      // In multi-form context, this shouldn't be called as there's no back button
      return;
    }
    if (setSelectedProspect) setSelectedProspect(null);
    localStorage.removeItem("selectedProspectCase");
    if (setShowingForm) setShowingForm(false);
    // Don't remove form data on back - let user resume if they come back to same prospect
  };

  const isCurrentlySubmitting = externalIsSubmitting || false;

  return (
    <div className="bg-black text-white relative">
      <div className="p-5">
        {isCurrentlySubmitting && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
            <LoadingSpinner size="medium" fullScreen={false} />
          </div>
        )}
        <div className="mb-5 flex items-center justify-between">
        {!isMultiFormContext && (
          <button
            type="button"
            onClick={() => handleBack()}
            className="cursor-pointer rounded-lg border-none bg-gray-700 px-4 py-2 text-base text-white"
          >
            &#x276E; Back{" "}
          </button>
        )}
        <div className="text-center">
        {!isMultiFormContext && (
          <h1 className="text-2xl text-white">
            Case Study: {selectedProspect.full_name}
          </h1>
        )}
          {!isMultiFormContext && (
            <div className="mt-1 text-sm text-gray-400">
              {isAutoSaving
                ? "Auto-saving..."
                : lastAutoSaved && `Last saved: ${lastAutoSaved}`}
            </div>
          )}
        </div>
        <div></div>
      </div>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="mb-5">
          <label htmlFor="name" className="mb-2 block">
            Active Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full cursor-not-allowed rounded-lg bg-gray-100 p-2.5 text-base text-black"
            readOnly
            {...register("name", {
              required: "Name is required",
            })}
          />
          {errors.name && (
            <p className="text-red-500">{`${
              errors.name.message ?? "Required!"
            }`}</p>
          )}
        </div>
        <div className="mb-5">
          <label htmlFor="otherActives" className="mb-2 block">
            Other Actives on Panel
          </label>
          <input
            type="text"
            id="otherActives"
            className="w-full rounded-lg p-2.5 text-base text-black"
            onInput={handleUserInput}
            {...registerWithAutoSave("otherActives", {
              required: "Other Actives on Panel is required",
            })}
          />
          {errors.otherActives && (
            <p className="text-red-500">{`${
              errors.otherActives.message ?? "Required!"
            }`}</p>
          )}
        </div>

        <div>
          {/* im like the look at me using a loop n shi */}
          {caseStudyData.map((question, index) => (
            <div key={index} className="mb-5">
              <label htmlFor={question.name} className="mb-2 block">
                {index <= 3 ? `${question.name} Comments` : question.name}
              </label>
              <textarea
                id={question.name}
                className="w-full rounded-lg p-2.5 text-base text-black"
                onInput={handleUserInput}
                {...registerWithAutoSave(
                  index <= 3 ? `${question.label}_comments` : question.label,
                  {
                    required: `Field  ${index <= 3 ? `${question.name} Comments` : question.name} is required`,
                  }
                )}
              ></textarea>
              {errors[
                index <= 3 ? `${question.label}_comments` : question.label
              ] && (
                <p className="text-red-500">{`${
                  errors[
                    index <= 3 ? `${question.label}_comments` : question.label
                  ]?.message || "Required!"
                }`}</p>
              )}{" "}
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-evenly sm:flex-row">
          {caseStudyData.slice(0, 4).map((trait) => (
            <div key={trait.label} className="mb-5">
              <label>{trait.name + " Score"}</label>
              <div className="mt-1">
                <select
                  className="rounded-lg p-2.5 text-base text-black"
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
                <p className="text-red-500">{`${
                  errors[`${trait.label}_score`]?.message || "Required!"
                }`}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5">
          <label htmlFor={"additionalComments"} className="mb-2 block">
            Additional Comments
          </label>
          <textarea
            id={"additionalComments"}
            className="w-full rounded-lg p-2.5 text-base text-black"
            onInput={handleUserInput}
            {...register("additionalComments", {})}
          ></textarea>
          {errors["additionalComments"] && (
            <p className="text-red-500">{`${
              errors["additionalComments"]?.message || "Required!"
            }`}</p>
          )}{" "}
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={isCurrentlySubmitting}
            className={`} cursor-pointer rounded-xl border-none bg-blue-500 px-5 py-2.5 text-base text-black hover:bg-blue-700
              disabled:opacity-50`}
          >
            {isCurrentlySubmitting
              ? isEditing
                ? "Updating..."
                : "Submitting..."
              : isEditing
                ? "Update Case Study"
                : "Submit Case Study"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
