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
    <div
      className="flex w-full flex-1 items-center justify-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="animate-in w-full max-w-4xl opacity-0">
        <div className="flex h-full flex-col justify-center">
          <ActiveSetter />
        </div>
      </div>
    </div>
  );
}
