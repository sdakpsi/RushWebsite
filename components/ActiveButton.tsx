'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return is_active ? (
    <div className="relative" ref={dropdownRef}>
      <button
        className="py-2 px-4 rounded-md bg-btn-background hover:bg-btn-background-hover focus:outline-none focus:ring flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        Active Portal
        <span className={`${isOpen ? 'rotate-180' : ''} inline-block ml-2`}>
          &#x25B4; {/* Unicode Downwards Arrow */}
        </span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 shadow-lg bg-btn-background rounded-md z-50">
          <ul className="py-1">
            <li>
              <Link
                href="/active/case"
                className="block py-2 px-4 hover:bg-btn-background-hover"
              >
                Case Study
              </Link>
            </li>
            <li>
              <Link
                href="/active/interview"
                className="block py-2 px-4 hover:bg-btn-background-hover"
              >
                Interview
              </Link>
            </li>
            <li>
              <Link
                href="/active/delibs"
                className="block py-2 px-4 hover:bg-btn-background-hover"
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
