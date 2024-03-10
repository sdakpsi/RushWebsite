"use client";
import { createClient } from '@/utils/supabase/client';
import React from 'react'


export default function GoogleOAuth() {
    // Function to handle sign-in with Google
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
      } catch (error) {
          console.error('Error signing in with Google:', error.message);
      }
  };
  
    return (
      <button className="flex items-center justify-center bg-white w-1/2 text-black px-4 py-2 border rounded shadow-sm hover:bg-gray-100"
      onClick={handleSignInWithGoogle}>
        <svg
          className="w-6 h-6 mr-2 -ml-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
        >
          <path
            d="M44.5 20H24v8h11.8C34.7 36.9 30.1 40 24 40c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 7.1 29.6 5 24 5 11.8 5 2 14.8 2 27s9.8 22 22 22c12.1 0 22-9.9 22-22 0-1.3-.2-2.7-.5-4Z"
            fill="#FFC107"
          />
          <path
            d="M5.3 16.7l6.4 4.7C14.1 16.6 18.5 13 24 13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 7.1 29.6 5 24 5 16.3 5 9.7 9.8 5.3 16.7Z"
            fill="#FF3D00"
          />
          <path
            d="M24 47c6.3 0 11.6-2.1 15.7-5.6l-7.2-5.6c-2.1 1.4-4.8 2.2-8.5 2.2-6.1 0-11.3-4.1-13.1-9.6l-7.4 5.7C9.7 42.2 16.3 47 24 47Z"
            fill="#4CAF50"
          />
          <path
            d="M48.5 22.5H24v8h11.8c-1.4 4.5-5.4 8-10.8 8-3.7 0-7-1.5-9.4-3.9l-6 4.7c3.4 3.2 7.9 5.2 13.4 5.2 6.3 0 11.6-2.1 15.7-5.6l7.2-5.6c.8-.6.1-2.8-.4-3.8Z"
            fill="#1976D2"
          />
        </svg>
        Sign in with Google
      </button>
    );
}
