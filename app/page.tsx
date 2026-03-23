"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import background from "./background.png";
import tagline from "./tagline.png";
import MainPageContent from "@/components/MainPageContent";
import { currentTheme } from "@/utils/theme";
import { useOptionalAuth } from "@/hooks/useOptionalAuth";

export default function Index() {
  const { isActive, hasAuthData } = useOptionalAuth();
  
  // Show active content when confirmed
  const displayAsActive = isActive && hasAuthData;
  // Never show loading state - just render content immediately
  const showLoadingState = false;
  
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
          imageRendering: "crisp-edges",
          backgroundAttachment: "fixed",
          filter: "contrast(1.1) brightness(1.05)",
        }}
      />

      {/* Main content area */}
      <div className="relative z-20 flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="flex flex-1 items-center justify-center px-4 py-8">
          <div className="mx-auto max-w-7xl">
            {/* Tagline */}
            <div className="mb-6 flex animate-slide-down justify-start">
              <Image
                src={tagline}
                alt="tagline"
                className="h-auto w-[85%] max-w-4xl md:w-[70%]"
                priority
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Left Column - Welcome Section */}
              <div className="space-y-6">
                <div className="prospect-card prospect-glass rounded-xl p-6 animate-slide-up">
                  <div className="card-header">
                    <h1 className="card-title text-white">
                      {displayAsActive
                        ? "Active Member Dashboard"
                        : `Thanks for Rushing ${currentTheme.branding.organization}!`}
                    </h1>
                  </div>

                  <div className="card-content space-y-6">
                    {showLoadingState ? (
                      // Loading state - only shown when no cached data
                      <div className="space-y-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="h-12 bg-gray-700 rounded"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : displayAsActive ? (
                      // Active user content
                      <div className="space-y-4">
                        <p className="text-gray-300">
                          Access your active member tools and resources.
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <Link href="/active/comment-form">
                            <button className="btn-secondary w-full transition-all duration-200 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white hover:shadow-lg">
                              <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
                                />
                              </svg>
                              Comment Forms
                            </button>
                          </Link>

                          <Link href="/active/case">
                            <button className="btn-secondary w-full transition-all duration-200 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white hover:shadow-lg">
                              {" "}
                              <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Case Studies
                            </button>
                          </Link>

                          <Link href="/active/interview">
                            <button className="btn-secondary w-full transition-all duration-200 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white hover:shadow-lg">
                              {" "}
                              <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              Interviews
                            </button>
                          </Link>

                          <Link href="/active/delibs">
                            <button className="btn-secondary w-full transition-all duration-200 hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white hover:shadow-lg">
                              {" "}
                              <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              Delibs
                            </button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      // Non-active user content
                      <div className="space-y-4">
                        <p className="text-gray-300">
                          Thank you for participating in {currentTheme.branding.rushYear} Rush! We appreciate your interest in {currentTheme.branding.organization} and wish you the best.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Link href={currentTheme.branding.website} className="flex-1">
                            <button className="prospect-btn-primary w-full transform transition-all rounded-lg px-4 py-2 text-sm font-medium">
                              Visit Our Website
                            </button>
                          </Link>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Get Started / Quick Actions */}
                {!displayAsActive ? (
                <div className="prospect-card prospect-glass rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                  <div className="card-header">
                    <h3 className="card-title text-white">
                      {displayAsActive ? "Quick Actions" : "Get Started"}
                    </h3>
                  </div>
                  <div className="card-content">
                    <MainPageContent />
                  </div>
                </div>
                ):(
                  <div></div>
                )} 
                {/* Quick Links */}
                <div className="prospect-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                  <div className="card-header">
                    <h3 className="card-title text-white">Quick Links</h3>
                  </div>
                  <div className="card-content space-y-3">
                    <a
                      href={currentTheme.branding.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="prospect-btn-secondary w-full rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-yellow-500 hover:text-white transition-all duration-200"
                    >
                      Official Website
                    </a>
                    <a
                      href="https://www.instagram.com/ucsdakpsi/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="prospect-btn-secondary w-full rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center hover:bg-gradient-to-r hover:from-red-500 hover:via-yellow-500 hover:via-green-500 hover:via-blue-500 hover:via-indigo-500 hover:to-purple-500 hover:text-white transition-all duration-200"
                    >
                      Instagram
                    </a>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="prospect-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
                  <div className="card-header">
                    <h3 className="card-title text-white">Need Help?</h3>
                  </div>
                  <div className="card-content">
                    {displayAsActive ?
                    (
                      <p className="text-sm text-gray-300">
                       To report any issues or questions please contact Ryan (909)-655-8447
                      </p>
                    ) : (
                      <p className="text-sm text-gray-300">
                      If you're having any issues or have questions, please{" "}
                      {currentTheme.branding.rushChairs}!
                    </p> 
                    )
                  }
                  </div>
                </div>
              </div>

              {/* Right Column - Rush Schedule Only */}
              <div className="space-y-6">
                {/* Enhanced Rush Schedule Timeline */}
                <div className="prospect-card rounded-xl p-6 animate-slide-up relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
                  {/* Background gradient glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
                  
                  <div className="card-header relative z-10">
                    <h3 className="card-title text-white mb-6 text-center">
                      <span className="text-white bg-clip-text text-transparent animate-shimmer">
                        Rush Schedule
                      </span>
                    </h3>
                  </div>
                  
                  <div className="card-content relative z-10">
                    {/* Timeline container with connecting line */}
                    <div className="relative">
                      {/* Vertical connecting line */}
                      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 via-purple-400 via-red-400 via-orange-400 to-indigo-400 opacity-30"></div>
                      
                      {/* Animated progress line */}
                      <div className="absolute left-6 top-8 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400 animate-progress-fill opacity-80 shadow-lg shadow-blue-400/50"></div>
                      
                      <div className="space-y-6 relative">
                        {/* Info Night */}
                        <div className="flex items-center gap-6 animate-timeline-entrance group" style={{ animationDelay: '0.3s' }}>
                          <div className="relative z-20">
                            <div className="w-12 h-12 prospect-glass bg-green-400/20 backdrop-blur-sm border border-green-400/30 rounded-xl flex items-center justify-center shadow-lg shadow-green-400/20 animate-timeline-glow group-hover:animate-magnetic-hover">
                              {/* Professional orb with app styling */}
                              <div className="w-4 h-4 bg-green-400 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-green-300/60 rounded-full animate-particle-float" style={{ animationDelay: '0s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-green-200/40 rounded-full animate-particle-float" style={{ animationDelay: '1.5s' }}></div>
                            </div>
                          </div>
                          <div className="flex-1 bg-green-400/10 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 transition-all duration-300 hover:bg-green-400/20 hover:border-green-400/50 hover:shadow-xl hover:shadow-green-400/20 hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-green-300 font-bold text-sm bg-green-400/20 px-2 py-1 rounded-full">Mon 4/6</span>
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="font-bold text-base text-white mb-1">Info Night</h4>
                            <p className="text-sm text-gray-300 mb-1">6 PM @ Price Center Theater | Casual Attire</p>
                            <p className="text-sm text-white">Come learn about Alpha Kappa Psi, hear brothers' experiences, and discuss career opportunities and professional development. Discover how you'll fit into our chapter's strong brotherhood!</p>
                          </div>
                        </div>

                        {/* Business Workshop */}
                        <div className="flex items-center gap-6 animate-timeline-entrance group" style={{ animationDelay: '0.4s' }}>
                          <div className="relative z-20">
                            <div className="w-12 h-12 prospect-glass bg-blue-400/20 backdrop-blur-sm border border-blue-400/30 rounded-xl flex items-center justify-center shadow-lg shadow-blue-400/20 animate-timeline-glow group-hover:animate-magnetic-hover">
                              {/* Professional orb with app styling */}
                              <div className="w-4 h-4 bg-blue-400 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-blue-300/60 rounded-full animate-particle-float" style={{ animationDelay: '0.5s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-blue-200/40 rounded-full animate-particle-float" style={{ animationDelay: '1.5s' }}></div>
                            </div>
                          </div>
                          <div className="flex-1 bg-blue-400/10 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4 transition-all duration-300 hover:bg-blue-400/20 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-400/20 hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-blue-300 font-bold text-sm bg-blue-400/20 px-2 py-1 rounded-full">Tue 4/7</span>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="font-bold text-base text-white mb-1">Business Workshop</h4>
                            <p className="text-sm text-gray-300 mb-1">8 PM @ Price Center - Ballroom B | Business Casual Attire</p>
                            <p className="text-sm text-white">Bring your resume (cover letter optional) for a career guidance session, and gain valuable insights from inspirational talks by our alumni guest speakers!</p>
                          </div>
                        </div>

                        {/* Case Study Night */}
                        <div className="flex items-center gap-6 animate-timeline-entrance group" style={{ animationDelay: '0.5s' }}>
                          <div className="relative z-20">
                            <div className="w-12 h-12 prospect-glass bg-purple-400/20 backdrop-blur-sm border border-purple-400/30 rounded-xl flex items-center justify-center shadow-lg shadow-purple-400/20 animate-timeline-glow group-hover:animate-magnetic-hover">
                              {/* Professional orb with app styling */}
                              <div className="w-4 h-4 bg-purple-400 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-purple-300/60 rounded-full animate-particle-float" style={{ animationDelay: '1s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-purple-200/40 rounded-full animate-particle-float" style={{ animationDelay: '2s' }}></div>
                            </div>
                          </div>
                          <div className="flex-1 bg-purple-400/10 backdrop-blur-sm border border-purple-400/30 rounded-xl p-4 transition-all duration-300 hover:bg-purple-400/20 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-400/20 hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-purple-300 font-bold text-sm bg-purple-400/20 px-2 py-1 rounded-full">Wed 4/8</span>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="font-bold text-base text-white mb-1">Case Study Night</h4>
                            <p className="text-sm text-gray-300 mb-1">By Appointment Only | Professional Attire</p>
                            <p className="text-sm text-white">Study a real-life business problem and test your teamwork and analytical skills! Case Study Night participation is mandatory for membership consideration.</p>
                          </div>
                        </div>

                        {/* Application Deadline - URGENT */}
                        <div className="flex items-center gap-6 animate-timeline-entrance group" style={{ animationDelay: '0.6s' }}>
                          <div className="relative z-20">
                            <div className="w-12 h-12 prospect-glass bg-red-400/20 backdrop-blur-sm border border-red-400/30 rounded-xl flex items-center justify-center shadow-lg shadow-red-400/20 animate-urgent-pulse group-hover:animate-magnetic-hover">
                              <div className="w-4 h-4 bg-red-400 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-red-300/60 rounded-full animate-particle-float" style={{ animationDelay: '1.5s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-red-200/40 rounded-full animate-particle-float" style={{ animationDelay: '2.5s' }}></div>
                            </div>
                          </div>
                          <div className="flex-1 bg-red-400/10 backdrop-blur-sm border border-red-400/30 rounded-xl p-4 transition-all duration-300 hover:bg-red-400/20 hover:border-red-400/50 hover:shadow-xl hover:shadow-red-400/20 hover:scale-[1.02] animate-urgent-pulse">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-red-300 font-bold text-sm bg-red-400/20 px-2 py-1 rounded-full animate-pulse">Thu 4/9</span>
                              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-red-200 font-semibold bg-red-500/20 px-2 py-1 rounded-full animate-pulse">DEADLINE</span>
                            </div>
                            <h4 className="font-bold text-base text-white mb-1">Application Due</h4>
                            <p className="text-sm text-gray-300">2:00 PM Deadline</p>
                          </div>
                        </div>

                        {/* Social Night */}
                        <div className="flex items-center gap-6 animate-timeline-entrance group" style={{ animationDelay: '0.7s' }}>
                          <div className="relative z-20">
                            <div className="w-12 h-12 prospect-glass bg-orange-400/20 backdrop-blur-sm border border-orange-400/30 rounded-xl flex items-center justify-center shadow-lg shadow-orange-400/20 animate-timeline-glow group-hover:animate-magnetic-hover">
                              {/* Professional orb with app styling */}
                              <div className="w-4 h-4 bg-orange-400 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-orange-300/60 rounded-full animate-particle-float" style={{ animationDelay: '2s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-orange-200/40 rounded-full animate-particle-float" style={{ animationDelay: '3s' }}></div>
                            </div>
                          </div>
                          <div className="flex-1 bg-orange-400/10 backdrop-blur-sm border border-orange-400/30 rounded-xl p-4 transition-all duration-300 hover:bg-orange-400/20 hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-400/20 hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-orange-300 font-bold text-sm bg-orange-400/20 px-2 py-1 rounded-full">Fri 4/9</span>
                              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="font-bold text-base text-white mb-1">Social Night</h4>
                            <p className="text-sm text-gray-300 mb-1">By Invite Only | Casual Attire</p>
                            <p className="text-sm text-white">Mingle with our brothers in a casual setting with food and drinks provided! Experience wholesome brotherhood within our tight-knit family in AKPsi.</p>
                          </div>
                        </div>

                        {/* Interviews */}
                        <div className="flex items-center gap-6 animate-timeline-entrance group" style={{ animationDelay: '0.8s' }}>
                          <div className="relative z-20">
                            <div className="w-12 h-12 prospect-glass bg-indigo-400/20 backdrop-blur-sm border border-indigo-400/30 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-400/20 animate-timeline-glow group-hover:animate-magnetic-hover">
                              {/* Professional orb with app styling */}
                              <div className="w-4 h-4 bg-indigo-400 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-indigo-300/60 rounded-full animate-particle-float" style={{ animationDelay: '2.5s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-indigo-200/40 rounded-full animate-particle-float" style={{ animationDelay: '3.5s' }}></div>
                            </div>
                          </div>
                          <div className="flex-1 bg-indigo-400/10 backdrop-blur-sm border border-indigo-400/30 rounded-xl p-4 transition-all duration-300 hover:bg-indigo-400/20 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-400/20 hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-indigo-300 font-bold text-sm bg-indigo-400/20 px-2 py-1 rounded-full">Sat 4/10</span>
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="font-bold text-base text-white mb-1">Interviews</h4>
                            <p className="text-sm text-gray-300 mb-1">By Appointment Only | Professional Attire</p>
                            <p className="text-sm text-white">Interview participation is mandatory for membership consideration.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

               
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}