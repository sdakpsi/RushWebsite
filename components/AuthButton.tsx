"use client"
import Link from 'next/link';
import React from 'react';
import {createClient} from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const AuthButton = ({ user }) => {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
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
};

export default AuthButton;