"use client";
import React from 'react';
import Link from "next/link";
import GoogleOAuth from "@/components/GoogleOAuth";
import PhotoUploadWrapper from "@/components/PhotoUploadWrapper";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { RUSH_YEAR, RUSH_CHAIR_INFO } from "@/utils/constants";

export default function MainPageContent() {
  const { user, isActive, hasPhoto, photoUrl, isLoading } = useCurrentUser();

  // Show loading state while checking user data
  if (isLoading) {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }
  if (isActive) {
    return
  }
  return (
    <div className="space-y-6">
      {(hasPhoto) && (
        <div className="rounded-lg bg-info/10 border border-info/20 p-4">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-semibold text-info">
              Application Due: Thursday, October 2nd at 2 PM
            </p>
          </div>
        </div>
      )}
      
      {user ? (
        <div className="space-y-4">
          {/* Show application button for active users or users with photos */}
          {(hasPhoto) && (
            <Link href="/application" className="inline-block">
              <button className="btn-primary w-full sm:w-auto">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Application
              </button>
            </Link>
          )}
          
          {/* Show photo upload for non-active users */}
          {!isActive && (
            <div className="card glass">
              <div className="card-header text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="card-title text-lg">
                  {hasPhoto ? "Update Your Photo" : "Complete Your Profile"}
                </h3>
                <p className="card-description">
                  {hasPhoto 
                    ? "You can change your photo anytime" 
                    : "Please upload a photo of yourself to continue with your application"
                  }
                </p>
              </div>
              <div className="card-content">
                <PhotoUploadWrapper existingPhotoUrl={photoUrl} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="mx-auto max-w-md">
            <p className="text-med font-semibold mb-2">
              Please sign in to access the application portal.
            </p>
            <div className="flex justify-center">
              <GoogleOAuth />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}