"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../components/akpsilogo.png";
import background from "../background.png";
import { InterestForm as InterestFormType } from "@/lib/types";
import customToast from "@/components/CustomToast";
import { RUSH_YEAR } from "@/utils/constants";

const GentleOrb = ({
  top,
  left,
  size,
  delay,
}: {
  top: number;
  left: number;
  size: number;
  delay: number;
}) => (
  <div
    className="absolute rounded-full bg-blue-400/5 border border-blue-300/10"
    style={{
      top: `${top}%`,
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
      animation: `gentle-breathe 8s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}
  />
);

const InterestForm = () => {
  const [formData, setFormData] = useState<InterestFormType>({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gentleOrbs] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 40 + 20,
      delay: Math.random() * 8,
    }))
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((previousFormData) => ({
      ...previousFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // Enhanced validation
    if (!data.name || !data.email) {
      customToast("Name and email are required", "error");
      setIsSubmitting(false);
      return;
    }

    const nameWords = (data.name as string).trim().split(/\s+/);
    if (nameWords.length < 2) {
      customToast("Please enter your full name (first and last name)", "error");
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(data.email as string)) {
      customToast("Please enter a valid email address", "error");
      setIsSubmitting(false);
      return;
    }

    // Phone validation (if provided)
    if (data.phone && (data.phone as string).trim()) {
      const phonePattern = /^[\+]?[1-9]?[\d\s\-\(\)]{10,15}$/;
      const cleanPhone = (data.phone as string).replace(/[^\d]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        customToast("Please enter a valid phone number", "error");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        customToast("🎉 Interest form submitted successfully! You'll receive updates soon.", "success");
        setFormData({ name: "", email: "", phone: "" });
        
        // Add a brief celebration effect
        setTimeout(() => {
          const form = document.querySelector('form');
          if (form) {
            form.style.transform = 'scale(1.05)';
            setTimeout(() => {
              form.style.transform = 'scale(1)';
            }, 200);
          }
        }, 100);
      } else {
        const errorData = await response.json();
        customToast(errorData.message || "Error submitting form", "error");
      }
    } catch (error) {
      customToast(`An error occurred: ${error}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="prospect-theme relative min-h-screen w-full overflow-hidden">
      {/* Background image - same as main page */}
      <div
        className="absolute inset-0 z-0 bg-background"
        style={{
          backgroundImage: `url(${background.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          imageRendering: "crisp-edges",
          filter: "contrast(1.1) brightness(1.05)",
        }}
      />

      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-4 overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <Image
            src={logo}
            alt="UCSD Alpha Kappa Psi Logo"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-white mb-2">
            {RUSH_YEAR} Rush Interest Form
          </h1>
          <p className="text-gray-300">
            Thank you for taking interest in UCSD Alpha Kappa Psi
          </p>
        </div>

        {/* Form Container */}
        <div className="prospect-card prospect-glass w-full max-w-md animate-slide-up rounded-xl p-6">
          <div className="card-header text-center">
            <h2 className="card-title text-white">Join Our Rush</h2>
            <p className="card-description text-gray-300">
              Fill out this form to stay updated on rush events
            </p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-12 rounded-lg px-4 py-3 text-sm bg-white/95 text-gray-900 placeholder:text-gray-500 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your full name"
                  required
                  minLength={3}
                  maxLength={50}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 rounded-lg px-4 py-3 text-sm bg-white/95 text-gray-900 placeholder:text-gray-500 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="your@email.com"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2 text-white">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers, spaces, dashes, parentheses, and plus
                    const cleaned = value.replace(/[^\d\s\-\(\)\+]/g, '');
                    setFormData(prev => ({ ...prev, phone: cleaned }));
                  }}
                  className="w-full h-12 rounded-lg px-4 py-3 text-sm bg-white/95 text-gray-900 placeholder:text-gray-500 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="(123) 456-7890"
                  maxLength={20}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
                className="w-full h-12 rounded-lg px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Interest Form"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-8 text-sm text-gray-300 animate-fade-in">
          <p>Questions? Follow us on Instagram <a href="https://www.instagram.com/ucsdakpsi" target="_blank" className="text-white hover:underline">@ucsdakpsi</a></p>
          <p>Or email us at <a href="mailto:akpfall2025@gmail.com" className="text-white hover:underline">akpfall2025@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default InterestForm;
