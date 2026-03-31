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
import { useProspectComments } from "@/hooks/useProspectComments";
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
  const { commentsData, isLoading: isCommentsLoading } = useProspectComments();
  const {
    searchQuery,
    setSearchQuery,
    sortType,
    sortUsers,
    filteredUsersData,
    filterTwoPlus,
    toggleFilterTwoPlus,
  } = useSearchAndSort(usersData, commentsData);
  const { currentWaveCount, currentWaveNames, isLoading: isWaveLoading, refetch: refetchWave } = useCurrentWave();

  const handleSubmitDelibsWithRefresh = async () => {
    await handleSubmitDelibs();
    refetchWave();
  };

  // Only show spinner for critical loading states
  // Don't include cases/interviews loading since it depends on user selection
  if (isPICLoading || isUsersLoading || isWaveLoading || isCommentsLoading) {
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
          <p className="mb-2 text-xl leading-tight text-foreground lg:text-4xl">
            PIC Portal
          </p>
          <div className="mb-4 space-y-3">
            <div>
              <p className="mb-1 text-lg text-foreground">
                Current Wave ({currentWaveCount} applicant{currentWaveCount !== 1 ? 's' : ''}):
              </p>
              {currentWaveCount > 0 && (
                <div className="mx-auto max-w-2xl text-sm text-muted-foreground">
                  {currentWaveNames.join(', ')}
                </div>
              )}
            </div>
            <div>
              <p className="mb-1 text-lg font-medium text-blue-800">
                Selected for Next Wave ({selectedApplicants.length} applicant{selectedApplicants.length !== 1 ? 's' : ''}):
              </p>
              {selectedApplicants.length > 0 && (
                <div className="mx-auto max-w-2xl text-sm text-blue-700">
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
                    className="flex-grow rounded-lg border border-border bg-background px-4 py-2 text-foreground shadow-sm transition duration-150 ease-in-out placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
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
                    className={`rounded-lg px-4 py-2 font-bold text-white transition-colors ${
                      filterTwoPlus
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                    onClick={toggleFilterTwoPlus}
                  >
                    {filterTwoPlus ? "Show All" : "2+ Yes Invites"}
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
                      type="button"
                      className={`ml-2 w-1/4 rounded px-2 py-1 text-sm font-bold transition-colors ${
                        selectedApplicants.includes(applicant.id)
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "border border-border bg-muted text-foreground hover:bg-muted/80"
                      }`}
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
