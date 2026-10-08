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
    email: string;
    instagramHandle: string;
    instagramUrl: string;
    applicationOpen: 'open' | 'closed' | 'coming_soon';
    applicationDeadline: string;
  };
}

// Current Theme - Update this for future rushes
export const currentTheme: Theme = {
  name: "Fall 2026 Rush",
  // "Into Full Bloom" palette: navy base (#161e2d/#1e2637/#24283a/#262d3e)
  // with frost-blue text (#f2f6fe/#d7e5f9/#c0d9fd) and periwinkle accents (#bdc3e6/#9aa5c9).
  colors: {
    primary: "215 94% 87%",          // #c0d9fd
    primaryForeground: "219 34% 13%", // #161e2d
    secondary: "223 24% 20%",        // #262d3e
    secondaryForeground: "220 86% 97%", // #f2f6fe
    accent: "226 26% 25%",           // #2f3750
    accentForeground: "220 86% 97%",
    background: "219 34% 13%",       // #161e2d
    foreground: "220 86% 97%",       // #f2f6fe
    muted: "229 23% 18%",            // #24283a
    mutedForeground: "226 30% 70%",  // #9aa5c9
    border: "226 26% 25%",
    input: "229 23% 18%",
    ring: "215 94% 87%",
    destructive: "355 72% 68%",
    destructiveForeground: "219 34% 13%",
    success: "158 44% 62%",
    warning: "38 80% 70%",
    info: "215 94% 87%",
    gradientFrom: "221 29% 17%",     // #1e2637
    gradientTo: "215 94% 87%",       // #c0d9fd
  },
  branding: {
    rushYear: "Fall '26",
    organization: "UCSD Alpha Kappa Psi",
    website: "https://www.akpsiatucsd.com/",
    rushChairs: "Jacqueline He at (626) 454-0312 or Belle Bao at (626) 390-3697",
    email: "akpfall2026@gmail.com",
    instagramHandle: "@ucsdakpsi",
    instagramUrl: "https://www.instagram.com/ucsdakpsi/",
    applicationOpen: 'closed',
    applicationDeadline: 'Wednesday 10/7 at 2:00 PM',
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
    website: "https://www.akpsiatucsd.com/",
    rushChairs: "contact [Rush Chair Names] @ [Phone Numbers]",
    email: "rush@example.com",
    instagramHandle: "@ucsdakpsi",
    instagramUrl: "https://www.instagram.com/ucsdakpsi/",
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
    website: "https://www.akpsiatucsd.com/",
    rushChairs: "contact [Rush Chair Names] @ [Phone Numbers]",
    email: "rush@example.com",
    instagramHandle: "@ucsdakpsi",
    instagramUrl: "https://www.instagram.com/ucsdakpsi/",
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
    --btn-secondary: ${theme.colors.secondary};
    --btn-secondary-hover: ${theme.colors.accent};
    --btn-secondary-foreground: ${theme.colors.secondaryForeground};
    --card: ${theme.colors.secondary};
    --card-foreground: ${theme.colors.secondaryForeground};
    --popover: ${theme.colors.muted};
    --popover-foreground: ${theme.colors.foreground};
  `;
}
