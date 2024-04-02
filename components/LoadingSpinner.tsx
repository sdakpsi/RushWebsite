import React from 'react';
import Image from 'next/image';
import loadingImage from './akpsilogo.png';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Image
        src={loadingImage}
        alt="Loading..."
        className="animate-spin h-20 w-20" // Tailwind CSS classes for size and spin animation
        style={{ animation: 'spin 2s linear infinite' }} // Inline style for non-Tailwind CSS users
      />
    </div>
  );
};

export default LoadingSpinner;
