export default async function Page() {
  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-accent/20 to-transparent blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 container py-12">
        <div className="animate-slide-up max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.25-2.25L21 6l-3 3m-5.25-2.25L12 6m0 6l-3-3m-5.25 3.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm10.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground">
              UCSD AKPsi Application
            </p>
          </div>

          {/* Content */}
          <div className="card glass">
            <div className="card-content">
              <div className="text-lg text-left space-y-6">
                <div className="text-muted-foreground">
                  This Privacy Policy describes how your personal information is collected, used, and shared when you apply to Alpha Kappa Psi, the coed business fraternity at the University of California, San Diego (UCSD), through our application portal.
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-foreground">Google OAuth Authentication</h3>
                  <p className="text-muted-foreground mb-4">
                    To streamline the application process and enhance security, our portal utilizes Google OAuth for authentication purposes. When you sign in using Google OAuth, we only access your name and email address. This information is used to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Store and identify your application within our system.</li>
                    <li>Enable us to contact you regarding your application status</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    We do not receive or store any other personal information from your Google account.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-foreground">Information We Collect</h3>
                  <p className="text-muted-foreground">
                    During the application process, you will be asked to provide information about yourself. This information is collected solely for the purpose of evaluating your application to Alpha Kappa Psi.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-foreground">Contact Us</h3>
                  <p className="text-muted-foreground">
                    If you have any questions or concerns regarding this privacy policy or our data protection practices, please contact us at the provided contact information on our website.
                  </p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">
                    By using our application portal, you acknowledge that you have read and understand this Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mt-8">
            <button className="btn-primary">I Understand</button>
          </div>
        </div>
      </div>
    </div>
  );
}
