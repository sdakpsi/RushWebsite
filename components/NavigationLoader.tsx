"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";

// Global loading state to prevent multiple spinners
let globalLoadingState = false;
let globalSetLoading: ((loading: boolean) => void) | null = null;

export default function NavigationLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isNavigatingRef = useRef(false);
  const componentMountedRef = useRef(true);

  // Register this component as the global loading controller
  useEffect(() => {
    globalSetLoading = setLoading;
    return () => {
      if (globalSetLoading === setLoading) {
        globalSetLoading = null;
      }
    };
  }, []);

  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // When pathname changes, stop loading immediately
    if (isNavigatingRef.current && componentMountedRef.current) {
      setLoading(false);
      globalLoadingState = false;
      isNavigatingRef.current = false;
    }
  }, [pathname]);

  // Intercept Next.js router navigation
  useEffect(() => {
    if (globalSetLoading === setLoading && router) {
      const originalPush = router.push;
      const originalReplace = router.replace;

      router.push = (...args) => {
        if (!globalLoadingState && !isNavigatingRef.current && componentMountedRef.current) {
          isNavigatingRef.current = true;
          globalLoadingState = true;
          setLoading(true);
        }
        return originalPush.apply(router, args);
      };

      router.replace = (...args) => {
        if (!globalLoadingState && !isNavigatingRef.current && componentMountedRef.current) {
          isNavigatingRef.current = true;
          globalLoadingState = true;
          setLoading(true);
        }
        return originalReplace.apply(router, args);
      };

      return () => {
        router.push = originalPush;
        router.replace = originalReplace;
      };
    }
  }, [router]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href], button[data-navigation]') as HTMLAnchorElement | HTMLButtonElement;
      
      if (link) {
        let targetUrl: string | null = null;
        
        // Handle regular links and Next.js Link components
        if (link.tagName === 'A' && (link as HTMLAnchorElement).href) {
          targetUrl = (link as HTMLAnchorElement).href;
        }
        // Handle navigation buttons (like form submissions that navigate)
        else if (link.tagName === 'BUTTON' && link.getAttribute('data-navigation')) {
          targetUrl = link.getAttribute('data-navigation');
        }
        
        if (targetUrl) {
          try {
            const url = new URL(targetUrl);
            const currentUrl = new URL(window.location.href);
            
            // Only show loading for internal navigation (same origin, different pathname)
            if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
              // Prevent multiple loading states globally
              if (!globalLoadingState && !isNavigatingRef.current && componentMountedRef.current) {
                isNavigatingRef.current = true;
                globalLoadingState = true;
                
                // Show loading immediately for responsive feel
                if (globalSetLoading) {
                  globalSetLoading(true);
                }
                
             
              }
            }
          } catch (error) {
            // Invalid URL, ignore
          }
        }
      }
    };

    const handleBeforeUnload = () => {
      // Clear loading on page unload
      if (componentMountedRef.current) {
        setLoading(false);
        globalLoadingState = false;
        isNavigatingRef.current = false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Enter key on focused links/buttons
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A' || target.tagName === 'BUTTON') {
          handleLinkClick(e as any);
        }
      }
    };

    // Only add listeners if this is the active loader
    if (globalSetLoading === setLoading) {
      // Use capture phase to catch events before Next.js handles them
      document.addEventListener('click', handleLinkClick, true);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Auto-hide loading after maximum time (failsafe)
  useEffect(() => {
    if (loading) {
      const maxLoadingTime = setTimeout(() => {
        if (componentMountedRef.current) {
          setLoading(false);
          globalLoadingState = false;
          isNavigatingRef.current = false;
        }
      }, 4000); // 4 second maximum

      return () => clearTimeout(maxLoadingTime);
    }
  }, [loading]);

  // Hide duplicate navigation spinners if they exist
  useEffect(() => {
    if (loading) {
      const navigationSpinners = document.querySelectorAll('[data-loading-type="navigation"]');
      navigationSpinners.forEach((spinner, index) => {
        if (index > 0) { // Keep only the first navigation spinner
          (spinner.parentElement as HTMLElement)?.remove();
        }
      });
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <div data-loading-spinner="navigation">
      <LoadingSpinner fullScreen={true} size="large" type="navigation" />
    </div>
  );
}