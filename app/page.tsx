import DeployButton from "../components/DeployButton";
import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import ConnectSupabaseSteps from "@/components/tutorial/ConnectSupabaseSteps";
import SignUpUserSteps from "@/components/tutorial/SignUpUserSteps";
import Header from "@/components/Header";
import GoogleOAuth from "@/components/GoogleOAuth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Timer from "@/components/Timer";
import { bonVivant } from "@/fonts/fonts";
import posterImage from "./image_on_page.png";
import Image from "next/image";

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative flex min-h-screen w-full flex-1 flex-col bg-gradient-to-b from-[#11273B] via-[#264E72] to-[#5782A9] text-white">
      {/* Wrapper for the image and text */}
      <div className="mt-12 flex flex-col items-center justify-between px-8 lg:mt-48 lg:flex-row lg:px-20">
        {/* Left side: Text content */}
        <div className="flex w-full flex-col gap-6 text-left sm:gap-4 lg:w-2/3">
          {/* Welcome text */}
          <p className="${bonVivant.className} bon-vivant-text-regular text-left text-3xl font-semibold lg:text-5xl">
            Welcome to the Alpha Kappa Psi Fall Rush 2024 Application Portal
          </p>

          {/* {user ? (
            <div className="mb-8 mt-6 rounded-md bg-sky-900 p-4 ">
              <p className="${bonVivant.className} bon-vivant-text-bold text-md text-center !leading-tight lg:text-2xl">
                Hello {user.user_metadata.full_name}! Bookmark this page as you
                will be applying through here.
              </p>
            </div>
          ) : (
            <></>
          )} */}

          <p className="text-left text-sm text-gray-200 lg:text-lg">
            Please fill out the interest form below to receive updates regarding
            rush!
          </p>

          {/* Center the button */}
          <div className="flex w-full justify-center">
            <Link href="/interest">
              <button className="rounded bg-btn-background p-2 px-5 transition duration-100 hover:bg-btn-background-hover">
                Interest Form
              </button>
            </Link>
          </div>

          {/* Divider line */}
          <div className="my-6 w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent p-[1px]" />

          {/* Sign-in text and button */}
          <div className="flex flex-col items-center gap-4">
            {user ? (
              <>
                <p className="${bonVivant.className} bon-vivant-text-bold text-center text-lg !leading-tight lg:text-2xl">
                  Fill out the application for consideration! <br></br>Due
                  Thursday, October 3rd at 2 PM.
                </p>
                <Link href="/application">
                  <button className="text-md rounded bg-btn-background px-6 py-2 text-white transition duration-300 hover:bg-btn-background-hover lg:text-lg">
                    Application Form
                  </button>
                </Link>
              </>
            ) : (
              <>
                <p className="${bonVivant.className} bon-vivant-text-bold max-w-xl text-center text-xl !leading-tight lg:text-2xl">
                  Please sign in for the application. <br></br>Due Thursday,
                  October 3rd at 2 PM.
                </p>

                {/* Google Sign-In Button */}
                <div className="flex justify-center">
                  <GoogleOAuth />
                </div>
              </>
            )}
          </div>

          {/* Contact information */}
          <div className="mt-4 text-left text-xs text-gray-200">
            If you're having any issues or have any questions, please contact
            Ally Pan or Val Chen @ (916) 841-7952 / (408) 805-2888!
          </div>

          {/* Supabase sign-in notice */}
          <div className="text-left text-xs text-gray-200">
            *When signing in, it will ask to continue to{" "}
            <span className="font-bold">kvuilkasrtgyazkvxjal.supabase.co</span>
          </div>
        </div>

        {/* Right side: Image and Timer */}
        <div className="mt-12 flex flex-col items-center lg:ml-12 lg:mt-0">
          <Image
            src={posterImage}
            width={300}
            height={300}
            alt="logo"
            className="mb-4"
          />

          {/* Timer */}
          <p className="${bonVivant.className} bon-vivant-text-regular mt-6 text-lg">
            Countdown to Rush!
          </p>
          <div className="mb-6 mt-2 flex w-full justify-center lg:mb-0">
            <Timer />
          </div>
        </div>
      </div>
    </div>
  );
}
