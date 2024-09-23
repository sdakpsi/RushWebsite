"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { getIsPIC, getInterestFormSubmissions } from "../supabase/getUsers";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faRefresh } from "@fortawesome/free-solid-svg-icons";

interface InterestFormSubmission {
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
}

export default function ProtectedPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: isPIC, isLoading: isPICLoading } = useQuery({
    queryKey: ["isPIC"],
    queryFn: () => getIsPIC(),
  });

  const { data: interestFormData, isLoading: isDataLoading } = useQuery({
    queryKey: ["interestFormSubmissions", refreshKey],
    queryFn: () => getInterestFormSubmissions(),
    enabled: !!isPIC,
  });

  const copyMutation = useMutation({
    mutationFn: (data: string) => navigator.clipboard.writeText(data),
    onSuccess: () => toast.success("Copied to clipboard!"),
  });

  const copyToClipboard = (data: string) => {
    copyMutation.mutate(data);
  };

  const copyEmails = () => {
    const emails = interestFormData?.map((item) => item.email).join(", ") || "";
    copyToClipboard(emails);
  };

  const copyPhones = () => {
    const phones = interestFormData?.map((item) => item.phone).join(", ") || "";
    copyToClipboard(phones);
  };

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isPICLoading || isDataLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center py-10">
      <div className="animate-in mx-8 w-full">
        <div className="text-center">
          {isPIC ? (
            <div className="mt-8">
              <p className="mb-2 text-xl leading-tight lg:text-4xl">
                Interest Form Submissions
                <FontAwesomeIcon
                  icon={faRefresh}
                  className="ml-2 cursor-pointer text-blue-500"
                  onClick={refreshData}
                />
              </p>
              <table className="mt-4 min-w-full border-gray-200 bg-black text-left">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Submission Time</th>
                    <th className="border px-4 py-2">Full Name</th>
                    <th className="border px-4 py-2">
                      Email{" "}
                      <FontAwesomeIcon
                        icon={faCopy}
                        className="ml-2 cursor-pointer text-blue-500"
                        onClick={copyEmails}
                      />
                    </th>
                    <th className="border px-4 py-2">
                      Phone{" "}
                      <FontAwesomeIcon
                        icon={faCopy}
                        className="ml-2 cursor-pointer text-blue-500"
                        onClick={copyPhones}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {interestFormData?.map((item, index) => (
                    <tr key={index} className="text-left">
                      <td className="border px-4 py-2">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="border px-4 py-2">{item.full_name}</td>
                      <td className="border px-4 py-2">{item.email}</td>
                      <td className="border px-4 py-2">{item.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-8">
              <p>You are not able to view this page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
