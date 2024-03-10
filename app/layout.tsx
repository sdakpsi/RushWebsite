import { GeistSans } from 'geist/font/sans';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from 'react-toastify';
import { cookies } from 'next/headers';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = session?.user || null;

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      console.log('hi');
      user = null;
    }
  });

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          <ToastContainer />
          <Navbar />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
