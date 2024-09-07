import DeployButton from '@/components/DeployButton';
import React from 'react';
import AuthButton from '@/components/AuthButton';
import { createClient } from '@/utils/supabase/server';
import FetchDataSteps from '@/components/tutorial/FetchDataSteps';
import Header from '@/components/Header';
import { redirect } from 'next/navigation';
import NextLinkButton from '../../components/NextLinkButton';
import { User } from '@supabase/supabase-js'; // Ensure you import the User type
import NameForm from '@/components/NameForm';

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
      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <div className="flex flex-col">
          <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center mt-12">
            UCSD Alpha Kappa Psi
          </p>
          <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
            Spring '24 Rush Application
          </p>
          <p className="text-gray-500 mt-4">
            If you're having any issues or have any questions, please contact
            Ally or Val @ (916)841-7952 / (408)805-2888!
          </p>
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
          <NameForm />
          <p className="text-md lg:text-lg !leading-tight max-w-xl text-left mt-8 mb-2 px-10">
            If you're having any issues or have any questions, please contact
            Ally or Val @ (916)841-7952 / (408)805-2888!
          </p>
        </div>
      </div>
    </div>
  );
}
