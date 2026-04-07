"use client";

import AuthButton from "@/components/AuthButton";
import ActiveButton from "./ActiveButton";
import PICButton from "./PICButton";
import logo from "./akpsiLogoBlack.png";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isActive, isPIC } = useCurrentUser();

  const isInterestPage = pathname?.endsWith("/interest");
  if (isInterestPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between px-6 lg:px-8">
        {/* Logo and title */}
        <div 
          className="group flex items-center space-x-3 cursor-pointer"
          onClick={() => {
            if (pathname !== '/') {
              router.push('/');
            }
          }}
        >
          <Image
            src={logo}
            alt="UCSD AKPsi Logo"
            width={40}
            height={40}
            className="rounded-lg group-hover:scale-110 group-hover:rotate-[145deg] transition-transform duration-500 ease-out"
          />
          <div className="flex flex-col">
            <span className="hidden font-semibold text-foreground sm:block xl:text-lg">
              UCSD Alpha Kappa Psi
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Professional Business Fraternity
            </span>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-3 sm:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="relative touch-manipulation rounded-xl border border-border bg-card p-3 shadow-sm transition-all duration-300 hover:bg-accent active:scale-95"
            aria-label="Toggle mobile menu"
          >
            <div className="relative h-6 w-6">
              <span className={`absolute left-0 top-2.5 h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "rotate-45" : "-translate-y-1.5 rotate-0"}`}></span>
              <span className={`absolute left-0 top-2.5 h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`}></span>
              <span className={`absolute left-0 top-2.5 h-0.5 w-6 rounded-full bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45" : "translate-y-1.5 rotate-0"}`}></span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 sm:flex">
          <PICButton is_pic={isPIC} />
          <ActiveButton is_active={isActive} />
          {/* <RCButton is_active={isActive} /> */}
          <AuthButton />
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`overflow-hidden transition-all duration-500 ease-out sm:hidden ${
        isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="relative border-t border-border bg-background/98 shadow-lg backdrop-blur-xl">
          <div className="container px-6 py-8">
            <div className="flex flex-col space-y-6">
              {/* PIC Section */}
              {isPIC && (
                <div className="group">
                  <div className="rounded-2xl border border-blue-500/35 bg-blue-500/10 p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
                        PIC Access
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 gap-2">
                        <Link
                          href="/pic"
                          className="block rounded-lg border border-border bg-card px-3 py-3 text-center text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 touch-manipulation"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Prospects Page
                        </Link>
                        <Link
                          href="/pic/comment-form"
                          className="block rounded-lg border border-border bg-card px-3 py-3 text-center text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 touch-manipulation"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Comment Forms
                        </Link>
                        <Link
                          href="/pic/case-studies"
                          className="block rounded-lg border border-border bg-card px-3 py-3 text-center text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 touch-manipulation"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Case Studies
                        </Link>
                        <Link
                          href="/pic/analytics"
                          className="block rounded-lg border border-border bg-card px-3 py-3 text-center text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 touch-manipulation"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Active Analytics
                        </Link>
                        <Link
                          href="/pic/prospect-analytics"
                          className="block rounded-lg border border-border bg-card px-3 py-3 text-center text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 touch-manipulation"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Prospect Analytics
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Section */}
              {isActive && (
                <div className="group">
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-600"></div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Active Access
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/active/comment-form"
                          className="block rounded-lg border border-border bg-card px-3 py-3 text-center text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 touch-manipulation"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Comment Form
                        </Link>
                        <Link
                          href="/active/case"
                          className="block rounded-lg border border-border bg-card px-3 py-3 text-center text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 touch-manipulation"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Case Study
                        </Link>
                        <Link
                          href="/active/interview"
                          className="block rounded-lg border border-border bg-card px-3 py-3 text-center text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 touch-manipulation"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Interview
                        </Link>
                        <Link
                          href="/active/delibs"
                          className="block rounded-lg border border-border bg-card px-3 py-3 text-center text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-accent hover:text-accent-foreground active:scale-95 touch-manipulation"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Delibs
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Section */}
              <div className="group">
                <div className="rounded-2xl border border-border bg-muted/40 p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60"></div>
                    <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Account
                    </div>
                  </div>
                  <AuthButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
