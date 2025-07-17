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
      className="flex items-center rounded-xl bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur-sm border border-blue-400/30 text-white px-6 py-2.5 text-sm font-medium hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 shadow-xl hover:shadow-2xl transition-all duration-200 touch-manipulation active:scale-95"
      onClick={handleSignInWithGoogle}
    >
   
      Login with Google
    </button>
  );
}
