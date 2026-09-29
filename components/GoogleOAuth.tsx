"use client";
import React from "react";
import GoogleIdentityButton from "@/components/GoogleIdentityButton";

export default function GoogleOAuth() {
  return (
    <GoogleIdentityButton>
      <button
        className="flex items-center rounded-xl bg-frost-100 border border-frost-200 text-navy-950 px-6 py-2.5 text-sm font-medium hover:bg-frost-200 focus:outline-none focus:ring-2 focus:ring-frost-300/50 focus:ring-offset-2 shadow-xl hover:shadow-2xl transition-all duration-200 touch-manipulation active:scale-95"
        type="button"
      >
        Login with Google
      </button>
    </GoogleIdentityButton>
  );
}
