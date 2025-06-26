import React from 'react';
import Image from 'next/image';
import loadingImage from './akpsilogo.png';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  type?: 'navigation' | 'form' | 'component';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  fullScreen = true,
  type = 'component'
}) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-16 w-16', 
    large: 'h-24 w-24'
  };

  const containerClasses = fullScreen 
    ? "fixed top-16 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-lg z-40"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses} data-loading-type={type}>
      {/* Animated background rings */}
      <div className="relative">
        {/* Outer ring */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-primary/20 animate-ping`}></div>
        
        {/* Middle ring */}
        <div className={`absolute inset-2 ${size === 'large' ? 'h-20 w-20' : size === 'medium' ? 'h-12 w-12' : 'h-4 w-4'} rounded-full border-2 border-secondary/30`} 
             style={{ animation: 'spin 3s linear infinite reverse' }}></div>
        
        {/* Inner spinning gradient ring */}
        <div className={`relative ${sizeClasses[size]} rounded-full p-1 bg-gradient-to-r from-primary via-secondary to-primary animate-spin`}>
          <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
            {/* Logo */}
            <Image
              src={loadingImage}
              alt="Loading..."
              className={`${size === 'large' ? 'h-12 w-12' : size === 'medium' ? 'h-8 w-8' : 'h-4 w-4'} animate-pulse`}
              width={48}
              height={48}
            />
          </div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute -inset-4">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-1/2 right-0 w-1 h-1 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-0 w-1 h-1 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>
      
      {/* Loading text with typing animation */}
      {fullScreen && (
        <div className="mt-8 space-y-2 text-center">
          <div className="flex items-center justify-center space-x-1">
            <span className="text-lg font-medium text-foreground">Loading</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Fetching data...
          </p>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
