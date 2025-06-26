# UCSD Alpha Kappa Psi Rush Website Architecture

## Current Site Status (December 2024)
This is a modern, fully redesigned rush website for UCSD Alpha Kappa Psi with a comprehensive theme system and enhanced user experience.

## Key Features & Improvements

### 🎨 Modern Design System
- **Dark theme** with customizable color palettes
- **Glass morphism** effects with backdrop blur
- **Gradient backgrounds** and floating animations
- **Card-based layouts** with elevation shadows
- **Modern typography** with Tailwind CSS utility classes

### 🛠 Theme Configuration System
- **Centralized theme management** in `/utils/theme.ts`
- **Easy theme switching** for future rushes (Fall '25, Spring '26, Fall '26)
- **Color system** with HSL values for consistency
- **Branding configuration** (rush year, organization, contacts)
- **CSS variable generation** for dynamic theming

### ⚡ Enhanced User Experience
- **Modern loading spinner** with multi-layered animations
- **Smart navigation loading** with debounce and single-state management
- **Responsive design** optimized for all devices
- **Enhanced forms** with better validation and styling
- **Toast notifications** with consistent dark theme styling

### 🏗 Component Architecture

#### Core Layout Components
- **Navbar** - Sticky navigation with glass morphism (z-index 50)
- **Footer** - Modern footer with theme-aware links
- **LoadingSpinner** - Advanced spinner with particle effects (z-index 100)
- **NavigationLoader** - Smart page transition loading

#### Page Components
- **Main Page** (`/app/page.tsx`) - Hero section with animated elements
- **Interest Form** (`/app/interest/page.tsx`) - Starfield background with animations
- **Application** (`/app/application/page.tsx`) - Protected form with modern styling
- **Active Portal** (`/app/active/page.tsx`) - Member dashboard

#### Form Components
- **NameForm** - Large application form with auto-save
- **PhotoUpload** - File upload with validation
- **MainPageContent** - Dynamic content based on user status

### 🔧 Technical Stack
- **Next.js 14+** with App Router
- **TypeScript** with strict configuration
- **Tailwind CSS** with custom design system
- **Supabase** for authentication and database
- **React Query** for data fetching and caching
- **Framer Motion** for animations

### 🎯 Key Directories
```
/app                 - Next.js pages and layouts
/components          - Reusable UI components
/utils               - Utilities including theme system
/lib                 - Type definitions and shared code
/fonts               - Custom font configurations
```

### 🔒 Authentication & Permissions
- **Role-based access** (is_active, is_pic flags)
- **Protected routes** with middleware
- **Google OAuth** integration
- **Server-side authentication** checks

### 📱 Responsive Design
- **Mobile-first** approach
- **Breakpoint system** (sm, md, lg, xl)
- **Adaptive navigation** (mobile menu, desktop dropdowns)
- **Touch-friendly** interactions

### 🎨 Color Palette (Current: Fall '25 Dark Theme)
- **Primary**: HSL(220, 70%, 60%) - Bright blue
- **Secondary**: HSL(217, 33%, 17%) - Dark secondary
- **Background**: HSL(222, 84%, 5%) - Very dark background
- **Accent**: HSL(216, 12%, 15%) - Dark accent
- **Text**: HSL(210, 40%, 98%) - Light text

### 🚀 Future Rush Configuration
To update for a new rush:
1. Edit `/utils/theme.ts` - Update `currentTheme` object
2. Change colors, branding, rush year, and contact info
3. Rebuild application (`npm run build`)
4. Deploy updated version

### 📋 Component Status
- ✅ Main page redesigned with modern layout
- ✅ Navigation with glass morphism and mobile menu
- ✅ Loading system with advanced animations
- ✅ Forms with modern styling and validation
- ✅ Theme system for easy customization
- ✅ Dark theme optimized for accessibility
- ✅ Responsive design across all breakpoints

### 🔄 Recent Updates (December 2024)
- Implemented comprehensive theme system
- Redesigned all major pages with modern styling
- Enhanced loading animations and navigation feedback
- Added glass morphism effects throughout
- Improved mobile responsiveness
- Centralized color management for future rushes
- Updated component architecture for better maintainability

This architecture provides a solid foundation for future rushes while maintaining a modern, professional appearance that reflects the quality of Alpha Kappa Psi.