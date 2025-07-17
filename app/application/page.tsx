import DeployButton from "@/components/DeployButton";
import React from "react";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import FetchDataSteps from "@/components/tutorial/FetchDataSteps";
import Header from "@/components/Header";
import { redirect } from "next/navigation";
import NextLinkButton from "../../components/NextLinkButton";
import { User } from "@supabase/supabase-js"; // Ensure you import the User type
import NameForm from "@/components/NameForm";
import { RUSH_YEAR, RUSH_CHAIR_INFO } from "@/utils/constants";

export default async function ProtectedPage() {
  const supabase = createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/");
  }

  // Check if user has uploaded a photo (required for application)
  const { data: userData } = await supabase
    .from("users")
    .select("is_active, photo_url")
    .eq("id", user.id)
    .single();

  // Redirect non-active users without photos back to main page
  if (userData?.is_active || !userData?.photo_url) {
    return redirect("/");
  }

  return (
    <div className="prospect-theme min-h-screen w-full prospect-bg relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-900/40 via-blue-800/20 to-transparent blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-white/15 to-transparent blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-slide-up">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto h-20 w-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {RUSH_YEAR} Rush Application
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              UCSD Alpha Kappa Psi
            </p>
            <div className="inline-flex items-center space-x-2 rounded-lg bg-white/10 border border-white/20 px-4 py-2">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-white">Due: Thursday, October 2nd at 2 PM</span>
            </div>
          </div>

          {/* Application Form Container */}
          <div className="prospect-card prospect-glass rounded-xl p-6">
            <div className="card-header">
              <h2 className="card-title text-white">Application Form</h2>
              <p className="card-description text-gray-300">
                Please complete all sections of the application form below. All fields marked with * are required.
              </p>
            </div>
            <div className="card-content">
              <NameForm />
              {/*<div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-blue-600 font-medium">Application Deadline Passed</p>
                </div>
                <p className="mt-2 text-sm text-blue-600">
                  The app deadline has passed. If you are concerned about a missing submission or have any questions, please {RUSH_CHAIR_INFO}!
                </p>
              </div>*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
