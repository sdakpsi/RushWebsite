"use client";

import { cloneElement, isValidElement, ReactElement, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import customToast from "@/components/CustomToast";
import { createClient } from "@/utils/supabase/client";

const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type GoogleIdentityButtonProps = {
  children: ReactElement;
};

const loadGoogleIdentityScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Identity Services requires a browser."));
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (window.__googleIdentityScriptPromise) {
    return window.__googleIdentityScriptPromise;
  }

  window.__googleIdentityScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      if (existingScript.dataset.loaded === "true" || window.google?.accounts?.oauth2) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });

  return window.__googleIdentityScriptPromise.catch((error) => {
    window.__googleIdentityScriptPromise = undefined;
    throw error;
  });
};

export default function GoogleIdentityButton({ children }: GoogleIdentityButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const router = useRouter();
  const queryClient = useQueryClient();
  const codeClientRef = useRef<google.accounts.oauth2.CodeClient | null>(null);
  const isSigningInRef = useRef(false);
  const [scriptStatus, setScriptStatus] = useState<"idle" | "ready" | "error">("idle");

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let isMounted = true;

    loadGoogleIdentityScript()
      .then(() => {
        if (!isMounted || !window.google?.accounts?.oauth2) {
          return;
        }

        codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: "openid email profile",
          ux_mode: "popup",
          callback: async (response) => {
            if (!response.code) {
              isSigningInRef.current = false;
              customToast("Google sign-in did not return an authorization code.", "error");
              return;
            }

            try {
              const exchangeResponse = await fetch("/api/auth/google/exchange", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  code: response.code,
                  origin: window.location.origin,
                }),
              });

              const exchangeResult = await exchangeResponse.json();

              if (!exchangeResponse.ok || !exchangeResult.idToken) {
                throw new Error(exchangeResult.error ?? "Failed to exchange Google authorization code.");
              }

              const supabase = createClient();
              const { error } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: exchangeResult.idToken,
              });

              if (error) {
                throw error;
              }

              await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
              router.refresh();
            } catch (error) {
              console.error("Error signing in with Google:", error);
              customToast("Google sign-in failed. Please try again.", "error");
            } finally {
              isSigningInRef.current = false;
            }
          },
          error_callback: (error) => {
            isSigningInRef.current = false;
            console.error("Google OAuth popup error:", error);
            customToast("Google sign-in was interrupted. Please try again.", "error");
          },
        });

        setScriptStatus("ready");
      })
      .catch((error) => {
        console.error("Error loading Google Identity Services:", error);
        if (isMounted) {
          setScriptStatus("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, queryClient, router]);

  if (!isValidElement(children)) {
    return children;
  }

  return cloneElement(children, {
    onClick: () => {
      if (!clientId) {
        customToast("Google sign-in is not configured yet.", "error");
        return;
      }

      if (scriptStatus === "error") {
        customToast("Google sign-in failed to initialize. Please refresh and try again.", "error");
        return;
      }

      if (scriptStatus !== "ready" || !codeClientRef.current) {
        customToast("Google sign-in is still loading. Please try again in a moment.", "info");
        return;
      }

      if (isSigningInRef.current) {
        return;
      }

      isSigningInRef.current = true;
      codeClientRef.current.requestCode();
    },
  });
}
