import DeployButton from '../components/DeployButton';
import AuthButton from '../components/AuthButton';
import { createClient } from '@/utils/supabase/server';
import ConnectSupabaseSteps from '@/components/tutorial/ConnectSupabaseSteps';
import SignUpUserSteps from '@/components/tutorial/SignUpUserSteps';
import Header from '@/components/Header';

const SignInWithGoogleButton = () => {
  return (
    <button className="flex items-center justify-center bg-white w-1/2 text-black px-4 py-2 border rounded shadow-sm hover:bg-gray-100">
      <svg
        className="w-6 h-6 mr-2 -ml-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        fill="none"
      >
        <path
          d="M44.5 20H24v8h11.8C34.7 36.9 30.1 40 24 40c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 7.1 29.6 5 24 5 11.8 5 2 14.8 2 27s9.8 22 22 22c12.1 0 22-9.9 22-22 0-1.3-.2-2.7-.5-4Z"
          fill="#FFC107"
        />
        <path
          d="M5.3 16.7l6.4 4.7C14.1 16.6 18.5 13 24 13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 7.1 29.6 5 24 5 16.3 5 9.7 9.8 5.3 16.7Z"
          fill="#FF3D00"
        />
        <path
          d="M24 47c6.3 0 11.6-2.1 15.7-5.6l-7.2-5.6c-2.1 1.4-4.8 2.2-8.5 2.2-6.1 0-11.3-4.1-13.1-9.6l-7.4 5.7C9.7 42.2 16.3 47 24 47Z"
          fill="#4CAF50"
        />
        <path
          d="M48.5 22.5H24v8h11.8c-1.4 4.5-5.4 8-10.8 8-3.7 0-7-1.5-9.4-3.9l-6 4.7c3.4 3.2 7.9 5.2 13.4 5.2 6.3 0 11.6-2.1 15.7-5.6l7.2-5.6c.8-.6.1-2.8-.4-3.8Z"
          fill="#1976D2"
        />
      </svg>
      Sign in with Google
    </button>
  );
};

export default async function Index() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-lg">
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
          {SignInWithGoogleButton()}
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
