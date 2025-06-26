"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../components/akpsilogo.png";
import { InterestForm as InterestFormType } from "@/lib/types";
import customToast from "@/components/CustomToast";
import { RUSH_YEAR } from "@/utils/constants";

interface ShootingStar {
  id: number;
  delay: number;
}

const Star = ({
  top,
  left,
  size,
}: {
  top: number;
  left: number;
  size: number;
}) => (
  <div
    className="absolute rounded-full bg-white"
    style={{
      top: `${top}%`,
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
    }}
  />
);

const ShootingStar = ({ delay }: { delay: number }) => {
  const top = Math.random() * 100;
  const left = Math.random() * 100;

  return (
    <div
      className="absolute h-1 w-1 animate-shooting-star rounded-full bg-blue-200"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

const InterestForm = () => {
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [formData, setFormData] = useState<InterestFormType>({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stars] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setShootingStars((prev) => [
        ...prev.slice(-5),
        { id: Date.now(), delay: Math.random() * 5 },
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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

    try {
      const response = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        customToast("Interest form submitted!", "success");
        setFormData({ name: "", email: "", phone: "" });
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
    <div className="min-h-screen bg-gradient-bg relative overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 bg-background">
        {stars.map((star) => (
          <Star key={star.id} {...star} />
        ))}
        {shootingStars.map((star) => (
          <ShootingStar key={star.id} delay={star.delay} />
        ))}
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tl from-accent/20 to-transparent blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <Image
            src={logo}
            alt="UCSD Alpha Kappa Psi Logo"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
            {RUSH_YEAR} Rush Interest Form
          </h1>
          <p className="text-muted-foreground">
            Thank you for taking interest in UCSD Alpha Kappa Psi
          </p>
        </div>

        {/* Form Container */}
        <div className="card glass w-full max-w-md animate-slide-up">
          <div className="card-header text-center">
            <h2 className="card-title">Join Our Rush</h2>
            <p className="card-description">
              Fill out this form to stay updated on rush events
            </p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="(123) 456-7890"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit Interest Form"}
              </button>
            </form>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-8 text-sm text-muted-foreground animate-fade-in">
          <p>Questions? Follow us on Instagram <a href="https://www.instagram.com/ucsdakpsi" target="_blank" className="text-primary hover:underline">@ucsdakpsi</a></p>
          <p>Or email us at <a href="mailto:akpfall2025@gmail.com" className="text-primary hover:underline">akpfall2025@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default InterestForm;
