import Link from 'next/link';
import React from 'react';

interface NextLinkButtonProps {
  destination: string;
  children: React.ReactNode;
}

const NextLinkButton: React.FC<NextLinkButtonProps> = ({
  destination,
  children,
}) => {
  return (
    <Link
      href={destination}
      className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
    >
      {children}
    </Link>
  );
};

export default NextLinkButton;
