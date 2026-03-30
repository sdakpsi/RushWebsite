"use client";

import React from "react";
import { useRouter } from "next/navigation";
import customToast from '@/components/CustomToast';

export default function Page() {
  const router = useRouter();

  const handleUnderstand = () => {
    // Store agreement in localStorage
    localStorage.setItem('privacy_agreed', 'true');
    localStorage.setItem('privacy_agreed_at', new Date().toISOString());
    
    // Show success message
    customToast('Privacy Policy acknowledged successfully!', 'success');
    
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
              Privacy Policy
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
                  This Privacy Policy describes how we collect, use, and protect your information when you use the Alpha Kappa Psi application portal at the University of California, San Diego (UCSD).
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Information We Collect</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>Personal information you provide during the application process (name, email, academic information)</li>
                    <li>Application materials (essays, resume, cover letter)</li>
                    <li>Usage data and analytics to improve the portal experience</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">How We Use Your Information</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>To process and evaluate your application for membership</li>
                    <li>To communicate with you about your application status</li>
                    <li>To improve our application process and portal functionality</li>
                    <li>To maintain records in accordance with organizational requirements</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Information Sharing</h3>
                  <p className="text-gray-300">
                    We do not sell, trade, or otherwise transfer your personal information to third parties. Information is only shared with UCSD AKPsi members involved in the application review process and is kept confidential within the organization.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Data Security</h3>
                  <p className="text-gray-300">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes secure hosting, encrypted data transmission, and restricted access controls.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Data Retention</h3>
                  <p className="text-gray-300">
                    We retain your information for the duration of the application process and for a reasonable period thereafter for organizational records. You may request deletion of your personal data by contacting us directly.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Your Rights</h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>You have the right to access and review your personal information</li>
                    <li>You may request corrections to inaccurate information</li>
                    <li>You may request deletion of your personal data</li>
                    <li>You may withdraw consent for non-essential data processing</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Updates to This Policy</h3>
                  <p className="text-gray-300">
                    We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the effective date.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2 text-white">Contact Us</h3>
                  <p className="text-gray-300">
                    If you have any questions about this Privacy Policy or our data practices, please contact us through the information provided on our website.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mt-8">
            <button 
              onClick={handleUnderstand}
              className="btn-primary hover:scale-105 transition-transform duration-200"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}