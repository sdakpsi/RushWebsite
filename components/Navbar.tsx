'use client';

import AuthButton from '@/components/AuthButton';
import { createClient } from '@/utils/supabase/server';
import ActiveButton from './ActiveButton';
import Link from 'next/link';
import PICButton from './PICButton';
import logo from './akpsilogo.png';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { useState } from 'react';
import { MenuIcon } from '@heroicons/react/outline'; // Import a hamburger menu icon

interface NavbarProps {
  isPIC: boolean;
  isActive: boolean;
  user: User | null; // Use the appropriate type for your user object
}

export default function Navbar({ isPIC, isActive, user }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <nav className="w-full border-b border-b-foreground/10 h-16 px-4 sm:px-48">
      <div className="flex justify-between items-center w-full mt-3">
        {/* Logo and title, adjust size for mobile */}
        <Link href="/dashboard">
          <div className="flex flex-row items-center cursor-pointer">
            <Image
              src={logo}
              alt="logo"
              width={40}
              height={40}
              className="sm:w-[2rem] sm:mr-3"
            ></Image>
            <span className="hidden sm:block text-xl">UCSD Alpha Kappa Psi</span>{' '}
          </div>
        </Link>
        <div className="sm:hidden">
          <AuthButton user={user} />
          {/* Add any additional buttons or links you want in the mobile menu here */}
        </div>
        {/* Items to show on large screens */}
        <div className="hidden sm:flex gap-4 items-center">
          <PICButton is_pic={isPIC} />
          <ActiveButton is_active={isActive} />
          <AuthButton user={user} />
        </div>
      </div>

      {/* Mobile Menu, hidden by default, shown when menu is toggled */}
    </nav>
  );
}
