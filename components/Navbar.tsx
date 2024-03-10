import AuthButton from '@/components/AuthButton';
import { createClient } from '@/utils/supabase/server';
import ActiveButton from './ActiveButton';
import Link from 'next/link';

export default async function Navbar() {
  const supabase = createClient();
  let isActive = false;
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

  return (
    <nav className="w-full flex justify-center items-center border-b border-b-foreground/10 h-16">
      <div className="flex justify-between items-center w-full max-w-4xl px-3 text-lg">
        <Link href="/dashboard">
          <span>UCSD Alpha Kappa Psi</span>
        </Link>
        <ActiveButton is_active={isActive} />
        <AuthButton user={user} />
      </div>
    </nav>
  );
}
