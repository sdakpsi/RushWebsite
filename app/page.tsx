import DeployButton from '../components/DeployButton';
import AuthButton from '../components/AuthButton';
import { createClient } from '@/utils/supabase/server';
import ConnectSupabaseSteps from '@/components/tutorial/ConnectSupabaseSteps';
import SignUpUserSteps from '@/components/tutorial/SignUpUserSteps';
import Header from '@/components/Header';
import GoogleOAuth from '@/components/GoogleOAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return redirect('/dashboard');
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <div className="flex flex-col gap-8 sm:gap-16 items-center">
          <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center mt-32">
            Welcome to the Fall 2024 Rush!
          </p>
          <Link href="/interest"><button className="p-2 rounded px-5 transition duration-100 bg-btn-background hover:bg-btn-background-hover">Interest Form</button></Link>
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        </div>
        <main className="flex flex-col justify-center items-center">
          <p className="text-xl lg:text-2xl !leading-tight mx-auto max-w-xl text-center mb-4">
            Please sign in for the application.
          </p>
          <GoogleOAuth />
          <div className="text-gray-400 text-xs mt-4">
            *When signing in, it will ask to continue to{' '}
            <span className="font-bold">kvuilkasrtgyazkvxjal.supabase.co</span>
            <p className="text-gray-500 mt-4">
              If you're having any issues or have any questions, please contact
              Ally or Val @ (916) 841-7952 / (408) 805-2888!
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
