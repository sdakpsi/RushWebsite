"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

interface ActiveButtonProps {
  is_active: boolean | null;
}

const ActiveButton: React.FC<ActiveButtonProps> = ({ is_active }) => {
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

  return is_active ? (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center rounded-md bg-btn-background px-4 py-2 text-xs hover:bg-btn-background-hover focus:outline-none focus:ring lg:text-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        Active
        <span className={`${isOpen ? "rotate-180" : ""} ml-2 inline-block`}>
          &#x25B4; {/* Unicode Downwards Arrow */}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-btn-background shadow-lg">
          <ul className="py-1">
            <li>
              <Link
                href="/active/comment-form"
                className="block px-4 py-2 text-xs hover:bg-btn-background-hover lg:text-lg"
              >
                Comment Form
              </Link>
            </li>
            <li>
              <Link
                href="/active/case"
                className="block px-4 py-2 text-xs hover:bg-btn-background-hover lg:text-lg"
              >
                Case Study
              </Link>
            </li>
            <li>
              <Link
                href="/active/interview"
                className="block px-4 py-2 text-xs hover:bg-btn-background-hover lg:text-lg"
              >
                Interview
              </Link>
            </li>
            <li>
              <Link
                href="/active/delibs"
                className="block px-4 py-2 text-xs hover:bg-btn-background-hover lg:text-lg"
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
