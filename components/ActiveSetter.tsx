'use client';
import { createClient } from '@/utils/supabase/client';
import React, { useEffect, useState } from 'react';
import NextLinkButton from './NextLinkButton';
import ActiveLoginComponent from './ActiveLoginComponent';
import { redirect } from 'next/navigation';

export default async function ActiveSetter() {
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

  return (
    <div>
      <p className="text-xl lg:text-4xl !leading-tight text-center mb-2">
        Active Portal
      </p>
      {isActive ? (
        <div className="flex flex-col gap-6 mt-4 justify-center items-center">
          <NextLinkButton destination="/active/case">
            Case Study Portal
          </NextLinkButton>
          <NextLinkButton destination="/active/interview">
            Interview Portal
          </NextLinkButton>
          <NextLinkButton destination="/active/delibs">
            Delibs Portal
          </NextLinkButton>
        </div>
      ) : (
        <div className="flex mt-8 justify-center items-center">
          <ActiveLoginComponent />
        </div>
      )}
    </div>
  );
}
