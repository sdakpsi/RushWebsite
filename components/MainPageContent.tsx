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
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="montserrat-text-bold text-left text-lg lg:text-xl">
        {/* The application is now closed. */}
        <br></br>Due Thursday, April 10th at 2 PM.
      </p>
      
      {user ? (
        <>


          {/* Show photo upload for non-active users */}
          {!isActive && (
            <div className="mb-6 w-full max-w-md">
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {hasPhoto ? "Update Your Photo" : "Complete Your Profile"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {hasPhoto 
                      ? "You can change your photo anytime" 
                      : "Please upload a photo of yourself to continue with your application"
                    }
                  </p>
                </div>
                <PhotoUploadWrapper existingPhotoUrl={photoUrl} />
              </div>
            </div>
          )}

          {/* Show application button for active users or users with photos */}
          {(isActive || hasPhoto) && (
            <Link href="/application">
              <button className="montserrat-text-regular text-md rounded bg-btn-background px-6 py-2 text-white transition duration-300 hover:bg-btn-background-hover lg:text-lg">
                Application Form
              </button>
            </Link>
          )}
        </>
      ) : (
        <div className="flex justify-center">
          <GoogleOAuth />
        </div>
      )}
    </div>
  );
}