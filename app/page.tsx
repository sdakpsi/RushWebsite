import DeployButton from '../components/DeployButton';
import AuthButton from '../components/AuthButton';
import { createClient } from '@/utils/supabase/server';
import ConnectSupabaseSteps from '@/components/tutorial/ConnectSupabaseSteps';
import SignUpUserSteps from '@/components/tutorial/SignUpUserSteps';
import Header from '@/components/Header';
import GoogleOAuth from '@/components/GoogleOAuth';


export default async function Index() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-Lg">
          UCSD Alpha Kappa Psi
        </div>
      </nav>

      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <div className="flex flex-col gap-16 items-center">
          <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center mt-32">
            Welcome to the application portal! Please sign in.
          </p>
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        </div>
        <main className="flex flex-col justify-center items-center">
          <GoogleOAuth />
        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Property of{' '}
          <a
            href="https://www.akpsiucsd.com"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            UCSD Alpha Kappa Psi
          </a>
        </p>
      </footer>
    </div>
  );
}