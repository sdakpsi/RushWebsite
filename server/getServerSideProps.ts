import { createClient } from '@/utils/supabase/server';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      props: {
        user: null,
      },
    };
  }

  const { user } = session;

  return {
    props: {
      user,
    },
  };
}