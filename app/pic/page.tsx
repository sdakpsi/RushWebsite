"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "@/components/LoadingSpinner";
import ApplicantCard from "@/components/ApplicantCard";
import ApplicationPopup from "@/components/ApplicationPopUp";
import {
  getIsPIC,
  getUsers,
  getCases,
  getInterviews,
  getApplication,
} from "@/app/supabase/getUsers";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import { Packet } from "@/lib/types";

export default function ProtectedPage() {
  const [currentApplicationId, setCurrentApplicationId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<"name" | "score">("name");
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: isPIC, isLoading: isPICLoading } = useQuery({
    queryKey: ["isPIC"],
    queryFn: () => getIsPIC(),
  });

  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
    enabled: !!isPIC,
  });

  const { data: currentApplication, isLoading: isApplicationLoading } =
    useQuery({
      queryKey: ["application", currentApplicationId],
      queryFn: () => getApplication(currentApplicationId!),
      enabled: !!currentApplicationId,
    });

  const { data: cases } = useQuery({
    queryKey: ["cases", currentApplicationId],
    queryFn: () => getCases(currentApplicationId),
    enabled: !!currentApplicationId,
  });

  const { data: interviews } = useQuery({
    queryKey: ["interviews", currentApplicationId],
    queryFn: () => getInterviews(currentApplicationId),
    enabled: !!currentApplicationId,
  });

  const submitDelibsMutation = useMutation({
    mutationFn: async () => {
      const { data: delibsData, error: fetchError } = await supabase
        .from("delibs")
        .select("id");

      if (fetchError) throw fetchError;

      const deletePromises = delibsData.map((delib) =>
        supabase.from("delibs").delete().match({ id: delib.id })
      );

      await Promise.all(deletePromises);

      const rowsToInsert = selectedApplicants.map((applicantId) => ({
        prospect_id: applicantId,
      }));

      const { error: insertError } = await supabase
        .from("delibs")
        .insert(rowsToInsert);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success("Delibs submitted successfully");
      setSelectedApplicants([]);
    },
    onError: (error) => {
      console.error("Error handling delibs:", error);
      toast.error("Failed to handle delibs");
    },
  });

  const filteredUsersData = useMemo(() => {
    if (!usersData) return [];
    let filtered = usersData.filter((applicant) =>
      applicant.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortType === "score") {
      filtered.sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0));
    } else {
      filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }

    return filtered;
  }, [usersData, searchQuery, sortType]);

  const handleViewApplication = (applicationId: string) => {
    setCurrentApplicationId(applicationId);
  };

  const handleClosePopup = () => {
    setCurrentApplicationId(null);
  };

  const toggleApplicantSelection = (applicantId: string) => {
    setSelectedApplicants((prevSelected) => {
      if (prevSelected.includes(applicantId)) {
        return prevSelected.filter((id) => id !== applicantId);
      } else {
        return [...prevSelected, applicantId];
      }
    });
  };

  const sortUsers = () => {
    setSortType((prevSortType) => (prevSortType === "name" ? "score" : "name"));
  };

  if (isPICLoading || isUsersLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center py-10">
      <div className="animate-in mx-8 w-full">
        <div className="text-center">
          <p className="mb-2 text-xl leading-tight lg:text-4xl">PIC Portal</p>

          {(isPIC ?? true) ? (
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
                    onClick={() => submitDelibsMutation.mutate()}
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
                    cases={cases || []}
                    interviews={interviews || []}
                    userID={currentApplicationId!}
                    isPIC={isPIC}
                    onClose={handleClosePopup}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <p>You are not a PIC.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
