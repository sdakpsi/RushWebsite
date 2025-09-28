'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RUSH_YEAR } from '@/utils/constants';
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
                <span className="font-medium text-white">Due: Thursday, October 2nd at 2 PM</span>
              </div>
            </div>


            {/* Application Form Container */}
            <div className="prospect-card prospect-glass rounded-xl p-8 animate-slide-up shadow-2xl border border-white/10" style={{ animationDelay: '0.3s' }}>
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
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}