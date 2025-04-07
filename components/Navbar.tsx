"use client";

import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import ActiveButton from "./ActiveButton";
import Link from "next/link";
import PICButton from "./PICButton";
import logo from "./akpsilogo.png";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { usePathname } from "next/navigation";
import RCButton from "./RCButton";
import navbg from "../app/navbar-bg.png";

interface NavbarProps {
  isPIC: boolean;
  isActive: boolean;
  user: User | null; // Use the appropriate type for your user object
}

export default function Navbar({ isPIC, isActive, user }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isInterestPage = pathname.endsWith("/interest");
  if (isInterestPage) {
    return null;
  }

  return (
    <nav
      className="w-full border-b border-white bg-transparent px-4 pb-6 pt-6 sm:px-48"
      style={{
        backgroundImage: `url(${navbg.src})`,

        backgroundSize: "cover",

        backgroundPosition: "center",

        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="mt-3 flex w-full items-center justify-between">
        {/* Logo and title, adjust size for mobile */}
        <Link href="/">
          <div className="flex cursor-pointer flex-row items-center">
            <Image
              src={logo}
              alt="logo"
              width={40}
              height={40}
              className="sm:mr-3 sm:w-[2rem]"
            ></Image>
            <span className="hidden xl:block xl:text-xl">
              UCSD Alpha Kappa Psi
            </span>{" "}
          </div>
        </Link>
        <div className="flex flex-row gap-3 sm:hidden">
          <ActiveButton is_active={isActive} />
          <AuthButton user={user} />
          {/* Add any additional buttons or links you want in the mobile menu here */}
        </div>
        {/* Items to show on large screens */}
        <div className="hidden items-center gap-4 sm:flex">
          <PICButton is_pic={isPIC} />
          <ActiveButton is_active={isActive} />
          <RCButton is_active={isActive} />
          <AuthButton user={user} />
        </div>
      </div>

      {/* Mobile Menu, hidden by default, shown when menu is toggled */}
    </nav>
  );
}
