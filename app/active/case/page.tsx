"use client";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ActiveCaseStudyForm from "@/components/ActiveCaseStudyForm";
import InterviewSearchBar from "@/components/InterviewSearchBar";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import MultipleCaseStudyManager from "@/components/MultipleCaseStudyManager";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSelectedProspect } from "@/hooks/useSelectedProspect";
import { useFormAnimation } from "@/hooks/useFormAnimation";
import PastActiveSubmission from "@/components/PastActiveSubmission";
import { loadCaseStudyFormData } from "@/app/supabase/interview";
import customToast from "@/components/CustomToast";
import { CaseStudyForm } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { getInterviewProspects } from "@/app/supabase/clientQueries";
import { getActiveSubmissionsWithStatus } from "@/app/supabase/getUsers";

export default function ProtectedPage() {
  const { isActive, isLoading } = useCurrentUser();
  const {
    selectedProspect,
    setSelectedProspect,
    isSubmitting,
    setIsSubmitting,
  } = useSelectedProspect();
  const { showingForm, setShowingForm, animationClass, animationKey } =
    useFormAnimation();
  const [showingMultipleForms, setShowingMultipleForms] = useState(false);
  const [preloadedFormData, setPreloadedFormData] = useState<Partial<CaseStudyForm> | undefined>(undefined);
  const [formSubmissionId, setFormSubmissionId] = useState(undefined);
  const [isFormEditing, setIsFormEditing] = useState(false);

  useEffect(() => {
    console.log("showingForm", showingForm);
  }, [showingForm]);

  const handleStartCaseStudyForm = async () => {
    if (!selectedProspect) return;
    
    try {
      const formData = await loadCaseStudyFormData(selectedProspect.id);
      
      if (formData.exists) {
        setPreloadedFormData(formData.data!);
        setFormSubmissionId(formData.submissionId);
        setIsFormEditing(formData.isEditing);
        customToast(`Loading existing case study for ${selectedProspect.full_name}`, 'info');
      } else {
        setPreloadedFormData(undefined);
        setFormSubmissionId(undefined);
        setIsFormEditing(false);
      }
      
      setShowingForm(true);
    } catch (error) {
      console.error('Error loading case study data:', error);
      // Still show the form even if loading fails
      setPreloadedFormData(undefined);
      setFormSubmissionId(undefined);
      setIsFormEditing(false);
      setShowingForm(true);
    }
  };
  
  // Preload data for child components to prevent individual spinners
  const { data: prospectsData, isLoading: isProspectsLoading } = useQuery({
    queryKey: ['interviewProspects'],
    queryFn: async () => {
      const prospects = await getInterviewProspects();
      if (!prospects || prospects.length === 0) {
        return [];
      }
      return prospects;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: isActive, // Only fetch if user is active
  });

  const { data: submissionsData, isLoading: isSubmissionsLoading } = useQuery({
    queryKey: ['case_studiesSubmissionsWithStatus', showingForm],
    queryFn: () => getActiveSubmissionsWithStatus('case_studies'),
    enabled: isActive, // Only fetch if user is active
  });

  // Unified loading state - show spinner only when auth is loading or when both child data is loading
  const isChildDataLoading = isActive && (isProspectsLoading || isSubmissionsLoading);
  
  // Show spinner only during initial auth check or when child data is loading
  if (isLoading || isChildDataLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="animate-in w-full max-w-6xl opacity-0">
        {isActive ? (
          <div className="container mx-auto px-4 pt-6 pb-24 relative">
            {isSubmitting && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
                <LoadingSpinner size="medium" fullScreen={false} />
              </div>
            )}
            {showingMultipleForms ? (
              <MultipleCaseStudyManager
                showingManager={showingMultipleForms}
                setShowingManager={setShowingMultipleForms}
              />
            ) : showingForm && selectedProspect ? (
              <div
                key={animationKey}
                className={`animate-in ${animationClass}`}
              >
                <ActiveCaseStudyForm
                  selectedProspect={selectedProspect}
                  setSelectedProspect={setSelectedProspect}
                  setShowingForm={setShowingForm}
                  setIsSubmitting={setIsSubmitting}
                  preloadedData={preloadedFormData}
                  existingSubmissionId={formSubmissionId}
                  isEditing={isFormEditing}
                />
              </div>
            ) : (
              <div className="flex flex-col space-y-6">
                <h1 className="mt-10 text-center text-2xl font-semibold md:text-5xl">
                  Case Study Portal
                </h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex gap-2 sm:gap-4 w-full max-w-md">
                   
                    <button
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-3 sm:px-6 font-semibold text-white hover:bg-blue-700 transition-all duration-200 touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        // Keep the original single form mode
                      }}
                      disabled
                    >
                      Single Form
                    </button>
                    <button
                      className="flex-1 rounded-lg bg-green-600 px-4 py-3 sm:px-6 font-semibold text-white hover:bg-green-700 transition-all duration-200 touch-manipulation active:scale-95 shadow-lg"
                      onClick={() => setShowingMultipleForms(true)}
                    >
                      Multiple Forms
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 text-center max-w-2xl">
                    Use <strong>Single Form</strong> for the traditional one-at-a-time approach.<br></br>
                    Use <strong>Multiple Forms</strong> to evaluate multiple prospects at once with tabs.
                  </p>
                </div>

                <p className="text-md text-center md:text-2xl">
                  Currently selected: {selectedProspect?.full_name ?? "None"} (
                  {selectedProspect?.email ?? "None"})
                </p>
                {selectedProspect && (
                  <button
                    className="self-center rounded-lg bg-blue-500 px-6 py-4 font-bold text-white hover:bg-blue-700 transition-all duration-200 touch-manipulation active:scale-95 shadow-lg text-lg"
                    onClick={handleStartCaseStudyForm}
                  >
                    Start Case Study Form
                  </button>
                )}
                <PastActiveSubmission
                  type="case_studies"
                  showingForm={showingForm}
                  preloadedData={submissionsData || undefined}
                  isPreloaded={true}
                />
                <InterviewSearchBar
                  selectedProspect={selectedProspect}
                  setSelectedProspect={setSelectedProspect}
                  preloadedData={prospectsData}
                  isPreloaded={true}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center">
            <ActiveLoginComponent />
          </div>
        )}
      </div>
    </div>
  );
}
