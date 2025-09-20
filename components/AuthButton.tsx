'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AuthButtonProps {
  user: User | null;
}

const handleSignInWithGoogle = async () => {
  const supabase = createClient();
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
  } catch (error: unknown) {
    // Type error as unknown
    // Now we need to narrow down the type of 'error' before we can access its properties
    if (error instanceof Error) {
      console.error('Error signing in with Google:', error.message);
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
};

const AuthButton: React.FC<AuthButtonProps> = ({ user }) => {
  const { photoUrl, hasPhoto, isActive, isPIC } = useCurrentUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const signOut = async () => {
    try {
      const supabase = createClient();
      
      // Sign out from Supabase directly
      await supabase.auth.signOut();
      
      // Clear React Query cache
      queryClient.clear();
      
      // Force page refresh to update server-rendered navbar
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback to page reload if there's an error
      window.location.href = '/';
    }
  };

  return user ? (
    <div className="flex items-center gap-4">
      <div className="hidden items-center gap-3 sm:flex">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ring-1 ring-border/20 overflow-hidden shadow-lg ${
          isPIC ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 shadow-purple-500/30' :
          isActive ? 'bg-gradient-to-br from-blue-500 via-cyan-600 to-blue-700 shadow-blue-500/30' :
          'bg-gradient-to-br from-primary/20 to-accent/20'
        }`}>
          {isPIC ? (
            <span className="text-xs font-black text-white">
              PIC
            </span>
          ) : isActive ? (
            <span className="text-[0.5rem] font-black text-white leading-none">
              ACTIVE
            </span>
          ) : hasPhoto && photoUrl ? (
            <Image
              src={photoUrl}
              alt="User profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-primary">
              {user.user_metadata.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-sm text-white-foreground max-w-32 truncate font-medium">
          {user.user_metadata.name || user.email}
        </span>
      </div>
      <button onClick={signOut} className="flex items-center rounded-xl bg-gradient-to-r from-red-500/80 to-rose-600/80 backdrop-blur-sm border border-red-400/30 text-white px-4 py-2.5 text-sm font-medium hover:from-red-500 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 shadow-xl hover:shadow-2xl transition-all duration-200 touch-manipulation active:scale-95">
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Logout</span>
      </button>
    </div>
  ) : (
    <button onClick={handleSignInWithGoogle} className="flex items-center rounded-xl bg-white border border-gray-300 text-black px-6 py-2.5 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 shadow-xl hover:shadow-2xl transition-all duration-200 touch-manipulation active:scale-95">
      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-5-4l5-5-5-5m5 5H3" />
      </svg>
      Login
    </button>
  );
};

export default AuthButton;
