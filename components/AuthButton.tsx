import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js'; // Ensure you import the User type

const AuthButton = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log(user);
      setUser(user); // No need for the non-null assertion (!) anymore
    };

    fetchUser();
  }, []);

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
};

export default AuthButton;
