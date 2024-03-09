export default async function Page() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <div className="flex flex-col gap-8 sm:gap-16 items-center">
          <div className="text-3xl lg:text-4xl leading-tight mx-auto max-w-2xl text-center mt-32">
            UCSD AKPsi Application Privacy Policy
          </div>
          <div className="text-lg text-left mx-auto max-w-xl">
            <div className="mb-4 text-gray-300">
              This Privacy Policy describes how your personal information is
              collected, used, and shared when you apply to Alpha Kappa Psi, the
              coed business fraternity at the University of California, San
              Diego (UCSD), through our application portal.
            </div>
            <div className="font-bold mb-2">Google OAuth Authentication</div>
            <div className="mb-4 text-gray-300">
              To streamline the application process and enhance security, our
              portal utilizes Google OAuth for authentication purposes. When you
              sign in using Google OAuth, we only access your name and email
              address. This information is used to:
            </div>
            <div className="ml-4 mb-4 text-gray-300">
              <li> Store and identify your application within our system.</li>
              <li>
                Enable us to contact you regarding your application status
              </li>
            </div>
            <div className="mb-4 text-gray-300">
              We do not receive or store any other personal information from
              your Google account.
            </div>
            <div className="font-bold mb-2">Information We Collect</div>
            <div className="mb-4 text-gray-300">
              During the application process, you will be asked to provide
              information about yourself. This information is collected solely
              for the purpose of evaluating your application to Alpha Kappa Psi.
            </div>
            <div className="font-bold mb-2">Contact Us</div>
            <div className="mb-4 text-gray-300">
              If you have any questions or concerns regarding this privacy
              policy or our data protection practices, please contact us at the
              provided contact information on our website.
            </div>
            <div className="text-gray-300">
              By using our application portal, you acknowledge that you have
              read and understand this Privacy Policy.
            </div>
          </div>
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        </div>
      </div>
    </div>
  );
}
