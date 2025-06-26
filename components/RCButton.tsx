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
      router.push('rcs');
      
    }}
    >
      <span className="flex items-center rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-elevation-low hover:shadow-elevation-medium transition-all duration-200">
              Rush Chair
            </span>
    </div>
  ) : null;
};

export default RCButton;
