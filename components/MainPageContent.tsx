"use client";
import React, { useState } from 'react';
import Link from "next/link";
import GoogleOAuth from "@/components/GoogleOAuth";
import PhotoUploadWrapper from "@/components/PhotoUploadWrapper";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { RUSH_YEAR, RUSH_CHAIR_INFO, APPLICATION_OPEN } from "@/utils/constants";

export default function MainPageContent() {
  const { user, isActive, hasPhoto, photoUrl, isLoading } = useCurrentUser();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

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
    return null;
  }
  return (
    <div className="space-y-6">
      {/* Professional Headshot Requirement Notice */}
      {user && !hasPhoto && (
        <div className="rounded-lg bg-warning/10 border border-warning/30 p-4">
          <div className="flex items-start space-x-3">
            <svg className="h-6 w-6 text-warning mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="font-semibold text-warning mb-1">
                Picture Required
              </p>
              <p className="text-sm text-gray-300">
                You must upload a picture of yourself before you can access the application. Please ensure your photo is well-lit and shows your face clearly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Application Deadline Notice - only show if user has photo */}
      {hasPhoto && APPLICATION_OPEN && (
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

      {/* Application Closed Notice - show if applications are closed and user has photo */}
      {hasPhoto && !APPLICATION_OPEN && (
        <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
          <div className="flex items-start space-x-3">
            <svg className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-warning mb-1">
                Applications Closed
              </p>
              <p className="text-sm text-gray-300">
                Applications for {RUSH_YEAR} Rush have closed. Thank you for your interest!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {user ? (
        <div className="space-y-4">
          {/* Show application button only when applications are open and user has photo */}
          {hasPhoto && APPLICATION_OPEN && (
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
            <button 
              onClick={() => setIsPhotoModalOpen(true)}
              className={`w-full sm:w-auto flex items-center justify-center ${
                hasPhoto 
                  ? "btn-secondary" 
                  : "btn-primary"
              }`}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {hasPhoto ? "Update Photo" : "Upload Photo"}
            </button>
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

      {/* Photo Upload Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative bg-card border border-border rounded-xl p-6 m-4 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal content */}
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {hasPhoto ? "Update Your Photo" : "Upload Your Photo"}
              </h3>
              <p className="text-muted-foreground mb-3">
                {hasPhoto 
                  ? "You can update your photo anytime" 
                  : "A photo is required to access the application"
                }
              </p>
              {!hasPhoto && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-left">
                  <p className="text-sm font-medium text-warning mb-2">Professional Photo Guidelines:</p>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Clear, well-lit photo showing your face</li>
                    <li>• Neutral background preferred</li>
                    <li>• High resolution (avoid blurry images)</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Photo upload component */}
            <PhotoUploadWrapper existingPhotoUrl={photoUrl} />
          </div>
        </div>
      )}
    </div>
  );
}