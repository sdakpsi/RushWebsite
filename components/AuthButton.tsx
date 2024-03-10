'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

function AuthButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user && window.location.pathname !== '/') {
        // Use window.location.pathname to check the path instead of href
        console.log('rerouting');
        window.location.href = '/';
      } else {
        setUser(user);
      }
    };

    fetchUser();
  }, []); // Empty dependency array to mimic componentDidMount behavior

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
      <Link
        href="/login"
        className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        Login
      </Link>
    </div>
  );
}

export default AuthButton;
