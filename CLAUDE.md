# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server

**IMPORTANT: NEVER run `npm run dev` or `npm run start` or `npm run build` - the user will always test the application themselves.**

## Architecture Overview

This is a Next.js 14+ application for UCSD AKPsi's rush process, built with the App Router and TypeScript. The application uses Supabase for authentication and database operations.

### Core Technologies
- **Next.js 14+** with App Router
- **TypeScript** with strict configuration
- **Supabase** for auth and database (PostgreSQL)
- **TailwindCSS** for styling
- **React Query** for data fetching and caching
- **Framer Motion** for animations

### Authentication & Authorization
Authentication is handled through Supabase Auth with middleware that runs on all routes. User roles are managed through database flags:
- `is_active`: Current fraternity members
- `is_pic`: Pledge Information Committee members (highest permissions)

Role checks are performed server-side in layout.tsx and propagated to components.

### Database Schema
Key Supabase tables:
- `users`: User profiles with role flags and references to applications
- `applications`: Rush application forms with file uploads
- `interviews`: Interview evaluation forms completed by actives
- `case_studies`: Case study evaluation forms completed by actives
- `interests`: Interest form submissions (pre-rush)
- `comments`: Active member comments on prospects
- `delibs`: Deliberation tracking

### Application Structure

#### App Router Organization
- `/app` - Next.js app directory with route handlers
- `/app/api` - API routes for form submissions and data operations
- `/app/active` - Protected routes for current members
- `/app/dashboard` - Main dashboard for different user types

#### Component Architecture
- `/components` - Reusable UI components
- `/hooks` - Custom React hooks for data fetching and state management
- `/lib` - Shared utilities and type definitions
- `/utils` - Utility functions including Supabase client configurations

#### Key Components
- `Navbar.tsx`: Main navigation with role-based visibility
- `AuthButton.tsx`: Handles authentication state
- Form components ending in `Form.tsx`: Handle specific form submissions
- Components prefixed with `Active`: Restricted to active members

### Data Flow Patterns

#### Server-Side Data Fetching
Most data fetching occurs server-side using Supabase server client in:
- Page components (App Router server components)
- API routes (`/app/api`)
- Utility functions in `/app/supabase`

#### Client-Side State Management
React Query is used for client-side data fetching and caching, particularly in:
- Form submissions
- Real-time data updates
- User interaction tracking

**IMPORTANT: Always use React Query for client-side data fetching**
- Create custom hooks in `/hooks` that use React Query's `useQuery` and `useMutation`
- Use existing client query functions from `/app/supabase/clientQueries.ts`
- Follow the pattern of existing hooks like `useCurrentUser`, `useActiveStatus`, etc.
- Always invalidate relevant queries after mutations using `queryClient.invalidateQueries()`
- Prefer React Query over direct Supabase client calls in components for consistency and caching

### File Upload System
File uploads (resumes, cover letters) are handled through:
- Supabase Storage for file hosting
- Custom Dropzone component for file selection
- API routes for secure upload processing

### Environment Configuration
Requires `.env.local` with Supabase configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Branch Strategy
- `main`: Production branch with interest form only (pre-rush)
- `dev`: Development branch with full application features (during rush)
- Feature branches: Named with issue numbers (e.g., `51-fix-case-study-forms`)

### Rush Season Configuration
The rush year is configured in `/utils/constants.ts` with `RUSH_YEAR` constant.

### Security Considerations
- All protected routes use middleware authentication
- Role-based access control at component and API level  
- File uploads are validated and processed securely
- Database queries include proper authorization checks

### Form Validation
Forms use react-hook-form with TypeScript interfaces defined in `/lib/types.ts` for type safety and validation.

### User Notifications
**IMPORTANT: Use CustomToast for all notifications**
- **Import**: `import customToast from '@/components/CustomToast';`
- **Usage**: `customToast(message, type)` where type is 'success', 'error', 'info', or 'warning'
- **DO NOT use**: `react-toastify` toast directly - always use the CustomToast wrapper
- **Styling**: CustomToast provides consistent dark theme styling with proper fonts
- **Examples**:
  ```typescript
  customToast('Operation successful!', 'success');
  customToast('Something went wrong', 'error');
  customToast('Loading data...', 'info');
  customToast('Please check your input', 'warning');
  ```

### Case Study Forms
The application supports both single and multiple case study form workflows:
- **Single Form Mode**: Traditional one-at-a-time approach
- **Multiple Forms Mode**: Tab-based interface for evaluating multiple prospects
- **Edit Functionality**: Existing submissions can be edited rather than duplicated
- **Auto-population**: Active names are automatically filled from authenticated user
- **Status Tracking**: Visual indicators for form completion and submission states

### Styling Conventions
- TailwindCSS utility classes for styling
- Custom fonts loaded from `/fonts/fonts.ts`
- Responsive design with mobile-first approach
- CSS modules used sparingly for specific components
- Dark theme with blue accent colors for consistency