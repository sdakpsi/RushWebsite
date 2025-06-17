"use client";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ActiveCaseStudyForm from "@/components/ActiveCaseStudyForm";
import InterviewSearchBar from "@/components/InterviewSearchBar";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import MultipleCaseStudyManager from "@/components/MultipleCaseStudyManager";
import { useActiveStatus } from "@/hooks/useCheckActive";
import { useSelectedProspect } from "@/hooks/useSelectedProspect";
import { useFormAnimation } from "@/hooks/useFormAnimation";
import PastActiveSubmission from "@/components/PastActiveSubmission";

export default function ProtectedPage() {
  const { isActive, isLoading } = useActiveStatus();
  const {
    selectedProspect,
    setSelectedProspect,
    isSubmitting,
    setIsSubmitting,
  } = useSelectedProspect();
  const { showingForm, setShowingForm, animationClass, animationKey } =
    useFormAnimation();
  const [showingMultipleForms, setShowingMultipleForms] = useState(false);

  useEffect(() => {
    console.log("showingForm", showingForm);
  }, [showingForm]);
  
  if (isLoading || isSubmitting) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="animate-in w-full max-w-6xl opacity-0">
        {isActive ? (
          <div className="container mx-auto px-4 pt-6">
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
                />
              </div>
            ) : (
              <div className="flex flex-col space-y-6">
                <h1 className="mt-10 text-center text-2xl font-semibold md:text-5xl">
                  Case Study Portal
                </h1>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex gap-4">
                    <button
                      className="rounded bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors"
                      onClick={() => setShowingMultipleForms(true)}
                    >
                      Multiple Forms Mode
                    </button>
                    <button
                      className="rounded bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
                      onClick={() => {
                        // Keep the original single form mode
                      }}
                      disabled
                    >
                      Classic Single Form
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 text-center max-w-2xl">
                    Use <strong>Multiple Forms Mode</strong> to evaluate multiple prospects at once with tabs and bulk submission.
                    Or use <strong>Classic Single Form</strong> for the traditional one-at-a-time approach.
                  </p>
                </div>

                <p className="text-md text-center md:text-2xl">
                  Currently selected: {selectedProspect?.full_name ?? "None"} (
                  {selectedProspect?.email ?? "None"})
                </p>
                {selectedProspect && (
                  <button
                    className="self-center rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    onClick={() => setShowingForm(true)}
                  >
                    Start Case Study Form
                  </button>
                )}
                <PastActiveSubmission
                  type="case_studies"
                  showingForm={showingForm}
                />
                <InterviewSearchBar
                  selectedProspect={selectedProspect}
                  setSelectedProspect={setSelectedProspect}
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
