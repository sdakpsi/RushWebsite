"use client";

import AuthButton from "@/components/AuthButton";
import ActiveButton from "./ActiveButton";
import PICButton from "./PICButton";
import logo from "./akpsilogo.png";
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
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-primary/20 backdrop-blur-lg">
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
            className="relative p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 shadow-lg touch-manipulation active:scale-95 transition-all duration-300 hover:shadow-xl hover:border-gray-500"
            aria-label="Toggle mobile menu"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute top-2.5 left-0 w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45' : 'rotate-0 -translate-y-1.5'}`}></span>
              <span className={`absolute top-2.5 left-0 w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute top-2.5 left-0 w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45' : 'rotate-0 translate-y-1.5'}`}></span>
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
        <div className="relative">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/98 to-black/95 backdrop-blur-xl"></div>
          
          {/* Glass morphism effect */}
          <div className="relative border-t border-white/10 shadow-2xl">
            <div className="container px-6 py-8">
              <div className="flex flex-col space-y-6">
                
                {/* PIC Section */}
                {isPIC && (
                  <div className="group">
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-5 shadow-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="text-xs font-bold text-blue-300 tracking-wider uppercase">PIC Access</div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {/* PIC Navigation Links */}
                        <div className="grid grid-cols-1 gap-2">
                          <Link
                            href="/pic"
                            className="block px-3 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent text-center bg-gray-700 hover:bg-gray-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Prospects Page
                          </Link>
                          <Link
                            href="/pic/comment-form"
                            className="block px-3 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent text-center bg-gray-700 hover:bg-gray-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Comment Forms
                          </Link>
                          <Link
                            href="/pic/analytics"
                            className="block px-3 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent text-center bg-gray-700 hover:bg-gray-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Analytics
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Active Section */}
                {isActive && (
                  <div className="group">
                    <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-5 shadow-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="text-xs font-bold text-green-300 tracking-wider uppercase">Active Access</div>
                      </div>
                      <div className="flex flex-col gap-3">
                        {/* <RCButton is_active={isActive} /> */}
                        {/* Active Navigation Links */}
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href="/active/comment-form"
                            className="block px-3 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent text-center bg-gray-700 hover:bg-gray-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Comment Form
                          </Link>
                          <Link
                            href="/active/case"
                            className="block px-3 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent text-center bg-gray-700 hover:bg-gray-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Case Study
                          </Link>
                          <Link
                            href="/active/interview"
                            className="block px-3 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent text-center bg-gray-700 hover:bg-gray-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Interview
                          </Link>
                          <Link
                            href="/active/delibs"
                            className="block px-3 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent text-center bg-gray-700 hover:bg-gray-600"
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
                  <div className="bg-gradient-to-r from-gray-600/20 to-slate-600/20 backdrop-blur-sm border border-gray-400/30 rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="text-xs font-bold text-gray-300 tracking-wider uppercase">Account</div>
                    </div>
                    <AuthButton />
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
