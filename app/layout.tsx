import { GeistSans } from 'geist/font/sans';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { libreCaslon } from '@/fonts/fonts';
import { bonVivant } from '@/fonts/fonts';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "UCSD AKPsi Fall '24 Rush Interest Form ",
  description:
    "Fill out the interest form for UCSD AKPsi's Fall '24 Rush here!",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  let isActive = false;
  let isPIC = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('is_active')
      .eq('id', user!.id)
      .single();
    isActive = data?.is_active;
  }

  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('is_pic')
      .eq('id', user!.id)
      .single();
    isPIC = data?.is_pic;
  }

  return (
    <html
      lang="en"
      className={`${GeistSans.className} ${libreCaslon.variable} ${bonVivant.variable}`}
    >
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          <ToastContainer />
          <Navbar isPIC={isPIC} isActive={isActive} user={user} />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
