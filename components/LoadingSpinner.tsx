import React from 'react';
import Image from 'next/image';
import loadingImage from './akpsilogo.png';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  fullScreen = true 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12', 
    large: 'h-20 w-20'
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-black/20 z-50"
    : "flex items-center justify-center p-4";

  return (
    <div className={containerClasses}>
      <Image
        src={loadingImage}
        alt="Loading..."
        className={`animate-spin ${sizeClasses[size]}`}
        style={{ animation: 'spin 2s linear infinite' }}
      />
    </div>
  );
};

export default LoadingSpinner;
