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
import { montserrat } from "@/fonts/fonts";
import posterImage from "./image_on_page.png";
import Image from "next/image";
import background from "./background.png";
import tagline from "./tagline.png";

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div
      className="relative flex min-h-screen w-full flex-1 flex-col text-black"
      style={{
        backgroundImage: `url(${background.src})`,

        backgroundSize: "cover",

        backgroundPosition: "center",

        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex items-center justify-center">
        <Image src={tagline} alt="tagline" className="w-[80%] md:w-[60%]" />
      </div>
      {/* Wrapper for the image and text */}
      <div className="mt-12 flex flex-col items-center justify-between px-8 lg:mt-4 lg:flex-row lg:px-20">
        {/* Left side: Text content */}

        <div className="flex w-full flex-col gap-6 text-left sm:gap-4 lg:w-2/3">
          {/* Welcome text */}
          <p className="montserrat-text-bold text-left text-xl lg:text-3xl">
            Welcome to the Alpha Kappa Psi Spring Rush 2025 Application Portal
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

          <p className="text-left text-sm text-black lg:text-lg">
            Please fill out the interest form below to receive updates regarding
            rush!
          </p>

          {/* Center the button */}
          <div className="flex w-full">
            <a href="https://forms.gle/119tXRV5Wgiu86rJ6">
              <button className="montserrat-text-regular rounded bg-btn-background p-2 px-5 text-white transition duration-100 hover:bg-btn-background-hover">
                Interest Form
              </button>
            </a>
          </div>

          {/* Divider line */}
          <div className="my-6 w-full bg-gradient-to-r from-transparent via-foreground/30 to-transparent p-[1px]" />

          {/* Sign-in text and button */}
          <div className="flex flex-col gap-4">
            {user ? (
              <>
                <p className="montserrat-text-bold text-lg !leading-tight lg:text-xl">
                  The application is open. <br></br>Due Thursday, April 10th at
                  2 PM.
                </p>
                <Link href="/application">
                  <button className="montserrat-text-regular text-md rounded bg-btn-background px-6 py-2 text-white transition duration-300 hover:bg-btn-background-hover lg:text-lg">
                    Application Form
                  </button>
                </Link>
              </>
            ) : (
              <>
                <p className="montserrat-text-bold max-w-xl text-center text-xl !leading-tight lg:text-xl">
                  The application is open. <br></br>Due Thursday, April 10th at
                  2 PM.
                </p>

                {/* Google Sign-In Button */}
                <div className="flex justify-center">
                  <GoogleOAuth />
                </div>
              </>
            )}
          </div>

          {/* Contact information */}
          <div className="mt-4 text-left text-sm text-gray-900">
            If you're having any issues or have any questions, please contact
            Kristen Lee or Jessie Ha @ (732) 484-8791 / (626) 267-4161!
          </div>

          {/* Supabase sign-in notice */}
          <div className="mb-12 text-left text-sm text-gray-900">
            *When signing in, it will ask to continue to{" "}
            <span className="font-bold">kvuilkasrtgyazkvxjal.supabase.co</span>
          </div>
        </div>

        {/* Right side: Image and Timer */}
        <div className="mt-12 flex flex-col items-center lg:ml-12 lg:mt-0">
          {/* <Image
            src={posterImage}
            width={300}
            height={300}
            alt="logo"
            className="mb-4"
          /> */}

          {/* Timer */}
          {/* <p className="${bonVivant.className} bon-vivant-text-regular mt-6 text-lg">
            Countdown to Rush!
          </p>
          <div className="mb-6 mt-2 flex w-full justify-center lg:mb-0">
            <Timer />
          </div> */}
        </div>
      </div>
    </div>
  );
}
