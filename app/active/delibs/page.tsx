"use client";

import React from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LazyApplicantCard, LazyApplicationPopUp, LazyQueueView } from "@/components/LazyComponents";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import { useActiveStatus } from "@/hooks/useActiveStatus";
import { useDelibsUsers } from "@/hooks/getDelibsUsers";
import { useApplicationView } from "@/hooks/useApplicationView";
import { useCasesAndInterviews } from "@/hooks/getCasesAndInterviews";
import ActiveQueueControls from "@/components/ActiveQueueControls";

export default function ProtectedPage() {
  const { isActive, isPIC, isLoading: isActiveLoading } = useActiveStatus();
  const { usersData, isLoading: isUsersLoading } = useDelibsUsers();
  const {
    currentApplicationId,
    currentApplication,
    userID,
    handleViewApplication,
    handleClosePopup,
  } = useApplicationView();
  const { cases, interviews } = useCasesAndInterviews(userID);

  if (isActiveLoading || isUsersLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center py-10">
      <div className="animate-in mx-8 w-full">
        <div className="text-center">
          <p className="mb-2 text-xl leading-tight lg:text-4xl">
            Delibs Portal
          </p>

          {isActive ? (
            <div>
              {/* Queue Controls for Active Members */}
              {usersData.length > 0 && (
                <div className="mb-6 mt-6">
                  <ActiveQueueControls userId={userID} />
                </div>
              )}
              {/* Queue Management for PICs */}
              {usersData.length > 0 && (
                <div className="mb-6 mt-6">
                  <LazyQueueView isPic={isPIC}/>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {usersData.map((applicant) => (
                  <div key={applicant.id} className="flex flex-col">
                    <LazyApplicantCard
                      applicant={applicant}
                      onViewApplication={handleViewApplication}
                    />
                  </div>
                ))}
                {currentApplication && (
                  <LazyApplicationPopUp
                    application={currentApplication}
                    cases={cases}
                    interviews={interviews}
                    isPIC={false}
                    userID={userID}
                    onClose={handleClosePopup}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <ActiveLoginComponent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
