import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NextLinkButton from '../../components/NextLinkButton';
import { User } from '@supabase/supabase-js'; // Ensure you import the User type
import { redirect } from 'next/navigation';
import ActiveLoginComponent from '@/components/ActiveLoginComponent';
import ApplicationButton from '@/components/ApplicationButton';
import ActiveSetter from '@/components/ActiveSetter';
import Link from 'next/link';
import styles from './styles.module.css';
import logo from './akpsilogo.png';
import Image from 'next/image';

export default async function ProtectedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/');
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full"></div>
      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <div className="flex flex-col">
          <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-2xl text-center mt-32">
            Welcome to the application portal!
          </p>
          <div className="flex mt-4 justify-center items-center">
            <ApplicationButton />
          </div>
          <p className="text-md lg:text-lg !leading-tight max-w-xl text-left mt-8 mb-2 px-10">
            The application is mandatory for consideration. Due Thursday, April
            11th.
          </p>
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        </div>
        <main className="flex flex-col justify-center items-center"></main>
      </div>
      <Link
        href="/active"
        className="absolute bottom-12 right-12 flex items-center justify-center h-16 w-16 rounded-full text-white text-lg font-bold transition duration-300 ease-in-out cursor-pointer"
      >
        <span className={'absolute w-40 h-40 flex items-center justify-center'}>
          <svg
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.animate}
          >
            <path
              id="circlePath"
              fill="none"
              stroke="none"
              strokeWidth="0"
              d="
                  M 20, 50
                  a 30,30 0 1,1 60,0
                  a 30,30 0 1,1 -60,0
                "
            />
            <text
              id="text"
              font-family="'Geist Sans', sans-serif"
              font-size="12"
              font-weight="bold"
              fill="white"
            >
              <textPath id="textPath" href="#circlePath">
                Actives click here!
              </textPath>
            </text>
          </svg>
        </span>
        <Image src={logo} alt="logo" />
      </Link>
    </div>
  );
}
