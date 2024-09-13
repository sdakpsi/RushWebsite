import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ApplicationButton from '@/components/ApplicationButton';

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
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        </div>
        <main className="flex flex-col justify-center items-center"></main>
      </div>
    </div>
  );
}
