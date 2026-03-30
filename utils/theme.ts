// Theme Configuration
// This file makes it easy to change themes for future rushes
// Simply update the theme object below and rebuild the app

export interface Theme {
  name: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
    success: string;
    warning: string;
    info: string;
    gradientFrom: string;
    gradientTo: string;
  };
  branding: {
    rushYear: string;
    organization: string;
    website: string;
    rushChairs: string;
    applicationOpen: 'open' | 'closed' | 'coming_soon';
    applicationDeadline: string;
  };
}

// Current Theme - Update this for future rushes
export const currentTheme: Theme = {
  name: "Spring 2026 Rush - Light",
  colors: {
    primary: "0 0% 42%",              // Medium gray for primary buttons/links
    primaryForeground: "0 0% 100%",   // White text on primary
    secondary: "0 0% 95%",            // Very light gray
    secondaryForeground: "0 0% 15%",  // Dark text on secondary
    accent: "0 0% 88%",               // Light gray accent
    accentForeground: "0 0% 10%",     // Dark text on accent
    background: "0 0% 91%",           // Light gray matching background image
    foreground: "0 0% 10%",           // Near-black text
    muted: "0 0% 85%",                // Muted gray
    mutedForeground: "0 0% 40%",      // Medium gray text
    border: "0 0% 80%",               // Gray borders
    input: "0 0% 96%",                // Near-white inputs
    ring: "0 0% 25%",                 // Dark focus ring
    destructive: "0 72% 51%",
    destructiveForeground: "0 0% 100%",
    success: "142 72% 29%",
    warning: "38 92% 50%",
    info: "0 0% 30%",                 // Dark gray info
    gradientFrom: "0 0% 20%",
    gradientTo: "0 0% 35%",
  },
  branding: {
    rushYear: "Spring '26",
    organization: "UCSD Alpha Kappa Psi",
    website: "https://www.akpsiatucsd.com",
    rushChairs: "Contact our rush chairs Heather Jeon @ (213)-999-3685 and Hailey Kim @ (714)-715-0072",
    applicationOpen: 'coming_soon',
    applicationDeadline: 'Thursday, April 9th at 2 PM',
  }
};

// Alternative Theme Examples - Uncomment and use currentTheme = [themeName] to switch

export const springTheme: Theme = {
  name: "Spring 2026 Rush",
  colors: {
    primary: "142 76% 36%",          // Green theme
    primaryForeground: "0 0% 100%",
    secondary: "120 40% 98%",
    secondaryForeground: "125 84% 5%",
    accent: "120 40% 90%",
    accentForeground: "125 84% 15%",
    background: "0 0% 100%",
    foreground: "125 84% 5%",
    muted: "120 40% 96%",
    mutedForeground: "125 13% 37%",
    border: "124 32% 91%",
    input: "124 32% 91%",
    ring: "142 76% 36%",
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 100%",
    success: "142 76% 36%",
    warning: "38 92% 50%",
    info: "199 89% 48%",
    gradientFrom: "142 76% 46%",
    gradientTo: "180 76% 46%",
  },
  branding: {
    rushYear: "Spring '26",
    organization: "UCSD Alpha Kappa Psi",
    website: "https://akpsiatucsd.com",
    rushChairs: "contact [Rush Chair Names] @ [Phone Numbers]",
    applicationOpen: 'open',
    applicationDeadline: 'TBD',
  }
};

export const fallTheme: Theme = {
  name: "Fall 2026 Rush",
  colors: {
    primary: "25 95% 53%",           // Orange theme
    primaryForeground: "0 0% 100%",
    secondary: "30 40% 98%",
    secondaryForeground: "35 84% 5%",
    accent: "30 40% 90%",
    accentForeground: "35 84% 15%",
    background: "0 0% 100%",
    foreground: "35 84% 5%",
    muted: "30 40% 96%",
    mutedForeground: "35 13% 37%",
    border: "34 32% 91%",
    input: "34 32% 91%",
    ring: "25 95% 53%",
    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 100%",
    success: "142 76% 36%",
    warning: "38 92% 50%",
    info: "199 89% 48%",
    gradientFrom: "25 95% 63%",
    gradientTo: "45 95% 63%",
  },
  branding: {
    rushYear: "Fall '26",
    organization: "UCSD Alpha Kappa Psi",
    website: "https://akpsiatucsd.com",
    rushChairs: "contact [Rush Chair Names] @ [Phone Numbers]",
    applicationOpen: 'open',
    applicationDeadline: 'TBD',
  }
};

// Utility function to generate CSS variables from theme
export function generateThemeCSS(theme: Theme): string {
  return `
    --primary: ${theme.colors.primary};
    --primary-foreground: ${theme.colors.primaryForeground};
    --secondary: ${theme.colors.secondary};
    --secondary-foreground: ${theme.colors.secondaryForeground};
    --accent: ${theme.colors.accent};
    --accent-foreground: ${theme.colors.accentForeground};
    --background: ${theme.colors.background};
    --foreground: ${theme.colors.foreground};
    --muted: ${theme.colors.muted};
    --muted-foreground: ${theme.colors.mutedForeground};
    --border: ${theme.colors.border};
    --input: ${theme.colors.input};
    --ring: ${theme.colors.ring};
    --destructive: ${theme.colors.destructive};
    --destructive-foreground: ${theme.colors.destructiveForeground};
    --success: ${theme.colors.success};
    --warning: ${theme.colors.warning};
    --info: ${theme.colors.info};
    --gradient-from: ${theme.colors.gradientFrom};
    --gradient-to: ${theme.colors.gradientTo};
    --btn-background: ${theme.colors.primary};
    --btn-background-hover: ${theme.colors.primary};
    --btn-foreground: ${theme.colors.primaryForeground};
  `;
}
