
import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NextLinkButton from '../../components/NextLinkButton';
import { User } from '@supabase/supabase-js'; // Ensure you import the User type
import { redirect } from 'next/navigation';
import ActiveLoginComponent from '@/components/ActiveLoginComponent';

export default async function ProtectedPage() {
  const supabase = createClient();
  const {
  data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
  return redirect("/");
  }


  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
      </div>

      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <div className="flex flex-col">
          <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center mt-32">
            Please choose your role:
          </p>
          <p className="text-xl lg:text-xl !leading-tight max-w-xl text-left mt-8 mb-2">
            For rushees:
          </p>
          The application is mandatory for consideration. Due Thursday, April
          11th.
          <div className="flex mt-4 justify-center items-center">
            <NextLinkButton destination="application">
              Application
            </NextLinkButton>
          </div>
            <ActiveLoginComponent />
      
    
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        </div>
        <main className="flex flex-col justify-center items-center"></main>
      </div>
      <Footer />
    </div>
  );
}
