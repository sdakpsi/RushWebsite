"use client";
import React, { useState, useEffect } from "react";

const Timer = () => {
  const calculateTimeLeft = () => {
    const targetDate = new Date("2024-09-30T18:00:00"); // Target date
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [mounted, setMounted] = useState(false);

  // Prevent server-side rendering of the timer component
  useEffect(() => {
    setMounted(true); // Ensure this runs only on the client
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, "0");

  if (!mounted) {
    // Avoid rendering mismatched content during SSR by rendering nothing initially
    return null;
  }

  return (
    <div className="mt-8 flex justify-center gap-5">
      <div className="rounded-lg bg-black/80 p-3 text-center text-white">
        <p className="text-5xl font-bold">{formatTime(timeLeft.days)}</p>
        <p className="text-gray-400">Days</p>
      </div>
      <div className="rounded-lg bg-black/80 p-3 text-center text-white">
        <p className="text-5xl font-bold">{formatTime(timeLeft.hours)}</p>
        <p className="text-gray-400">Hours</p>
      </div>
      <div className="rounded-lg bg-black/80 p-3 text-center text-white">
        <p className="text-5xl font-bold">{formatTime(timeLeft.minutes)}</p>
        <p className="text-gray-400">Minutes</p>
      </div>
      <div className="rounded-lg bg-black/80 p-3 text-center text-white">
        <p className="text-5xl font-bold">{formatTime(timeLeft.seconds)}</p>
        <p className="text-gray-400">Seconds</p>
      </div>
    </div>
  );
};

export default Timer;
