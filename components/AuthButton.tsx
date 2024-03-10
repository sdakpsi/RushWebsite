'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthButtonProps {
  user: User | null;
}

const AuthButton: React.FC<AuthButtonProps> = ({ user }) => {
  const signOut = async () => {
    // Call the sign-out API route
    await fetch('/api/signout', { method: 'POST' });
    window.location.href = '/';
  };

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.user_metadata.name} ({user.email})!
      <button
        onClick={signOut}
        className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        Login
      </Link>
    </div>
  );
};

export default AuthButton;
