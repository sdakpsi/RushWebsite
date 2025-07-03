"use client";

import Link from "next/link";
import Image from "next/image";
import background from "./background.png";
import tagline from "./tagline.png";
import MainPageContent from "@/components/MainPageContent";
import { currentTheme } from "@/utils/theme";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Index() {
  const { isActive, isLoading, user } = useCurrentUser();

  // Only show loading for authenticated users
  if (isLoading && user) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background with dark theme overlay */}
        <div
          className="absolute inset-0 z-0 bg-background"
          style={{
            backgroundImage: `url(${background.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Loading state */}
        <div className="relative z-20 flex min-h-screen flex-col items-center justify-center">
          <div className="animate-pulse space-y-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/20"></div>
            <div className="space-y-2">
              <div className="mx-auto h-6 w-48 rounded bg-muted"></div>
              <div className="mx-auto h-4 w-32 rounded bg-muted/60"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background with dark theme overlay */}
      <div
        className="absolute inset-0 z-0 bg-background"
        style={{
          backgroundImage: `url(${background.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Floating elements for visual interest */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 animate-float rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
        <div
          className="absolute -bottom-24 -right-24 h-96 w-96 animate-float rounded-full bg-gradient-to-tl from-accent/20 to-transparent blur-3xl"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Main content area */}
      <div className="relative z-20 flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="mx-auto max-w-7xl">
            {/* Tagline */}
            <div className="mb-12 flex animate-slide-down justify-center">
              <Image
                src={tagline}
                alt="tagline"
                className="h-auto w-[85%] max-w-4xl md:w-[70%]"
                priority
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
              {/* Welcome Section */}
              <div className="lg:col-span-2">
                <div className="card glass animate-slide-up">
                  <div className="card-header">
                    <h1 className="card-title bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      {isActive
                        ? "Active Member Dashboard"
                        : `Welcome to ${currentTheme.branding.organization} ${currentTheme.branding.rushYear} Application Portal`}
                    </h1>
                  </div>

                  <div className="card-content space-y-6">
                    {isActive ? (
                      // Active user content
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
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
                        <p className="text-muted-foreground">
                          Please fill out the interest form below to receive
                          updates regarding rush!
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Link href="/interest" className="flex-1">
                            <button className="btn-primary w-full transform transition-all">
                              Interest Form
                            </button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Main Page Content */}
                    <MainPageContent />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Timer Card (when enabled) */}
                {/* <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="card-header">
                    <h3 className="card-title text-center">⏰ Rush Countdown</h3>
                  </div>
                  <div className="card-content">
                    <Timer />
                  </div>
                </div> */}

                {/* Quick Links */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Quick Links</h3>
                  </div>
                  <div className="card-content space-y-3">
                    <a
                      href={currentTheme.branding.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline w-full"
                    >
                      Official Website
                    </a>
                    <a
                      href="https://www.instagram.com/ucsdakpsi/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline w-full"
                    >
                      Instagram
                    </a>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Need Help?</h3>
                  </div>
                  <div className="card-content">
                    {isActive ?
                    (
                      <p className="text-sm text-muted-foreground">
                       To report any issues or questions please contact Ryan (909)-655-8447
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                      If you're having any issues or have questions, please{" "}
                      {currentTheme.branding.rushChairs}!
                    </p> 
                    )
                  }
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Notice */}
            <div
              className="mt-12 animate-fade-in text-center"
              style={{ animationDelay: "0.8s" }}
            >
              <p className="text-xs text-muted-foreground text-white">
                *When signing in, it will ask to continue to{" "}
                <span className="font-mono font-medium">
                  kvuilkasrtgyazkvxjal.supabase.co
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
