'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthStateListener() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHandledAuth = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Only handle sign out - invalidate queries and redirect
        queryClient.invalidateQueries();
        router.push('/');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Just invalidate queries, don't force reload
        queryClient.invalidateQueries();
      }
    });

    // Check if we just completed auth (from callback redirect) - only once
    const authSuccess = searchParams?.get('auth');
    if (authSuccess === 'success' && !hasHandledAuth.current) {
      hasHandledAuth.current = true;
      
      // Remove the auth parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      router.replace(url.pathname + url.search);
      
      // Invalidate all queries and force ONE refresh only
      queryClient.invalidateQueries();
      
      // Force page refresh to update server-rendered navbar - only once
      setTimeout(() => {
        if (hasHandledAuth.current) {
          window.location.reload();
        }
      }, 100);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, router, searchParams]);

  return null; // This component doesn't render anything
}