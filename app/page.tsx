"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import background from "./fall26background.jpeg";
import tagline from "./fall26tagline.png";
import MainPageContent from "@/components/MainPageContent";
import { currentTheme } from "@/utils/theme";
import { APPLICATION_DEADLINE, RUSH_EMAIL } from "@/utils/constants";
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
          <div className="mx-auto w-full max-w-7xl">
            {/* Tagline */}
            <div className="mb-6 flex animate-slide-down justify-start">
              <Image
                src={tagline}
                alt="Into full bloom"
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
                    <h1 className="card-title text-foreground">
                      {displayAsActive
                        ? "Active Member Dashboard"
                        : `Thank You for Visiting ${currentTheme.branding.organization}`}
                    </h1>
                  </div>

                  <div className="card-content space-y-6">
                    {showLoadingState ? (
                      // Loading state - only shown when no cached data
                      <div className="space-y-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-navy-800 rounded w-3/4 mb-3"></div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="h-12 bg-navy-800 rounded"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : displayAsActive ? (
                      // Active user content
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          Access your active member tools and resources.
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <Link href="/active/comment-form">
                            <button className="btn-secondary w-full transition-all duration-200 hover:shadow-lg">
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
                            <button className="btn-secondary w-full transition-all duration-200 hover:shadow-lg">
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
                            <button className="btn-secondary w-full transition-all duration-200 hover:shadow-lg">
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
                            <button className="btn-secondary w-full transition-all duration-200 hover:shadow-lg">
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
                        <p className="text-muted-foreground">
                          If you are interested in learning more about upcoming rush opportunities, please complete the interest form below.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Link href="https://docs.google.com/forms/d/e/1FAIpQLSdJYewWBkiy7ryWcwB5a617X8uvAwhsMndle5C3pDKCZ_h_Pw/viewform" className="flex-1">
                            <button className="prospect-btn-primary w-full transform transition-all rounded-lg px-4 py-2 text-sm font-medium">
                               Interest Form
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
                    <h3 className="card-title text-foreground">
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
                    <h3 className="card-title text-foreground">Quick Links</h3>
                  </div>
                  <div className="card-content space-y-3">
                    <a
                      href={currentTheme.branding.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="prospect-btn-secondary w-full rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center transition-all duration-200"
                    >
                      Official Website
                    </a>
                    <a
                      href={currentTheme.branding.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="prospect-btn-secondary w-full rounded-lg px-4 py-2 text-sm font-medium inline-flex items-center justify-center transition-all duration-200"
                    >
                      Instagram
                    </a>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="prospect-card rounded-xl p-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
                  <div className="card-header">
                    <h3 className="card-title text-foreground">Need Help?</h3>
                  </div>
                  <div className="card-content">
                    {displayAsActive ?
                    (
                      <p className="text-sm text-muted-foreground">
                       To report any issues or questions please contact Yathin/George/Arish
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                      If you&apos;re having any issues or have questions, contact {currentTheme.branding.rushChairs}, or email{" "}
                      <a className="underline hover:text-foreground" href={`mailto:${RUSH_EMAIL}`}>
                        {RUSH_EMAIL}
                      </a>.
                    </p> 
                    )
                  }
                  </div>
                </div>
              </div>

              {/* Right Column - Rush Schedule Only */}
              <div className="space-y-6">
                {/* Enhanced Rush Schedule Timeline */}
                <div className="prospect-card rounded-xl p-4 sm:p-6 animate-slide-up relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
                  <div className="card-header relative z-10">
                    <h3 className="card-title text-foreground mb-6 text-center">
                      <span className="text-foreground">
                        Rush Schedule
                      </span>
                    </h3>
                  </div>
                  
                  <div className="card-content relative z-10">
                    {/* Timeline container with connecting line */}
                    <div className="relative">
                      {/* Vertical connecting line */}
                      <div className="absolute left-5 sm:left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-periwinkle-400 via-periwinkle-300 via-frost-300 via-frost-200 to-frost-100 opacity-30"></div>
                      
                      {/* Animated progress line */}
                      <div className="absolute left-5 sm:left-6 top-8 w-0.5 bg-gradient-to-b from-periwinkle-400 via-periwinkle-300 to-frost-300 animate-progress-fill opacity-80 shadow-lg shadow-periwinkle-300/50"></div>
                      
                      <div className="space-y-6 relative">
                        {/* Info Night */}
                        <div className="group flex items-start gap-3 sm:items-center sm:gap-6 animate-timeline-entrance" style={{ animationDelay: '0.3s' }}>
                          <div className="relative z-20 flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 prospect-glass bg-periwinkle-400/20 backdrop-blur-sm border border-periwinkle-400/30 rounded-xl flex items-center justify-center shadow-lg shadow-periwinkle-400/20 animate-timeline-glow group-hover:animate-magnetic-hover">
                              {/* Professional orb with app styling */}
                              <div className="w-4 h-4 bg-periwinkle-400 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-periwinkle-300/60 rounded-full animate-particle-float" style={{ animationDelay: '0s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-periwinkle-300/40 rounded-full animate-particle-float" style={{ animationDelay: '1.5s' }}></div>
                            </div>
                          </div>
                          <div className="rush-schedule-panel min-w-0 flex-1 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="whitespace-nowrap text-navy-950 font-bold text-sm bg-periwinkle-300 px-2 py-1 rounded-full">Mon 10/5</span>
                              <div className="w-2 h-2 bg-periwinkle-400 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="font-bold text-base text-foreground mb-1">Info Night</h4>
                            <p className="text-sm text-muted-foreground mb-1">6:00 PM @ The Jeannie | Casual Attire</p>
                            <p className="text-sm text-foreground">Come learn about Alpha Kappa Psi, hear brothers’ experiences, and discuss career opportunities and professional development. Discover how you’ll fit into our chapter’s strong brotherhood.</p>
                          </div>
                        </div>

                        {/* Business Workshop */}
                        <div className="group flex items-start gap-3 sm:items-center sm:gap-6 animate-timeline-entrance" style={{ animationDelay: '0.4s' }}>
                          <div className="relative z-20 flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 prospect-glass bg-periwinkle-300/20 backdrop-blur-sm border border-periwinkle-300/30 rounded-xl flex items-center justify-center shadow-lg shadow-periwinkle-300/20 animate-timeline-glow group-hover:animate-magnetic-hover">
                              {/* Professional orb with app styling */}
                              <div className="w-4 h-4 bg-periwinkle-300 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-frost-200/60 rounded-full animate-particle-float" style={{ animationDelay: '0.5s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-frost-200/40 rounded-full animate-particle-float" style={{ animationDelay: '1.5s' }}></div>
                            </div>
                          </div>
                          <div className="rush-schedule-panel min-w-0 flex-1 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="whitespace-nowrap text-navy-950 font-bold text-sm bg-frost-200 px-2 py-1 rounded-full">Tue 10/6</span>
                              <div className="w-2 h-2 bg-periwinkle-300 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="font-bold text-base text-foreground mb-1">Business Workshop</h4>
                            <p className="text-sm text-muted-foreground mb-1">7:00 PM @ Price Center Ballroom West | Business Casual Attire</p>
                            <p className="text-sm text-foreground">Bring your resume; a cover letter is optional. Receive personalized career guidance and gain valuable insights from inspirational talks by alumni guest speakers.</p>
                          </div>
                        </div>

                        {/* Case Study Night */}
                        <div className="group flex items-start gap-3 sm:items-center sm:gap-6 animate-timeline-entrance" style={{ animationDelay: '0.5s' }}>
                          <div className="relative z-20 flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 prospect-glass bg-frost-300/20 backdrop-blur-sm border border-frost-300/30 rounded-xl flex items-center justify-center shadow-lg shadow-frost-300/20 animate-timeline-glow group-hover:animate-magnetic-hover">
                              {/* Professional orb with app styling */}
                              <div className="w-4 h-4 bg-frost-300 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-frost-200/60 rounded-full animate-particle-float" style={{ animationDelay: '1s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-frost-300/40 rounded-full animate-particle-float" style={{ animationDelay: '2s' }}></div>
                            </div>
                          </div>
                          <div className="rush-schedule-panel min-w-0 flex-1 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="whitespace-nowrap text-navy-950 font-bold text-sm bg-frost-300 px-2 py-1 rounded-full">Wed 10/7</span>
                              <div className="w-2 h-2 bg-frost-300 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="font-bold text-base text-foreground mb-1">Case Study Night</h4>
                            <p className="text-sm text-muted-foreground mb-1">By Appointment Only | Professional Attire</p>
                            <p className="text-sm text-foreground">Tackle a real-life business problem and test your teamwork and analytical skills. Participation in Case Study Night is mandatory for membership consideration.</p>
                          </div>
                        </div>

                        {/* Application Deadline - URGENT */}
                        {APPLICATION_DEADLINE && (
                          <div className="group flex items-start gap-3 sm:items-center sm:gap-6 animate-timeline-entrance" style={{ animationDelay: '0.6s' }}>
                            <div className="relative z-20 flex-shrink-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 prospect-glass bg-red-400/20 backdrop-blur-sm border border-red-400/30 rounded-xl flex items-center justify-center shadow-lg shadow-red-400/20 animate-urgent-pulse group-hover:animate-magnetic-hover">
                                <div className="w-4 h-4 bg-red-400 rounded-lg shadow-sm animate-gentle-breathe"></div>
                                <div className="absolute w-1 h-1 bg-red-300/60 rounded-full animate-particle-float" style={{ animationDelay: '1.5s' }}></div>
                                <div className="absolute w-0.5 h-0.5 bg-red-200/40 rounded-full animate-particle-float" style={{ animationDelay: '2.5s' }}></div>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 bg-red-400/10 backdrop-blur-sm border border-red-400/30 rounded-xl p-4 transition-all duration-300 hover:bg-red-400/20 hover:border-red-400/50 hover:shadow-xl hover:shadow-red-400/20 hover:scale-[1.01] animate-urgent-pulse">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="whitespace-nowrap text-red-300 font-bold text-sm bg-red-400/20 px-2 py-1 rounded-full animate-pulse">Wed 10/7</span>
                                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-red-200 font-semibold bg-red-500/20 px-2 py-1 rounded-full animate-pulse">DEADLINE</span>
                              </div>
                              <h4 className="font-bold text-base text-foreground mb-1">Application Due</h4>
                              <p className="text-sm text-muted-foreground">{APPLICATION_DEADLINE}</p>
                            </div>
                          </div>
                        )}

                        {/* Social Night */}
                        <div className="group flex items-start gap-3 sm:items-center sm:gap-6 animate-timeline-entrance" style={{ animationDelay: '0.7s' }}>
                          <div className="relative z-20 flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 prospect-glass bg-frost-200/20 backdrop-blur-sm border border-frost-200/30 rounded-xl flex items-center justify-center shadow-lg shadow-frost-200/20 animate-timeline-glow group-hover:animate-magnetic-hover">
                              {/* Professional orb with app styling */}
                              <div className="w-4 h-4 bg-frost-200 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-frost-100/60 rounded-full animate-particle-float" style={{ animationDelay: '2s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-frost-200/40 rounded-full animate-particle-float" style={{ animationDelay: '3s' }}></div>
                            </div>
                          </div>
                          <div className="rush-schedule-panel min-w-0 flex-1 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="whitespace-nowrap text-navy-950 font-bold text-sm bg-frost-200 px-2 py-1 rounded-full">Thu 10/8</span>
                              <div className="w-2 h-2 bg-frost-200 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="font-bold text-base text-foreground mb-1">Social Night</h4>
                            <p className="text-sm text-muted-foreground mb-1">By Invite Only | Casual Attire</p>
                            <p className="text-sm text-foreground">Mingle with the brothers in a casual setting with food and drinks provided. Experience the chapter’s close-knit brotherhood.</p>
                          </div>
                        </div>

                        {/* Interviews */}
                        <div className="group flex items-start gap-3 sm:items-center sm:gap-6 animate-timeline-entrance" style={{ animationDelay: '0.8s' }}>
                          <div className="relative z-20 flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 prospect-glass bg-frost-100/20 backdrop-blur-sm border border-frost-100/30 rounded-xl flex items-center justify-center shadow-lg shadow-frost-100/20 animate-timeline-glow group-hover:animate-magnetic-hover">
                              {/* Professional orb with app styling */}
                              <div className="w-4 h-4 bg-frost-100 rounded-lg shadow-sm animate-gentle-breathe"></div>
                              <div className="absolute w-1 h-1 bg-frost-100/60 rounded-full animate-particle-float" style={{ animationDelay: '2.5s' }}></div>
                              <div className="absolute w-0.5 h-0.5 bg-frost-100/40 rounded-full animate-particle-float" style={{ animationDelay: '3.5s' }}></div>
                            </div>
                          </div>
                          <div className="rush-schedule-panel min-w-0 flex-1 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="whitespace-nowrap text-navy-950 font-bold text-sm bg-frost-100 px-2 py-1 rounded-full">Fri 10/9</span>
                              <div className="w-2 h-2 bg-frost-100 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="font-bold text-base text-foreground mb-1">Interviews</h4>
                            <p className="text-sm text-muted-foreground mb-1">By Appointment Only | Professional Attire</p>
                            <p className="text-sm text-foreground">Interview participation is mandatory for membership consideration.</p>
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
