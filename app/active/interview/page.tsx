"use client";
import React, { useState, useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ActiveInterviewForm from "@/components/ActiveInterviewForm";
import InterviewSearchBar from "@/components/InterviewSearchBar";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSelectedProspect } from "@/hooks/useSelectedProspect";
import { useFormAnimation } from "@/hooks/useFormAnimation";
import PastActiveSubmission from "@/components/PastActiveSubmission";

// mirror implementation of case page

export default function ProtectedPage() {
  const { isActive, isLoading } = useCurrentUser();
  const [hasLoaded, setHasLoaded] = useState(false);
  const {
    selectedProspect,
    setSelectedProspect,
    isSubmitting,
    setIsSubmitting,
  } = useSelectedProspect();
  const { showingForm, setShowingForm, animationClass, animationKey } =
    useFormAnimation();

  // Track when loading is complete to prevent flickering
  useEffect(() => {
    if (!isLoading) {
      setHasLoaded(true);
    }
  }, [isLoading]);

  // Show spinner only during initial auth check, not after first load
  if (isLoading && !hasLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 pt-6 relative">
      {isSubmitting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <LoadingSpinner size="medium" fullScreen={false} />
        </div>
      )}
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
                  className="self-center rounded-lg bg-blue-500 px-6 py-4 font-bold text-white hover:bg-blue-700 transition-all duration-200 touch-manipulation active:scale-95 shadow-lg text-lg"
                  onClick={() => setShowingForm(true)}
                >
                  Start Interview Form
                </button>
              )}
              <PastActiveSubmission type="interviews" showingForm={showingForm} />
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
