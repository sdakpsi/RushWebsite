'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

interface PICButtonProps {
  is_pic: boolean | null;
}

const PICButton: React.FC<PICButtonProps> = ({ is_pic }) => {
  //   const [isOpen, setIsOpen] = useState(false);
  //   const dropdownRef = useRef<HTMLDivElement>(null); // Define the ref type

  //   // Handle clicks outside the dropdown to close it
  //   useEffect(() => {
  //     const handleClickOutside = (event: MouseEvent) => {
  //       if (
  //         dropdownRef.current &&
  //         !dropdownRef.current.contains(event.target as Node)
  //       ) {
  //         setIsOpen(false);
  //       }
  //     };

  //     document.addEventListener('mousedown', handleClickOutside);
  //     return () => document.removeEventListener('mousedown', handleClickOutside);
  //   }, []);

  return is_pic ? (
    <div className="">
      <Link href="pic">
        <button className="py-2 px-4 rounded-md bg-btn-background hover:bg-btn-background-hover focus:outline-none focus:ring flex items-center">
          PIC Portal
        </button>
      </Link>
    </div>
  ) : null; // Return null when `is_active` is not true
};

export default PICButton;
