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
      className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition duration-300"
    >
      {children}
    </Link>
  );
};

export default NextLinkButton;
