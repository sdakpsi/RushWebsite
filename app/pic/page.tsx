"use client";

import React from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LazyApplicantCard, LazyApplicationPopUp } from "@/components/LazyComponents";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePICUsers } from "@/hooks/usePICUsers";
import { useApplicationView } from "@/hooks/useApplicationView";
import { useCasesAndInterviews } from "@/hooks/getCasesAndInterviews";
import { useDelibsSubmission } from "@/hooks/useDelibsSubmission";
import { useSearchAndSort } from "@/hooks/useSearchAndSort";
import { useCurrentWave } from "@/hooks/useCurrentWave";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const { isPIC, isLoading: isPICLoading, isActive } = useCurrentUser();
  const { usersData, avatarMap, isLoading: isUsersLoading } = usePICUsers();
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
  const { selectedApplicants, toggleApplicantSelection, handleSubmitDelibs, clearSelections } =
    useDelibsSubmission();
  const {
    searchQuery,
    setSearchQuery,
    sortType,
    sortUsers,
    filteredUsersData,
  } = useSearchAndSort(usersData);
  const { currentWaveCount, currentWaveNames, isLoading: isWaveLoading, refetch: refetchWave } = useCurrentWave();

  const handleSubmitDelibsWithRefresh = async () => {
    await handleSubmitDelibs();
    refetchWave();
  };

  // Only show spinner for critical loading states
  // Don't include cases/interviews loading since it depends on user selection
  if (isPICLoading || isUsersLoading || isWaveLoading) {
    return <LoadingSpinner />;
  }

  // Not PIC
  if (!isActive) {
    return redirect('/')
  }
  if (!isPIC) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="animate-in w-full max-w-7xl opacity-0">
          <div className="mt-8 flex items-center justify-center">
            <p className="text-sm sm:text-lg">
              You are not on PIC.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center py-10">
      <div className="animate-in mx-8 w-full">
        <div className="text-center">
          <p className="mb-2 text-xl leading-tight lg:text-4xl">PIC Portal</p>
          <div className="mb-4 space-y-3">
            <div>
              <p className="text-lg text-gray-300 mb-1">
                Current Wave ({currentWaveCount} applicant{currentWaveCount !== 1 ? 's' : ''}):
              </p>
              {currentWaveCount > 0 && (
                <div className="text-sm text-gray-400 max-w-2xl mx-auto">
                  {currentWaveNames.join(', ')}
                </div>
              )}
            </div>
            <div>
              <p className="text-lg text-blue-300 mb-1">
                Selected for Next Wave ({selectedApplicants.length} applicant{selectedApplicants.length !== 1 ? 's' : ''}):
              </p>
              {selectedApplicants.length > 0 && (
                <div className="text-sm text-blue-400 max-w-2xl mx-auto">
                  {selectedApplicants.map(id => {
                    const applicant = filteredUsersData.find(user => user.id === id);
                    return applicant?.full_name;
                  }).filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </div>

          {isPIC ? (
            <div>
              <div className="flex w-full flex-col items-center justify-center">
                <div className="mb-4 flex w-full max-w-md items-center">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow rounded-lg border px-4 py-2 text-gray-700 shadow-sm transition duration-150 ease-in-out focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    className="rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    onClick={handleSubmitDelibsWithRefresh}
                  >
                    Submit Wave
                  </button>
                  <button
                    className="rounded-lg bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
                    onClick={sortUsers}
                  >
                    Sort By {sortType === "name" ? "Score" : "Name"}
                  </button>
                  <button
                    className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
                    onClick={clearSelections}
                  >
                    Clear Selections
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredUsersData.map((applicant) => (
                  <div key={applicant.id} className="flex flex-col">
                    <LazyApplicantCard
                      applicant={applicant}
                      onViewApplication={handleViewApplication}
                      avatarUrl={avatarMap[applicant.id] || null}
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
                  <LazyApplicationPopUp
                    application={currentApplication}
                    cases={cases || []}
                    interviews={interviews || []}
                    userID={userID}
                    isPIC={isPIC}
                    isLoadingCasesInterviews={isCasesInterviewsLoading}
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
