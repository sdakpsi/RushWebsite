"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";

interface PICButtonProps {
  is_active: boolean | null;
}
const RCButton: React.FC<PICButtonProps> = ({ is_active }) => {
  const router = useRouter();

  return is_active ? (
   
    <div 
    className="group flex items-center space-x-3 cursor-pointer"
    onClick={() => {
      router.push('/rcs');
      
    }}
    >
      <span className="flex items-center rounded-xl bg-navy-850 backdrop-blur-sm border border-periwinkle-400/40 text-periwinkle-400 px-5 py-3 text-sm font-medium hover:bg-navy-700 hover:text-frost-100 focus:outline-none focus:ring-2 focus:ring-periwinkle-400/50 focus:ring-offset-2 shadow-xl hover:shadow-2xl transition-all duration-200 touch-manipulation active:scale-95 cursor-pointer">
              Rush Chair
            </span>
    </div>
  ) : null;
};

export default RCButton;
