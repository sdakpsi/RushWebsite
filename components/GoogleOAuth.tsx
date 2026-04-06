"use client";
import React from "react";
import GoogleIdentityButton from "@/components/GoogleIdentityButton";

export default function GoogleOAuth() {
  return (
    <GoogleIdentityButton>
      <button
        className="flex items-center rounded-xl bg-white border border-gray-300 text-black px-6 py-2.5 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 shadow-xl hover:shadow-2xl transition-all duration-200 touch-manipulation active:scale-95"
        type="button"
      >
        Login with Google
      </button>
    </GoogleIdentityButton>
  );
}
