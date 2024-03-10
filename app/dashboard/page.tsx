'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

  const [inputValue, setInputValue] = useState<string>('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the form from actually submitting

    if (inputValue === 'hyewonsucks') {
      // Call your API function here
      console.log('Correct phrase entered. Make API call here.');
      makeApiCall(); // This is where you can later define your API call logic
    } else {
      console.log('Incorrect phrase. No API call made.');
    }
  };

  // Dummy function to represent the API call
  const makeApiCall = () => {
    console.log('Making API call...');
    // Define your API call logic here
  };

  // If user data is still being fetched, you might want to render a loading state or nothing
  if (user === undefined) return <div>Loading...</div>;

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <Navbar />
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
          <p className="text-xl lg:text-xl !leading-tight max-w-xl text-left mt-8 mb-2">
            For actives:
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex mt-4 justify-center items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition duration-300 text-black"
              placeholder="Enter your phrase"
            />

            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
            >
              Submit
            </button>
          </form>
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        </div>
        <main className="flex flex-col justify-center items-center"></main>
      </div>

      <Footer />
    </div>
  );
}
