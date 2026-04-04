"use client";
import { createClient } from "@/utils/supabase/client";
import React from "react";

export default function GoogleOAuth() {
  // Function to handle sign-in with Google
  const handleSignInWithGoogle = async () => {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      // Type error as unknown
      // Now we need to narrow down the type of 'error' before we can access its properties
      if (error instanceof Error) {
        console.error("Error signing in with Google:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  return (
    <button
      className="flex items-center rounded-xl bg-white border border-gray-300 text-black px-6 py-2.5 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 shadow-xl hover:shadow-2xl transition-all duration-200 touch-manipulation active:scale-95"
      onClick={handleSignInWithGoogle}
    >
   
      Login with Google
    </button>
  );
}
