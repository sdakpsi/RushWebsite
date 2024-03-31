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
      Hey, {user.user_metadata.name}!
      <button
        onClick={signOut}
        className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSignInWithGoogle}
        className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        Login
      </button>
    </div>
  );
};

export default AuthButton;
