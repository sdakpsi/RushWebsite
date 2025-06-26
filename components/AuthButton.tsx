'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

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
  const signOut = async () => {
    // Call the sign-out API route
    await fetch('/api/signout', { method: 'POST' });
    window.location.href = '/';
  };

  return user ? (
    <div className="flex items-center gap-4">
      <div className="hidden items-center gap-3 sm:flex">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-1 ring-border/20">
          <span className="text-sm font-semibold text-primary">
            {user.user_metadata.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-muted-foreground max-w-32 truncate font-medium">
          {user.user_metadata.name || user.email}
        </span>
      </div>
      <button onClick={signOut} className="btn-ghost px-4 py-2.5 rounded-xl">
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  ) : (
    <button onClick={handleSignInWithGoogle} className="btn-primary px-6 py-2.5 rounded-xl shadow-elevation-medium hover:shadow-elevation-high transition-all duration-200">
      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m0 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      Login
    </button>
  );
};

export default AuthButton;
