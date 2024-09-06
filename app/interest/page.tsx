'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '../../components/akpsilogo.png';
import { toast } from 'react-toastify';
import { InterestForm as InterestFormType } from '@/lib/types';
import { libreCaslon } from '@/fonts/fonts';

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
    className="absolute bg-white rounded-full"
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
      className="absolute w-1 h-1 bg-blue-200 rounded-full animate-shooting-star"
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
    name: '',
    email: '',
    phone: '',
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
    // setIsSubmitting(true); Commented this out for now because the loading state is ugly and we don't need it right now
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    console.log(formData);
    // name, email, phone
    const data = Object.fromEntries(formData.entries());
    // {
    //   name: string;
    //   email: string;
    //   phone: string | null;
    // } => data
    if (data.name === '' || data.email === '') {
      toast.error('Name and email are required');
      setIsSubmitting(false);
      return;
    }
    // await means were wait going to wait at this code
    try {
      const response = await fetch('/api/interest', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast.success('Application submitted successfully');
        setFormData({
          name: '',
          email: '',
          phone: '',
        });
      }
    } catch (error) {
      toast.error(`Error submitting application`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <div>Submitting...</div>;
  }

  return (
    <div className="flex-col bg-gradient-to-b from-blue-900 to-black flex items-center justify-center p-4 relative min-h-screen w-screen overflow-hidden">
      {stars.map((star) => (
        <Star key={star.id} {...star} />
      ))}
      {shootingStars.map((star) => (
        <ShootingStar key={star.id} delay={star.delay} />
      ))}
      <div className="max-w-md relative mt-4">
        <div className="flex flex-row items-center justify-center mb-8">
          <Image
            src={logo}
            alt="logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <span className="ml-4 text-lg lg:text-2xl text-white bon-vivant-text-bold">
            UCSD Alpha Kappa Psi
          </span>
        </div>

        <div className="text-white text-left mb-8 text-sm px-2 lg:text-md libre-caslon-text-regular">
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
          Instagram:{' '}
          <a
            target="_blank"
            href="https://www.instagram.com/ucsdakpsi"
            className="underline"
          >
            @ucsdakpsi
          </a>
          <br />
          Email:{' '}
          <a
            target="_blank"
            href="mailto:akpfall2024@gmail.com"
            className="underline"
          >
            akpfall2024@gmail.com
          </a>
        </div>
      </div>
      <div className="bg-blue-800 bg-opacity-30 rounded-lg p-8 backdrop-blur-sm max-w-md md:w-full relative z-10">
        <h1 className="text-3xl font-bold text-white mb-6 text-center bon-vivant-text-bold">
          COMING SOON
        </h1>
        <h2 className="text-xl text-blue-200 mb-8 text-center bon-vivant-text-regular">
          Alpha Kappa Psi | Fall 2024 Rush
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div>
            <label
              htmlFor="name"
              className="block text-blue-200 mb-2 bon-vivant-text-bold"
            >
              Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-blue-900 bg-opacity-50 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bon-vivant-text-regular"
              placeholder="Your name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-blue-200 mb-2 bon-vivant-text-bold"
            >
              Email*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 rounded bg-blue-900 bg-opacity-50 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bon-vivant-text-regular"
              placeholder="Your@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-blue-200 mb-2 bon-vivant-text-bold"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 rounded mb-3 bg-blue-900 bg-opacity-50 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bon-vivant-text-regular"
              placeholder="(123) 456-7890"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 bon-vivant-text-regular"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterestForm;
