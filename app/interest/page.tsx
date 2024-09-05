'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import logo from '../../components/akpsilogo.png';

interface ShootingStar {
  id: number;
  delay: number;
}

const Star = ({ top, left, size }: { top: number; left: number; size: number }) => (
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
      setShootingStars(prev => [
        ...prev.slice(-4), // Keep last 5 shooting stars
        { id: Date.now(), delay: Math.random() * 5 }
      ]);
    }, 2000); // New shooting star every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-col bg-gradient-to-b from-blue-900 to-black flex items-center justify-center p-4 relative min-h-screen w-screen overflow-hidden">
      {stars.map((star) => (
        <Star key={star.id} {...star} />
      ))}
      {shootingStars.map((star) => (
        <ShootingStar key={star.id} delay={star.delay} />
      ))}
    <div className="flex flex-col items-center mb-8">
      <Image
        src={logo}
        alt="logo"
        width={80}
        height={80}
        className="mb-4"
      />
      <span className="text-2xl text-white">UCSD Alpha Kappa Psi</span>
    </div>
      <div className="bg-blue-800 bg-opacity-30 rounded-lg p-8 backdrop-blur-sm max-w-md relative z-10">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Align Your Stars</h1>
        <h2 className="text-xl text-blue-200 mb-8 text-center">Alpha Kappa Psi | Fall 2024 Rush</h2>
        <form className="space-y-6 w-full">
          <div>
            <label htmlFor="name" className="block text-blue-200 mb-2">Name*</label>
            <input type="text" id="name" required className="w-full p-2 rounded bg-blue-900 bg-opacity-50 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className="block text-blue-200 mb-2">Email*</label>
            <input type="email" id="email" required className="w-full p-2 rounded bg-blue-900 bg-opacity-50 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="your@email.com" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-blue-200 mb-2">Phone</label>
            <input type="tel" id="phone" className="w-full p-2 rounded mb-3 bg-blue-900 bg-opacity-50 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="(123) 456-7890" />
          </div>
          <button type="submit" className="w-full bg-blue-800 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterestForm;
