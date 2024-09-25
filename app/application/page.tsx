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

export default async function ProtectedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/");
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-20 bg-gradient-to-b from-[#11273B] via-[#264E72] to-[#5782A9]">
      <div className="animate-in flex max-w-4xl flex-1 flex-col gap-20 px-3 opacity-0">
        <div className="flex flex-col">
          <p className="bon-vivant-text-regular mx-auto mt-12 max-w-xl text-center text-3xl !leading-tight lg:text-4xl">
            UCSD Alpha Kappa Psi
          </p>
          <p className="bon-vivant-text-regular mx-auto max-w-xl text-center text-3xl !leading-tight lg:text-4xl">
            Fall '24 Rush Application
          </p>

          <p className="bon-vivant-text-regular mx-auto mt-4 max-w-xl text-center text-xl !leading-tight lg:text-xl">
            Due Thursday, October 3rd at 12 PM
          </p>
          <p className="mt-4 text-gray-500">
            If you're having any issues or have any questions, please contact
            Ally or Val @ (916) 841-7952 / (408) 805-2888!
          </p>
          <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
          <div className="mb-10">
            <NameForm />
          </div>
        </div>
      </div>
    </div>
  );
}
