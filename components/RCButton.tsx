"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

interface PICButtonProps {
  is_active: boolean | null;
}

const RCButton: React.FC<PICButtonProps> = ({ is_active }) => {
  return is_active ? (
    <div className="">
      <Link href="/rcs">
        <button className="flex items-center rounded-md bg-btn-background px-4 py-2 hover:bg-btn-background-hover focus:outline-none focus:ring">
          RCs
        </button>
      </Link>
    </div>
  ) : null;
};

export default RCButton;
