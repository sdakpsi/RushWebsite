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
        className="flex items-center rounded-md bg-btn-background px-4 py-2 text-xs hover:bg-btn-background-hover focus:outline-none focus:ring lg:text-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        PIC
        <span className={`${isOpen ? "rotate-180" : ""} ml-2 inline-block`}>
          &#x25B4; {/* Unicode Downwards Arrow */}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-btn-background shadow-lg">
          <ul className="py-1">
            <li>
              <Link
                href="/pic"
                className="block px-4 py-2 text-xs hover:bg-btn-background-hover lg:text-lg"
              >
                Prospects Page
              </Link>
            </li>
            <li>
              <Link
                href="/pic/comment-form"
                className="block px-4 py-2 text-xs hover:bg-btn-background-hover lg:text-lg"
              >
                Comment Forms
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  ) : null;
};

export default PICButton;
