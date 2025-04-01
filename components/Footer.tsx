import Link from 'next/link';

export default function Navbar() {
  return (
    <footer className="w-full border-t border-t-foreground/10 p-6 flex gap-2 justify-center text-center text-sm">
      <p>
        <a
          href="https://www.akpsiucsd.com"
          target="_blank"
          className="font-bold hover:underline"
          rel="noreferrer"
        >
          UCSD Alpha Kappa Psi
        </a>
      </p>
      <p>&#x2022;</p>
      <p>
        <Link href="/privacy" className="font-bold hover:underline">
          Privacy
        </Link>
      </p>
      <p>&#x2022;</p>
      <p>
        <Link href="/terms" className="font-bold hover:underline">
          Terms
        </Link>
      </p>
    </footer>
  );
}
