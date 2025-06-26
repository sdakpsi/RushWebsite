import Link from "next/link";
import Image from "next/image";
import background from "./background.png";
import tagline from "./tagline.png";
import MainPageContent from "@/components/MainPageContent";
import { currentTheme } from "@/utils/theme";

export default async function Index() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background with dark theme overlay */}
      <div
        className="absolute inset-0 z-0 bg-background"
        style={{
          backgroundImage: `url(${background.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      {/* Floating elements for visual interest */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-accent/20 to-transparent blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Main content area */}
      <div className="relative z-20 flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="mx-auto max-w-7xl">
            {/* Tagline */}
            <div className="mb-12 flex justify-center animate-slide-down">
              <Image 
                src={tagline} 
                alt="tagline" 
                className="h-auto w-[85%] max-w-4xl md:w-[70%]" 
                priority
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
              {/* Welcome Section */}
              <div className="lg:col-span-2">
                <div className="card glass animate-slide-up">
                  <div className="card-header">
                    <h1 className="card-title bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      Welcome to {currentTheme.branding.organization} {currentTheme.branding.rushYear} Application Portal
                    </h1>
                  </div>
                  
                  <div className="card-content space-y-6">
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Please fill out the interest form below to receive updates regarding rush!
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Link href="/interest" className="flex-1">
                          <button className="btn-primary w-full transform transition-all">
                            Interest Form
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 text-muted-foreground">Application Portal</span>
                      </div>
                    </div>

                    {/* Main Page Content */}
                    <MainPageContent />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Timer Card (when enabled) */}
                {/* <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="card-header">
                    <h3 className="card-title text-center">⏰ Rush Countdown</h3>
                  </div>
                  <div className="card-content">
                    <Timer />
                  </div>
                </div> */}

                {/* Quick Links */}
                <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <div className="card-header">
                    <h3 className="card-title">Quick Links</h3>
                  </div>
                  <div className="card-content space-y-3">
                    <a 
                      href={currentTheme.branding.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline w-full"
                    >
                      Official Website
                    </a>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="card animate-slide-up" style={{ animationDelay: '0.6s' }}>
                  <div className="card-header">
                    <h3 className="card-title">Need Help?</h3>
                  </div>
                  <div className="card-content">
                    <p className="text-sm text-muted-foreground">
                      If you're having any issues or have questions, please {currentTheme.branding.rushChairs}!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Notice */}
            <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <p className="text-xs text-muted-foreground">
                *When signing in, it will ask to continue to{" "}
                <span className="font-mono font-medium">kvuilkasrtgyazkvxjal.supabase.co</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
