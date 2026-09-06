import Link from 'next/link';
import { currentTheme } from '@/utils/theme';
import { RUSH_EMAIL } from '@/utils/constants';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/20 bg-muted/30 backdrop-blur-sm">
      <div className="container px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Organization Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">
              {currentTheme.branding.organization}
            </h3>
            <p className="text-sm text-muted-foreground">
              Professional Business Fraternity
            </p>
            <a
              href={currentTheme.branding.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Visit Official Website
              <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLScbhQ7B1qzs5_ZWkjY-RFDejC34dG3di7dMbu_xFA4pe33KYA/viewform" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                Interest Form
              </a>
            </div>
          </div>

          {/* Rush Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">
              {currentTheme.branding.rushYear} Rush
            </h3>
            <p className="text-sm text-muted-foreground">
              For any questions, contact {currentTheme.branding.rushChairs}, or email{' '}
              <a className="underline hover:text-primary" href={`mailto:${RUSH_EMAIL}`}>
                {RUSH_EMAIL}
              </a>.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-border/20 pt-6">
          <div className="flex flex-col items-center justify-between space-y-4 text-sm text-muted-foreground md:flex-row md:space-y-0">
            <p>
              © {new Date().getFullYear()} {currentTheme.branding.organization}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs">
                Rush Website {currentTheme.branding.rushYear}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
