import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { createClient } from "@/utils/supabase/server";
import { libreCaslon } from "@/fonts/fonts";
import { bonVivant } from "@/fonts/fonts";
import { montserrat } from "@/fonts/fonts";
import { neueHaasGrotesk } from "@/fonts/fonts";
import ReactQueryProvider from "@/server/queryClientProvider";
import NavigationLoader from "@/components/NavigationLoader";
import ScrollRestoration from "@/components/ScrollRestoration";
import AuthStateListener from "@/components/AuthStateListener";
import { RUSH_YEAR } from "@/utils/constants";
import { Analytics } from "@vercel/analytics/next";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: `UCSD AKPsi ${RUSH_YEAR} Rush`,
  description:
  `Website for UCSD AKPsi's ${RUSH_YEAR} Rush Application!`
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html
      lang="en"
      className={`${neueHaasGrotesk.className} ${libreCaslon.variable} ${bonVivant.variable} ${montserrat.variable} ${neueHaasGrotesk.variable}`}
    >
      <body className="bg-background text-foreground">
        <ReactQueryProvider>
          <AuthStateListener />
          <NavigationLoader />
          <ScrollRestoration />
          <main className="flex min-h-screen flex-col items-center">
            <ToastContainer />
            <Navbar />
            {children}
          </main>
          <Footer />
        </ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
