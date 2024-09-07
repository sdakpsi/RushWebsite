'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';

interface PICButtonProps {
  is_pic: boolean | null;
}

const RCButton: React.FC<PICButtonProps> = ({ is_pic }) => {
  return is_pic ? (
    <div className="">
      <Link href="/rcs">
        <button className="py-2 px-4 rounded-md bg-btn-background hover:bg-btn-background-hover focus:outline-none focus:ring flex items-center">
          RCs
        </button>
      </Link>
    </div>
  ) : null;
};

export default RCButton;
