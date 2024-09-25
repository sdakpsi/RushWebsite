"use client";

import React, { useEffect, useState } from "react";
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
  const [interestFormData, setInterestFormData] = useState<
    InterestFormSubmission[]
  >([]);
  const [isPIC, setIsPIC] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true); // Begin loading
    try {
      const usersData = await getInterestFormSubmissions();
      setInterestFormData(usersData);
      const picStatus = await getIsPIC();
      setIsPIC(picStatus);
      setIsLoading(false); // End loading
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false); // Ensure loading is ended even if there is an error
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyToClipboard = (data: string) => {
    navigator.clipboard.writeText(data);
    toast.success("Copied to clipboard!");
  };

  const copyEmails = () => {
    const emails = interestFormData.map((item) => item.email).join(", ");
    copyToClipboard(emails);
  };

  const copyPhones = () => {
    const phones = interestFormData.map((item) => item.phone).join(", ");
    copyToClipboard(phones);
  };

  if (isLoading) {
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
                  onClick={fetchData}
                />
              </p>
              <table className="mt-4 min-w-full border-gray-200 bg-black text-left">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">#</th>
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
                  {interestFormData.map((item, index) => (
                    <tr key={index} className="text-left">
                      <td className="border px-4 py-2">{index + 1}</td>
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
