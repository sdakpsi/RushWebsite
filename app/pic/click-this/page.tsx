"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const CongratulationsPage = () => {
  const { width, height } = useWindowSize();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => setIsVisible(true), 500);
  }, []);

  // Stick figure components - Fixed to keep the body connected
  const StickFigure = ({ isFemale, x, delay, scale = 1 }) => {
    const bounceY = isFemale ? [0, -20, 0, -15, 0] : [0, -30, 0, -25, 0];
    const armRotation = isFemale
      ? [-10, 30, -10, 20, -10]
      : [-20, 40, -20, 30, -20];
    const legSpread = isFemale ? [0, 15, 0, 10, 0] : [0, 25, 0, 20, 0];
    // Color based on gender
    const figureColor = isFemale ? "#FF69B4" : "#1E90FF"; // Hot pink for girls, blue for guys

    return (
      <motion.div
        className="absolute bottom-20"
        style={{ x, scale }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: delay + 1, duration: 0.8, ease: "backOut" }}
      >
        {/* Move the entire figure with a single bouncing animation */}
        <motion.div
          animate={{ y: bounceY }}
          transition={{ repeat: Infinity, duration: 1.5, delay }}
        >
          <svg
            width="100"
            height="160"
            viewBox="0 0 100 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Head */}
            <circle
              cx="50"
              cy="30"
              r="20"
              stroke={figureColor}
              strokeWidth="3"
              fill="none"
            />

            {/* Body */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="100"
              stroke={figureColor}
              strokeWidth="3"
            />

            {/* Female skirt (only for female figures) - now part of the main figure */}
            {isFemale && (
              <>
                <path
                  d="M35 100 L50 80 L65 100"
                  stroke={figureColor}
                  strokeWidth="3"
                  fill="none"
                />
                <line
                  x1="35"
                  y1="100"
                  x2="65"
                  y2="100"
                  stroke={figureColor}
                  strokeWidth="3"
                />
              </>
            )}

            {/* Arms - only the rotation is animated, not the position */}
            <motion.line
              x1="50"
              y1="70"
              x2="30"
              y2="85"
              stroke={figureColor}
              strokeWidth="3"
              animate={{ rotate: armRotation }}
              style={{ transformOrigin: "50px 70px" }}
              transition={{ repeat: Infinity, duration: 1.5, delay }}
            />
            <motion.line
              x1="50"
              y1="70"
              x2="70"
              y2="85"
              stroke={figureColor}
              strokeWidth="3"
              animate={{ rotate: armRotation.map((r) => -r) }}
              style={{ transformOrigin: "50px 70px" }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: delay + 0.2,
              }}
            />

            {/* Legs - only the rotation is animated, not the position */}
            <motion.line
              x1="50"
              y1="100"
              x2="35"
              y2="150"
              stroke={figureColor}
              strokeWidth="3"
              animate={{ rotate: legSpread.map((l) => -l) }}
              style={{ transformOrigin: "50px 100px" }}
              transition={{ repeat: Infinity, duration: 1.5, delay }}
            />
            <motion.line
              x1="50"
              y1="100"
              x2="65"
              y2="150"
              stroke={figureColor}
              strokeWidth="3"
              animate={{ rotate: legSpread }}
              style={{ transformOrigin: "50px 100px" }}
              transition={{ repeat: Infinity, duration: 1.5, delay }}
            />
          </svg>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900">
      {/* Confetti effect - ensuring it covers the whole screen */}
      {isVisible && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={400}
          gravity={0.15}
          recycle={true}
          initialVelocityX={5}
          initialVelocityY={10}
          confettiSource={{
            x: 0,
            y: 0,
            w: width,
            h: 0,
          }}
          colors={[
            "#FFD700",
            "#FF6347",
            "#9370DB",
            "#00CED1",
            "#FF1493",
            "#7CFC00",
          ]}
        />
      )}

      {/* Glowing orbs background */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-20"
            initial={{
              scale: 0,
              x: Math.random() * width - width / 2,
              y: Math.random() * height - height / 2,
            }}
            animate={{
              scale: [0, 1 + Math.random()],
              opacity: [0, 0.1 + Math.random() * 0.2],
              x: [
                Math.random() * width - width / 2,
                Math.random() * width - width / 2,
              ],
              y: [
                Math.random() * height - height / 2,
                Math.random() * height - height / 2,
              ],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              width: `${20 + Math.random() * 100}px`,
              height: `${20 + Math.random() * 100}px`,
              filter: "blur(20px)",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="text-center">
          {/* Pulsing glow effect */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              scale: [0.8, 1.1, 0.8],
              filter: ["blur(40px)", "blur(60px)", "blur(40px)"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Main text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            <motion.h2
              className="mb-4 font-sans text-3xl font-bold uppercase tracking-wider text-purple-300"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Congratulations
            </motion.h2>

            <motion.h1
              className="relative mb-6 font-serif text-7xl font-bold uppercase tracking-wide text-white"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: isVisible ? 1 : 0.8,
                opacity: isVisible ? 1 : 0,
                textShadow: [
                  "0 0 15px rgba(255,255,255,0.5)",
                  "0 0 30px rgba(255,255,255,0.5)",
                  "0 0 15px rgba(255,255,255,0.5)",
                ],
              }}
              transition={{
                duration: 2,
                delay: 1,
                textShadow: { repeat: Infinity, duration: 3 },
              }}
            >
              Gamma Alpha PIC
            </motion.h1>

            {/* Animated underline */}
            <motion.div
              className="mx-auto h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
              initial={{ width: 0 }}
              animate={{ width: isVisible ? "80%" : 0 }}
              transition={{ duration: 1.5, delay: 1.5 }}
            />
          </motion.div>

          {/* Stick Figures - 4 males and 2 females */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <StickFigure
              isFemale={false}
              x={width * 0.1}
              delay={0}
              scale={1.2}
            />
            <StickFigure isFemale={true} x={width * 0.25} delay={0.2} />
            <StickFigure
              isFemale={false}
              x={width * 0.4}
              delay={0.4}
              scale={0.9}
            />
            <StickFigure isFemale={false} x={width * 0.6} delay={0.1} />
            <StickFigure
              isFemale={true}
              x={width * 0.75}
              delay={0.3}
              scale={1.1}
            />
            <StickFigure
              isFemale={false}
              x={width * 0.9}
              delay={0.5}
              scale={0.95}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongratulationsPage;
