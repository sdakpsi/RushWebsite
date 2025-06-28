"use client";
import React from "react";
import NextLinkButton from "./NextLinkButton";
import ActiveLoginComponent from "./ActiveLoginComponent";
import { useActiveStatus } from "@/hooks/useActiveStatus";
import LoadingSpinner from "./LoadingSpinner";

export default function ActiveSetter() {
  const { isActive, isLoading } = useActiveStatus();

  if (isLoading) {
    return <LoadingSpinner />; // Placeholder for a loading state
  }

  return (
    <div>
    
      {isActive ? (
        <div className="mt-4 flex flex-col items-center justify-center gap-6">
          <NextLinkButton destination="/active/comment-form">
            Comment Form
          </NextLinkButton>
          <NextLinkButton destination="/active/case">
            Case Study Portal
          </NextLinkButton>
          <NextLinkButton destination="/active/interview">
            Interview Portal
          </NextLinkButton>
          <NextLinkButton destination="/active/delibs">
            Delibs Portal
          </NextLinkButton>
        </div>
      ) : (
        <div className="mt-8 flex items-center justify-center">
          <ActiveLoginComponent />
        </div>
      )}
    </div>
  );
}
