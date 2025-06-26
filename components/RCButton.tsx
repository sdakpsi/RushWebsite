"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

interface PICButtonProps {
  is_active: boolean | null;
}

const RCButton: React.FC<PICButtonProps> = ({ is_active }) => {
  return is_active ? (
    <Link href="/rcs">
      <button className="flex items-center rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-elevation-low hover:shadow-elevation-medium transition-all duration-200">
        RCs
      </button>
    </Link>
  ) : null;
};

export default RCButton;
