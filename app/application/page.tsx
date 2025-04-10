import DeployButton from "@/components/DeployButton";
import React from "react";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import FetchDataSteps from "@/components/tutorial/FetchDataSteps";
import Header from "@/components/Header";
import { redirect } from "next/navigation";
import NextLinkButton from "../../components/NextLinkButton";
import { User } from "@supabase/supabase-js"; // Ensure you import the User type
import NameForm from "@/components/NameForm";
import { RUSH_YEAR } from "@/utils/constants";

export default async function ProtectedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/");
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-20 bg-[#2A1D16]">
      <div className="animate-in flex max-w-4xl flex-1 flex-col gap-20 px-3 opacity-0">
        <div className="flex flex-col">
          <p className="montserrat-text-bold  mx-auto mt-12 max-w-xl text-center text-3xl !leading-tight lg:text-4xl">
            UCSD Alpha Kappa Psi
          </p>
          <p className="montserrat-text-bold  mx-auto max-w-xl text-center text-3xl !leading-tight lg:text-4xl">
            {RUSH_YEAR} Rush Application
          </p>

          <p className="montserrat-text-regular mx-auto mt-4 max-w-xl text-center text-xl !leading-tight lg:text-xl">
            Due Thursday, April 10th at 2 PM
          </p>
          <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
          <div className="mb-10">
            {/* <NameForm /> */}
            <p>
              The app deadline has passed. If you are concerned about a missing
              submission or have any questions, please contact Kristen Lee or Jessie Ha @
              (732) 484-8791 / (626) 267-4161!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
