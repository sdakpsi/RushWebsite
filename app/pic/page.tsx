'use client';

import React from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ApplicantCard from '@/components/ApplicantCard';
import ApplicationPopup from '@/components/ApplicationPopUp';
import { useActiveStatus } from '@/hooks/useActiveStatus';
import { usePICUsers } from '@/hooks/usePICUsers';
import { useApplicationView } from '@/hooks/useApplicationView';
import { useCasesAndInterviews } from '@/hooks/getCasesAndInterviews';
import { useDelibsSubmission } from '@/hooks/useDelibsSubmission';
import { useSearchAndSort } from '@/hooks/useSearchAndSort';

export default function ProtectedPage() {
  const { isPIC, isLoading: isPICLoading } = useActiveStatus();
  const { usersData, isLoading: isUsersLoading } = usePICUsers();
  const { 
    currentApplicationId, 
    currentApplication, 
    userID, 
    handleViewApplication, 
    handleClosePopup 
  } = useApplicationView();
  const { cases, interviews, isLoading: isCasesInterviewsLoading } = useCasesAndInterviews(userID);
  const { selectedApplicants, toggleApplicantSelection, handleSubmitDelibs } = useDelibsSubmission();
  const { searchQuery, setSearchQuery, sortType, sortUsers, filteredUsersData } = useSearchAndSort(usersData);

  if (isPICLoading || isUsersLoading || isCasesInterviewsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 w-full flex justify-center items-center py-10">
      <div className="animate-in w-full mx-8">
        <div className="text-center">
          <p className="text-xl lg:text-4xl leading-tight mb-2">PIC Portal</p>

          {isPIC ? (
            <div>
              <div className="flex justify-center items-center w-full">
                <div className="flex items-center mb-4 max-w-md w-full">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-grow px-4 py-2 border rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  />
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold ml-8 py-2 px-4 rounded-lg"
                    onClick={handleSubmitDelibs}
                  >
                    DELIBS
                  </button>
                </div>
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold ml-4 py-2 px-4 rounded-lg"
                  onClick={sortUsers}
                >
                  Sort by {sortType === 'name' ? 'score' : 'name'}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredUsersData.map((applicant) => (
                  <div key={applicant.id} className="flex flex-col">
                    <ApplicantCard
                      applicant={applicant}
                      onViewApplication={handleViewApplication}
                    />
                    <button
                      className={`ml-2 ${
                        selectedApplicants.includes(applicant.id)
                          ? 'bg-green-500'
                          : 'bg-gray-700'
                      } hover:bg-green-700 text-white text-sm w-1/4 font-bold py-1 px-2 rounded`}
                      onClick={() => toggleApplicantSelection(applicant.id)}
                    >
                      {selectedApplicants.includes(applicant.id)
                        ? 'Deselect'
                        : 'Select'}
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
