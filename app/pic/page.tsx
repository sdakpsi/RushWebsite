"use client";

import React from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ApplicantCard from "@/components/ApplicantCard";
import ApplicationPopup from "@/components/ApplicationPopUp";
import { useActiveStatus } from "@/hooks/useActiveStatus";
import { usePICUsers } from "@/hooks/usePICUsers";
import { useApplicationView } from "@/hooks/useApplicationView";
import { useCasesAndInterviews } from "@/hooks/getCasesAndInterviews";
import { useDelibsSubmission } from "@/hooks/useDelibsSubmission";
import { useSearchAndSort } from "@/hooks/useSearchAndSort";

export default function ProtectedPage() {
  const { isPIC, isLoading: isPICLoading } = useActiveStatus();
  const { usersData, isLoading: isUsersLoading } = usePICUsers();
  const {
    currentApplicationId,
    currentApplication,
    userID,
    handleViewApplication,
    handleClosePopup,
  } = useApplicationView();
  const {
    cases,
    interviews,
    isLoading: isCasesInterviewsLoading,
  } = useCasesAndInterviews(userID);
  const { selectedApplicants, toggleApplicantSelection, handleSubmitDelibs } =
    useDelibsSubmission();
  const {
    searchQuery,
    setSearchQuery,
    sortType,
    sortUsers,
    filteredUsersData,
  } = useSearchAndSort(usersData);

  if (isPICLoading || isUsersLoading || isCasesInterviewsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center py-10">
      <div className="animate-in mx-8 w-full">
        <div className="text-center">
          <p className="mb-2 text-xl leading-tight lg:text-4xl">PIC Portal</p>

          {isPIC ? (
            <div>
              <div className="flex w-full items-center justify-center">
                <div className="mb-4 flex w-full max-w-md items-center">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow rounded-lg border px-4 py-2 text-gray-700 shadow-sm transition duration-150 ease-in-out focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    className="ml-8 rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    onClick={handleSubmitDelibs}
                  >
                    DELIBS
                  </button>
                </div>
                <button
                  className="ml-4 rounded-lg bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
                  onClick={sortUsers}
                >
                  Sort by {sortType === "name" ? "score" : "name"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredUsersData.map((applicant) => (
                  <div key={applicant.id} className="flex flex-col">
                    <ApplicantCard
                      applicant={applicant}
                      onViewApplication={handleViewApplication}
                    />
                    <button
                      className={`ml-2 ${
                        selectedApplicants.includes(applicant.id)
                          ? "bg-green-500"
                          : "bg-gray-700"
                      } w-1/4 rounded px-2 py-1 text-sm font-bold text-white hover:bg-green-700`}
                      onClick={() => toggleApplicantSelection(applicant.id)}
                    >
                      {selectedApplicants.includes(applicant.id)
                        ? "Deselect"
                        : "Select"}
                    </button>
                  </div>
                ))}
                {currentApplication && (
                  <ApplicationPopup
                    application={currentApplication}
                    cases={cases}
                    interviews={interviews}
                    userID={userID}
                    isPIC={isPIC}
                    onClose={handleClosePopup}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <p>You are not on PIC.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
