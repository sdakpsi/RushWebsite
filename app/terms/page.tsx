export default async function Page() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
        <div className="flex flex-col gap-8 sm:gap-16 items-center">
          <div className="text-3xl lg:text-4xl leading-tight mx-auto max-w-3xl text-center mt-32">
            UCSD AKPsi Application Terms of Service
          </div>
          <div className="text-lg text-left mx-auto max-w-xl">
            <div className="mb-4 text-gray-300">
              These Terms of Service govern your use of the application portal
              for Alpha Kappa Psi at the University of California, San Diego
              (UCSD). By accessing or using the portal, you agree to be bound by
              these terms.
            </div>
            <div className="font-bold mb-2">Use of the Portal</div>
            <div className="mb-4 text-gray-300">
              The portal is intended for personal and non-commercial use. You
              agree not to misuse the portal or help anyone else do so.
            </div>
            <div className="font-bold mb-2">Your Commitments</div>
            <div className="ml-4 mb-4 text-gray-300">
              <li>
                You must provide accurate information during the application
                process.
              </li>
              <li>
                You agree not to share your login credentials or let anyone else
                access your account.
              </li>
            </div>
            <div className="font-bold mb-2">Rights and Ownership</div>
            <div className="mb-4 text-gray-300">
              All rights, title, and interest in and to the portal (including
              all intellectual property rights) are and will remain the
              exclusive property of UCSD AKPsi and its licensors.
            </div>
            <div className="font-bold mb-2">Limitation of Liability</div>
            <div className="mb-4 text-gray-300">
              To the extent permitted by law, UCSD and UCSD AKPsi will not be liable for any
              indirect, incidental, special, consequential or punitive damages,
              or any loss of profits or revenues, whether incurred directly or
              indirectly.
            </div>
            <div className="font-bold mb-2">Amendments</div>
            <div className="mb-4 text-gray-300">
              We reserve the right to modify these Terms of Service at any time.
              Your continued use of the portal after any such modification
              constitutes your acceptance of the new Terms of Service.
            </div>
            <div className="font-bold mb-2">Contact Us</div>
            <div className="mb-4 text-gray-300">
              If you have any questions about these Terms of Service, please
              contact us via the information provided on our website.
            </div>
          </div>
          <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
        </div>
      </div>
    </div>
  );
}
