import DeployButton from "../components/DeployButton";
import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import GoogleOAuth from "@/components/GoogleOAuth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ApplicationButton from "@/components/ApplicationButton";
import Timer from "@/components/Timer";

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex w-full flex-1 flex-col items-center">
      <div className="animate-in flex max-w-4xl flex-1 flex-col gap-10 px-3 opacity-0">
        <div className="flex flex-col items-center">
          <p className="mx-auto mt-32 max-w-xl text-center text-3xl !leading-tight lg:text-4xl">
            Welcome to the Fall 2024 Rush!
          </p>
          <p className="mx-auto mt-10 max-w-xl text-center text-xl !leading-tight lg:text-2xl">
            Countdown to rush:
          </p>
          <Timer />
          <p className="mt-8 text-lg lg:text-xl">
            Fill out the interest form to stay in the loop regarding rush!
          </p>
          <Link href="/interest" className="mt-4">
            <button className="rounded bg-btn-background p-2 px-5 transition duration-100 hover:bg-btn-background-hover">
              Interest Form
            </button>
          </Link>
          <div className="my-8 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent p-[1px]" />
        </div>

        <main className="flex flex-col items-center justify-center">
          {user ? (
            <>
              <p className="mx-auto mt-4 max-w-2xl text-center text-3xl !leading-tight lg:text-4xl">
                Application Form
              </p>
              <div className="mt-4 flex items-center justify-center">
                <ApplicationButton />
              </div>
              <p className="mt-8 text-xs text-gray-500">
                If you're having any issues or have any questions, please
                contact Ally or Val @ (916) 841-7952 / (408) 805-2888!
              </p>
            </>
          ) : (
            <>
              <p className="mx-auto mt-4 max-w-2xl text-center text-3xl !leading-tight lg:text-4xl">
                Application Form
              </p>
              <p className="mx-auto mb-4 mt-4 max-w-xl text-center text-lg !leading-tight lg:text-xl">
                Please sign in for the application.
              </p>
              <GoogleOAuth />
              <div className="mt-8 text-xs text-gray-400">
                *When signing in, it will ask to continue to{" "}
                <span className="font-bold">
                  kvuilkasrtgyazkvxjal.supabase.co
                </span>
                <p className="mt-1 text-gray-500">
                  If you're having any issues or have any questions, please
                  contact Ally or Val @ (916) 841-7952 / (408) 805-2888!
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
