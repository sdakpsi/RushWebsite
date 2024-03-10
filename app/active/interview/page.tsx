import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NextLinkButton from '../../../components/NextLinkButton';
import { User } from '@supabase/supabase-js'; // Ensure you import the User type
import { redirect } from 'next/navigation';
import ActiveLoginComponent from '@/components/ActiveLoginComponent';

export default async function ProtectedPage() {
  const supabase = createClient();
  let isActive = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', user!.id)
      .single();
    isActive = data?.is_active;
  }
  if (!user) {
    return redirect('/');
  }

  const interviewProspects = ['aj', 'christen', 'hye won', 'khushal'];

  return (
    <div className="flex-1 w-full flex justify-center items-center">
      <div className="animate-in opacity-0 max-w-4xl w-full">
        <div className="flex flex-col justify-center">
          <p className="text-xl lg:text-4xl !leading-tight text-center mb-2">
            Interview Portal
          </p>
          {isActive ? (
            <div>
              <p className="text-xl lg:text-2xl !leading-tight text-left mb-2">
                Interview Prospects:
              </p>
              {interviewProspects.map((ivName, index) => (
                <p
                  key={index}
                  className="text-xl lg:text-xl !leading-tight text-left mb-2"
                >
                  {ivName}
                </p>
              ))}
            </div>
          ) : (
            <div className="flex mt-8 justify-center items-center">
              <ActiveLoginComponent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
