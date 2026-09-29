"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface ActiveButtonProps {
  is_active: boolean | null;
}

const ActiveButton: React.FC<ActiveButtonProps> = ({ is_active }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when component unmounts or is_active changes
  useEffect(() => {
    if (!is_active) {
      setIsOpen(false);
    }
  }, [is_active]);

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

  return is_active ? (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center rounded-xl border border-periwinkle-300/40 bg-navy-800 px-5 py-3 text-sm font-medium text-periwinkle-300 shadow-xl transition-all duration-200 hover:bg-navy-700 hover:text-frost-100 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-periwinkle-300/50 focus:ring-offset-2 active:scale-95 touch-manipulation"
        onClick={toggleDropdown}
      >
        Active
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
                href="/active/comment-form"
                className="block px-4 py-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent"
                onClick={closeDropdown}
              >
                Comment Form
              </Link>
            </li>
            <li>
              <Link
                href="/active/case"
                className="block px-4 py-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent"
                onClick={closeDropdown}
              >
                Case Study
              </Link>
            </li>
            <li>
              <Link
                href="/active/interview"
                className="block px-4 py-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent"
                onClick={closeDropdown}
              >
                Interview
              </Link>
            </li>
            <li>
              <Link
                href="/active/delibs"
                className="block px-4 py-4 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-all duration-150 touch-manipulation active:scale-95 active:bg-accent"
                onClick={closeDropdown}
              >
                Delibs
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  ) : null; // Return null when `is_active` is not true
};

export default ActiveButton;
