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
import posterImage from './image_on_page.png';
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
      
      {/* Wrapper for the image and text */}
      <div className="flex flex-row justify-between items-center w-full max-w-4xl px-3 mt-8">
        
        {/* Left side: Text content */}
        <div className="flex flex-col gap-8 sm:gap-4 items-center"> {/* Change items-start to items-center */}
          <p className="text-3xl lg:text-4xl font-semibold text-center ${bonVivant.className} bon-vivant-text-regular">
            Welcome to the Alpha Kappa Psi Fall Rush 2024 Application Portal
          </p>

          {/* Center the button */}
          <div className="flex justify-center w-full">
            <Link href="/interest">
              <button className="p-2 rounded px-5 transition duration-100 bg-btn-background hover:bg-btn-background-hover ${bonVivant.className} bon-vivant-text-regular">
                Interest Form
              </button>
            </Link>
          </div>

          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-6" />
          
          {/* Center the sign-in text and button */}
          <div className="flex flex-col gap-4 items-center"> {/* Adjusted alignment */}
            <p className="text-xl lg:text-2xl !leading-tight text-center max-w-xl ${bonVivant.className} bon-vivant-text-bold">
              Please sign in for the application.
            </p>

            {/* Google Sign-In Button */}
            <div className="flex justify-center">
              <GoogleOAuth />
            </div>
          </div>

          {/* Contact information placed right under sign-in */}
          <div className="text-gray-200 text-xs mt-4 text-center"> {/* Center the text */}
            If you're having any issues or have any questions, please contact Ally or Val @ (916) 841-7952 / (408) 805-2888!
          </div>

          <div className="text-gray-200 text-xs mt-0 text-center"> {/* Center the text */}
            *When signing in, it will ask to continue to{' '}
            <span className="font-bold">kvuilkasrtgyazkvxjal.supabase.co</span>
          </div>
        </div>

        {/* Right side: Move image up with margin */}
        <div className="flex flex-col items-center -mt-8">
          <Image src={posterImage} width={350} height={350} alt="logo" />

          {/* Timer directly under the image */}
          <div className="w-full flex justify-center mt-4">
            <Timer />
          </div>
        </div>
      </div>
    </div>
  );
}
