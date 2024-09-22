import DeployButton from '../components/DeployButton';
import AuthButton from '../components/AuthButton';
import { createClient } from '@/utils/supabase/server';
import ConnectSupabaseSteps from '@/components/tutorial/ConnectSupabaseSteps';
import SignUpUserSteps from '@/components/tutorial/SignUpUserSteps';
import Header from '@/components/Header';
import GoogleOAuth from '@/components/GoogleOAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Timer from '@/components/Timer';
import { bonVivant } from '@/fonts/fonts';
import posterImage from './image_on_page.png'
import Image from 'next/image';

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return redirect('/dashboard');
  }

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-gradient-to-b from-[#1E3A8A] to-[#3B82F6] text-white min-h-screen relative">
      {/* Page content */}
      <div className="animate-in flex flex-col gap-20 opacity-0 max-w-4xl px-3 items-center mt-12">
        <div className="flex flex-col gap-8 sm:gap-16 items-center">
          <p className="text-3xl lg:text-4xl font-semibold text-center ${bonVivant.className} bon-vivant-text-regular">
            Welcome to the Alpha Kappa Psi Fall Rush 2024 Application Portal
          </p>
          <Link href="/interest">
            <button className="p-2 rounded px-5 transition duration-100 bg-btn-background hover:bg-btn-background-hover ${bonVivant.className} bon-vivant-text-regular">
              Interest Form
            </button>
          </Link>
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        </div>


        
       <Image src={posterImage} width= {350} height={350} alt="logo" />

        <main className="flex flex-col justify-center items-center">
          <p className="text-xl lg:text-2xl !leading-tight mx-auto max-w-xl text-center mb-4 ${bonVivant.className} bon-vivant-text-bold">
            Please sign in for the application.
          </p>
          <GoogleOAuth />
          <div className="text-gray-200 text-xs mt-4">
            *When signing in, it will ask to continue to{' '}
            <span className="font-bold">kvuilkasrtgyazkvxjal.supabase.co</span>
            <p className="text-gray-300 mt-4">
              If you're having any issues or have any questions, please contact
              Ally or Val @ (916) 841-7952 / (408) 805-2888!
            </p>
          </div>
        </main>
      </div>

      {/* Timer positioned at the bottom right */}
      <div className="bottom-20 right-50">
        <Timer />
      </div>
      
    </div>
  );
}
