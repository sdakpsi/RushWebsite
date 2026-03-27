'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RUSH_YEAR, APPLICATION_OPEN, RUSH_CHAIR_INFO, APPLICATION_DEADLINE } from '@/utils/constants';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import background from '../background.png';
import NameForm from '@/components/NameForm';

export default function ProtectedPage() {
  const { user, hasPhoto, isLoading, isActive } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !hasPhoto || isActive)) {
      router.push('/');
    }
  }, [user, hasPhoto, isLoading, router]);

  // Show loading while checking auth/photo status
  if (isLoading || !user || !hasPhoto) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="prospect-theme relative min-h-screen w-full overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-background"
        style={{
          backgroundImage: `url(${background.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          imageRendering: "crisp-edges",
          filter: "contrast(1.1) brightness(1.05)",
        }}
      />

      {/* Floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-900/40 via-blue-800/20 to-transparent blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-white/15 to-transparent blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content area */}
      <div className="relative z-20 flex min-h-screen flex-col">
        <section className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="mx-auto max-w-4xl w-full">
            {/* Header Section */}
            <div className="text-center mb-12 animate-slide-down">
              <div className="mx-auto h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6 animate-scale-in">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent mb-4">
                UCSD Alpha Kappa Psi
              </h1>
              <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-6">
                {RUSH_YEAR} Rush Application
              </h2>
              <div className="inline-flex items-center space-x-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2">
                <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-white">Due: {APPLICATION_DEADLINE}</span>
              </div>
            </div>


            {/* Application Form Container */}
            <div className="prospect-card prospect-glass rounded-xl p-8 animate-slide-up shadow-2xl border border-white/10" style={{ animationDelay: '0.3s' }}>
              {APPLICATION_OPEN === 'open' ? (
                <>
                  <div className="card-header mb-8">
                    <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      Application Form
                    </h3>
                    <p className="text-gray-300 text-lg">
                      Please complete all sections of the application form below. All fields marked with * are required.
                    </p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-6" />
                  </div>

                  <div className="card-content">
                    <NameForm />
                  </div>
                </>
              ) : APPLICATION_OPEN === 'coming_soon' ? (
                <div className="card-header text-center py-12">
                  <div className="mx-auto h-24 w-24 rounded-full bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center mb-6">
                    <svg className="h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Applications Opening Soon
                  </h3>
                  <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                    Applications for {RUSH_YEAR} Rush will be opening soon. Stay tuned for updates!
                  </p>
                  <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6 max-w-2xl mx-auto">
                    <p className="text-blue-200 text-base mb-2">
                      <strong>Questions? Reach out:</strong>
                    </p>
                    <p className="text-blue-100 text-sm">
                      {RUSH_CHAIR_INFO}
                    </p>
                  </div>
                  <div className="mt-8">
                    <a
                      href="/"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Return to Home
                    </a>
                  </div>
                </div>
              ) : (
                <div className="card-header text-center py-12">
                  <div className="mx-auto h-24 w-24 rounded-full bg-red-900/30 backdrop-blur-sm border border-red-500/30 flex items-center justify-center mb-6">
                    <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                    Applications Are Currently Closed
                  </h3>
                  <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                    Thank you for your interest in Alpha Kappa Psi! Applications for {RUSH_YEAR} Rush have closed.
                  </p>
                  <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6 max-w-2xl mx-auto">
                    <p className="text-blue-200 text-base mb-2">
                      <strong>If you had any issues please contact:</strong>
                    </p>
                    <p className="text-blue-100 text-sm">
                      {RUSH_CHAIR_INFO}
                    </p>
                  </div>
                  <div className="mt-8">
                    <a
                      href="/"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Return to Home
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}