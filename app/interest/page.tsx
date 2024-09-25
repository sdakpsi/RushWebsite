"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../components/akpsilogo.png";
import { InterestForm as InterestFormType } from "@/lib/types";
import customToast from "@/components/CustomToast";
import background from "../background.png";

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
        ...prev.slice(-4), // Keep last 5 shooting stars
        { id: Date.now(), delay: Math.random() * 5 },
      ]);
    }, 2000); // New shooting star every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((previousFormData) => {
      return {
        // ... spread operator -> copy all the properties from the previous form data
        ...previousFormData,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prepare form data
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // Validate required fields
    if (
      (!data.name && !data.email) ||
      (data.name === "" && data.email === "")
    ) {
      customToast("Name and email cannot be empty", "error");
      return;
    }

    if (data.name === "") {
      customToast("Name cannot be empty", "error");
      return;
    }

    if (data.email === "") {
      customToast("Email cannot be empty", "error");
      return;
    }

    const nameWords = (data.name as string).trim().split(/\s+/);
    if (nameWords.length < 2) {
      customToast("Please enter your full name (first and last name)", "error");
      return;
    }

    try {
      // Make API call
      const response = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Check if response is ok, handle errors
      if (response.ok) {
        customToast("Interest form submitted!", "success");
        setFormData({
          name: "",
          email: "",
          phone: "",
        });
      } else {
        // If response is not ok, extract error message from the response
        const errorData = await response.json();
        if (errorData.message) {
          customToast(errorData.message, "error");
        } else {
          customToast("Error submitting the form. Please try again.", "error");
        }
      }
    } catch (error: any) {
      // Handle any network or unexpected errors
      customToast(`An error occurred: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <div>Submitting...</div>;
  }

  return (
    <div
      className="relative flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden p-4"
      style={{
        backgroundImage: `url(${background.src})`,

        backgroundSize: "cover",

        backgroundPosition: "center",

        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 z-0 bg-black opacity-20"></div>
      {stars.map((star) => (
        <Star key={star.id} {...star} />
      ))}
      {shootingStars.map((star) => (
        <ShootingStar key={star.id} delay={star.delay} />
      ))}
      <div className="relative mt-4 max-w-md">
        <div className="mb-8 flex flex-row items-center justify-center">
          <Image
            src={logo}
            alt="logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <span className="bon-vivant-text-bold ml-4 text-lg text-white lg:text-2xl">
            UCSD Alpha Kappa Psi
          </span>
        </div>

        <div className="lg:text-md libre-caslon-text-regular mb-8 px-2 text-left text-sm text-white">
          Hello! Thank you for taking interest in UCSD Alpha Kappa Psi's Fall
          2024 Rush Week. The brothers of Alpha Kappa Psi are looking forward to
          see you during Week 1 of Fall Quarter. We hope that you are just as
          excited for this journey as we are!
          <br />
          <br />
          Please fill out this form so we can keep you updated about our
          upcoming rush events and details. Feel free to contact us on our
          social media if you have any questions!
          <br />
          <br />
          For questions –<br />
          Instagram:{" "}
          <a
            target="_blank"
            href="https://www.instagram.com/ucsdakpsi"
            className="underline"
          >
            @ucsdakpsi
          </a>
          <br />
          Email:{" "}
          <a
            target="_blank"
            href="mailto:akpfall2024@gmail.com"
            className="underline"
          >
            akpfall2024@gmail.com
          </a>
        </div>
      </div>
      <div className="relative z-10 max-w-md rounded-lg bg-cyan-950 bg-opacity-50 p-8 backdrop-blur-sm md:w-full">
        <h1 className="bon-vivant-text-bold mb-6 text-center text-3xl font-bold text-white">
          Align Your Stars
        </h1>
        <h2 className="bon-vivant-text-regular mb-8 text-center text-xl text-blue-200">
          Alpha Kappa Psi | Fall 2024 Rush
        </h2>
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div>
            <label
              htmlFor="name"
              className="bon-vivant-text-bold mb-2 block text-blue-200"
            >
              Your full name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bon-vivant-text-regular w-full rounded bg-cyan-900 bg-opacity-50 p-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="bon-vivant-text-bold mb-2 block text-blue-200"
            >
              Email*
            </label>

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="bon-vivant-text-regular w-full rounded bg-cyan-900 bg-opacity-50 p-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="bon-vivant-text-bold mb-2 block text-blue-200"
            >
              Phone
            </label>

            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="bon-vivant-text-regular mb-3 w-full rounded bg-cyan-900 bg-opacity-50 p-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="(123) 456-7890"
            />
          </div>

          <button
            type="submit"
            className="bon-vivant-text-regular w-full rounded bg-cyan-800 px-4 py-2 font-bold text-white transition duration-300 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterestForm;
