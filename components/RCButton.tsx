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
      <span className="flex items-center rounded-xl bg-gradient-to-r from-green-600/80 to-emerald-600/80 backdrop-blur-sm border border-green-400/30 text-white px-5 py-3 text-sm font-medium hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-2 shadow-xl hover:shadow-2xl transition-all duration-200 touch-manipulation active:scale-95 cursor-pointer">
              Rush Chair
            </span>
    </div>
  ) : null;
};

export default RCButton;
