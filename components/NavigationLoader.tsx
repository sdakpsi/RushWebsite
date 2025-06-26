"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // When pathname changes, stop loading
    setLoading(false);
  }, [pathname]);

  useEffect(() => {
    // Listen for clicks on all links
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Only show loading for internal navigation (same origin, different pathname)
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed left-0 top-0 z-50 h-2 w-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-[progressGlow_2s_ease-in-out_infinite] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.2s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 animate-pulse"></div>
        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent animate-[shimmer_0.8s_ease-in-out_infinite_reverse]"></div>
      </div>
    </div>
  );
}