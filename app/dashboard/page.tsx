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
    <div className="flex-1 flex w-full flex-col items-center gap-20">
      <div className="w-full"></div>
      <div className="animate-in flex max-w-4xl flex-1 flex-col gap-20 px-3 opacity-0">
        <div className="flex flex-col">
          <p className="mx-auto mt-32 max-w-2xl text-center text-3xl !leading-tight lg:text-4xl">
            Welcome to the application portal!
          </p>
          <div className="mt-4 flex items-center justify-center">
            <ApplicationButton />
          </div>
          <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
        </div>
        <main className="flex flex-col items-center justify-center"></main>
      </div>
    </div>
  );
}
