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

  return (
    <div className="flex w-full flex-1 items-center justify-center py-10">
      <div className="animate-in mx-8 w-full">
        <div className="text-center">
          <p className="mb-2 text-xl leading-tight lg:text-4xl">
            Delibs Portal
          </p>

          {isActiveLoading ? (
            // Loading skeleton for the entire page
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-4"></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-700 rounded w-full"></div>
                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isActive ? (
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
                {isUsersLoading ? (
                  // Show loading skeletons while users data loads
                  [1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-700 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                ) : (
                  usersData.map((applicant) => (
                    <div key={applicant.id} className="flex flex-col">
                      <LazyApplicantCard
                        applicant={applicant}
                        onViewApplication={handleViewApplication}
                      />
                    </div>
                  ))
                )}
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
