import { GeistSans } from 'geist/font/sans';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "UCSD AKPsi Spring'24 Dashboard",
  description: "Apply here for UCSD AKPsi's Spring '24 Rush",
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

  let user2 = session?.user || null;

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      console.log('hi');
      user2 = null;
    }
  });

  const supabase2 = createClient();
  let isActive = false;
  let isPIC = false;
  const {
    data: { user },
  } = await supabase2.auth.getUser();
  if (user) {
    const { data, error } = await supabase2
      .from('users')
      .select('is_active')
      .eq('id', user!.id)
      .single();
    isActive = data?.is_active;
  }

  if (user) {
    const { data, error } = await supabase2
      .from('users')
      .select('is_pic')
      .eq('id', user!.id)
      .single();
    isPIC = data?.is_pic;
    console.log(data?.is_pic);
  }

  return (
    <html lang="en" className={GeistSans.className}>
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
