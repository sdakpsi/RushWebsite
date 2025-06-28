import React from "react";
import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NextLinkButton from "../../components/NextLinkButton";
import { User } from "@supabase/supabase-js"; // Ensure you import the User type
import { redirect } from "next/navigation";
import ActiveLoginComponent from "@/components/ActiveLoginComponent";
import ActiveSetter from "@/components/ActiveSetter";
import Link from "next/link";
import styles from "./styles.module.css";
import logo from "./akpsilogo.png";
import Image from "next/image";

export default async function ProtectedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-accent/20 to-transparent blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 container py-12">
        <div className="animate-slide-up max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
              Active Member Portal
            </h1>
            <p className="text-xl text-muted-foreground">
              UCSD Alpha Kappa Psi
            </p>
          </div>

          {/* Active Member Tools */}
          <div className="card glass">
            <div className="card-content">
              <ActiveSetter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
