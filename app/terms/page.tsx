"use client";

import React from "react";
import { useRouter } from "next/navigation";
import customToast from '@/components/CustomToast';

export default function Page() {
  const router = useRouter();

  const handleAgree = () => {
    // Store agreement in localStorage
    localStorage.setItem('terms_agreed', 'true');
    localStorage.setItem('terms_agreed_at', new Date().toISOString());
    
    // Show success message
    customToast('Terms of Service accepted successfully!', 'success');
    
    // Redirect to application page after a short delay
    setTimeout(() => {
      router.push('/application');
    }, 1000);
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300">
              UCSD AKPsi Application
            </p>
          </div>

          {/* Content */}
          <div className="card glass">
            <div className="card-content">
              <div className="text-lg text-left space-y-6">
                <div className="text-gray-300">
                  These Terms of Service govern your use of the application portal for Alpha Kappa Psi at the University of California, San Diego (UCSD). By accessing or using the portal, you agree to be bound by these terms.
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Use of the Portal</h3>
                  <p className="text-gray-300">
                    The portal is intended for personal and non-commercial use. You agree not to misuse the portal or help anyone else do so.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Your Commitments</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>You must provide accurate information during the application process.</li>
                    <li>You agree not to share your login credentials or let anyone else access your account.</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Rights and Ownership</h3>
                  <p className="text-gray-300">
                    All rights, title, and interest in and to the portal (including all intellectual property rights) are and will remain the exclusive property of UCSD AKPsi and its licensors.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Limitation of Liability</h3>
                  <p className="text-gray-300">
                    To the extent permitted by law, UCSD and UCSD AKPsi will not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Amendments</h3>
                  <p className="text-gray-300">
                    We reserve the right to modify these Terms of Service at any time. Your continued use of the portal after any such modification constitutes your acceptance of the new Terms of Service.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Contact Us</h3>
                  <p className="text-gray-300">
                    If you have any questions about these Terms of Service, please contact us via the information provided on our website.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mt-8">
            <button 
              onClick={handleAgree}
              className="btn-primary hover:scale-105 transition-transform duration-200"
            >
              I Agree to the Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}