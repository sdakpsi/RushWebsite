'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

export default function AuthStateListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    // Listen for auth state changes and simply invalidate cache
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Invalidate all user-related queries when auth state changes
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return null;
}