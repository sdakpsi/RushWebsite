'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthStateListener() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // Invalidate all queries to force a refresh
        queryClient.invalidateQueries();
        
        // If we just signed in, force a page refresh to update server-rendered components
        if (event === 'SIGNED_IN') {
          // Small delay to ensure session is properly set
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
        
        // If we just signed out, redirect to home
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
    });

    // Check if we just completed auth (from callback redirect)
    const authSuccess = searchParams?.get('auth');
    if (authSuccess === 'success') {
      // Remove the auth parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      router.replace(url.pathname + url.search);
      
      // Invalidate all queries and force refresh
      queryClient.invalidateQueries();
      
      // Force page refresh to update server-rendered navbar
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, router, searchParams]);

  return null; // This component doesn't render anything
}