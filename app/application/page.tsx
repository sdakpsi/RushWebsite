'use client';

import DeployButton from '@/components/DeployButton';
import React, { useEffect, useState } from 'react';
import AuthButton from '@/components/AuthButton';
import { createClient } from '@/utils/supabase/client';
import FetchDataSteps from '@/components/tutorial/FetchDataSteps';
import Header from '@/components/Header';
import { redirect } from 'next/navigation';
import NextLinkButton from '../../components/NextLinkButton';
import { User } from '@supabase/supabase-js'; // Ensure you import the User type

export default function ProtectedPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // If there's no user, perform client-side redirection to '/'
        window.location.href = '/';
      } else {
        setUser(user);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-lg">
            UCSD Alpha Kappa Psi
          </div>
          <AuthButton />
        </nav>
      </div>

      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <div className="flex flex-col">
          <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center mt-12">
            Application
          </p>
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        </div>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Property of{' '}
          <a
            href="https://www.akpsiucsd.com"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            UCSD Alpha Kappa Psi
          </a>
        </p>
      </footer>
    </div>
  );
}
