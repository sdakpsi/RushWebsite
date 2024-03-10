import AuthButton from '@/components/AuthButton';
import { createClient } from '@/utils/supabase/server';
import ActiveButton from './ActiveButton';
import Link from 'next/link';
import PICButton from './PICButton';

export default async function Navbar() {
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
    console.log(data?.is_pic);
  }

  return (
    <nav className="w-full flex justify-center items-center border-b border-b-foreground/10 h-16 px-24">
      <div className="flex justify-between items-center w-full px-3 text-lg">
        <Link href="/dashboard">
          <span>UCSD Alpha Kappa Psi</span>
        </Link>
        <PICButton is_pic={isPIC} />
        <ActiveButton is_active={isActive} />
        <AuthButton user={user} />
      </div>
    </nav>
  );
}
