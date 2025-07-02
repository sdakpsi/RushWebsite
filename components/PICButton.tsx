"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

interface PICButtonProps {
  is_pic: boolean | null;
}

const PICButton: React.FC<PICButtonProps> = ({ is_pic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Define the ref type

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return is_pic ? (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-elevation-low hover:shadow-elevation-medium transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
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
                className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-colors duration-150"
              >
                Prospects Page
              </Link>
            </li>
            <li>
              <Link
                href="/pic/comment-form"
                className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-colors duration-150"
              >
                Comment Forms
              </Link>
            </li>
            <li>
              <Link
                href="/pic/analytics"
                className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg mx-2 transition-colors duration-150"
              >
                Analytics
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  ) : null;
};

export default PICButton;
