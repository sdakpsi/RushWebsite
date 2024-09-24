"use client";
import React from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ActiveInterviewForm from "@/components/ActiveInterviewForm";
import InterviewSearchBar from "@/components/InterviewSearchBar";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import { useActiveStatus } from "@/hooks/useCheckActive";
import { useSelectedProspect } from "@/hooks/useSelectedProspect";
import { useFormAnimation } from "@/hooks/useFormAnimation";
import PastActiveSubmission from "@/components/PastActiveSubmission";

// mirror implementation of case page

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

  if (isLoading || isSubmitting) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 pt-6">
      {showingForm && selectedProspect ? (
        <div key={animationKey} className={`animate-in ${animationClass}`}>
          <ActiveInterviewForm
            selectedProspect={selectedProspect}
            setSelectedProspect={setSelectedProspect}
            setShowingForm={setShowingForm}
            setIsSubmitting={setIsSubmitting}
          />
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          <h1 className="mt-10 text-center text-2xl font-semibold md:text-5xl">
            Interview Portal
          </h1>
          {isActive ? (
            <>
              <p className="text-md text-center md:text-2xl">
                Currently selected: {selectedProspect?.full_name ?? "None"} (
                {selectedProspect?.email ?? "None"})
              </p>
              {selectedProspect && (
                <button
                  className="self-center rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                  onClick={() => setShowingForm(true)}
                >
                  Start Interview Form
                </button>
              )}
              <PastActiveSubmission type="interviews" />
              <InterviewSearchBar
                selectedProspect={selectedProspect}
                setSelectedProspect={setSelectedProspect}
              />
            </>
          ) : (
            <div className="mt-4">
              <ActiveLoginComponent />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
