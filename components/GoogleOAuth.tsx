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
      className="sm:text-md montserrat-text-regular flex items-center justify-center rounded border bg-btn-background px-4 py-2 text-sm text-white shadow-sm hover:bg-btn-background-hover"
      onClick={handleSignInWithGoogle}
    >
      Sign in with Google
    </button>
  );
}
