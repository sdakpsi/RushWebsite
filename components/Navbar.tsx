"use client";

import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import ActiveButton from "./ActiveButton";
import Link from "next/link";
import PICButton from "./PICButton";
import logo from "./akpsilogo.png";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { usePathname } from "next/navigation";
import RCButton from "./RCButton";
import navbg from "../app/navbar-bg.png";

interface NavbarProps {
  isPIC: boolean;
  isActive: boolean;
  user: User | null; // Use the appropriate type for your user object
}

export default function Navbar({ isPIC, isActive, user }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isInterestPage = pathname.endsWith("/interest");
  if (isInterestPage) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and title */}
        <Link href="/" className="flex items-center space-x-3 transition-opacity hover:opacity-80">
          <div className="relative">
            <Image
              src={logo}
              alt="UCSD AKPsi Logo"
              width={40}
              height={40}
              className="rounded-lg shadow-sm"
            />
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="flex flex-col">
            <span className="hidden font-semibold text-foreground sm:block xl:text-lg">
              UCSD Alpha Kappa Psi
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Professional Business Fraternity
            </span>
          </div>
        </Link>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 sm:hidden">
          <ActiveButton is_active={isActive} />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn-ghost p-2"
            aria-label="Toggle mobile menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-2 sm:flex">
          <PICButton is_pic={isPIC} />
          <ActiveButton is_active={isActive} />
          <RCButton is_active={isActive} />
          <AuthButton user={user} />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-lg sm:hidden">
          <div className="container px-4 py-4">
            <div className="flex flex-col space-y-3">
              <PICButton is_pic={isPIC} />
              <RCButton is_active={isActive} />
              <AuthButton user={user} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
