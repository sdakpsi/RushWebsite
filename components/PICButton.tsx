"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface PICButtonProps {
  is_pic: boolean | null;
}

const PICButton: React.FC<PICButtonProps> = ({ is_pic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when is_pic changes
  useEffect(() => {
    if (!is_pic) {
      setIsOpen(false);
    }
  }, [is_pic]);

  // Memoized handlers
  const closeDropdown = useCallback(() => setIsOpen(false), []);
  const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), []);

  // Memoized click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClickOutside]);

  return is_pic ? (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center rounded-xl border border-blue-400/30 px-5 py-3 text-sm font-medium text-white shadow-xl transition-all duration-200 hover:brightness-110 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 active:scale-95 touch-manipulation"
        style={{
          background:
            "linear-gradient(to right, rgb(37 99 235 / 0.8), rgb(147 51 234 / 0.8))",
        }}
        onClick={toggleDropdown}
      >
        PIC
        <svg 
          className={`${isOpen ? "rotate-180" : ""} ml-2 h-4 w-4 transition-transform duration-200`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-52 rounded-xl bg-background border border-border shadow-elevation-high backdrop-blur-sm">
          <ul className="py-2">
            <li>
              <Link
                href="/pic"
                className="block px-4 py-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent"
                onClick={closeDropdown}
              >
                Prospects Page
              </Link>
            </li>
            <li>
              <Link
                href="/pic/comment-form"
                className="block px-4 py-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent"
                onClick={closeDropdown}
              >
                Comment Forms
              </Link>
            </li>
            <li>
              <Link
                href="/pic/case-studies"
                className="block px-4 py-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent"
                onClick={closeDropdown}
              >
                Case Studies
              </Link>
            </li>
            <li>
              <Link
                href="/pic/analytics"
                className="block px-4 py-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent"
                onClick={closeDropdown}
              >
                Active Analytics
              </Link>
            </li>
            <li>
              <Link
                href="/pic/prospect-analytics"
                className="block px-4 py-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent"
                onClick={closeDropdown}
              >
                Prospect Analytics
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  ) : null;
};

export default PICButton;
