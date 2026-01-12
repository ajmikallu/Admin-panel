# Admin Panel

A modern admin panel built with React, TypeScript, and Vite.

**Framework:** React + TypeScript + Vite  
**Auth Backend:** Supabase  
**Styling:** Tailwind CSS  
**Routing:** React Router with protected routes

## Quick Start

```sh
npm install
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── form/           # Form-related components
│   └── ui/             # UI primitives (button, input, label, toaster)
├── context/            # React context (AuthContext)
├── features/
│   └── auth/           # Auth actions (signIn, signUp, signOut)
├── hooks/              # Custom hooks (useAuth)
├── Layout/             # Layout components (Landing, Auth, Admin)
├── lib/
│   ├── utils.ts        # Utility functions
│   └── supabase/       # Supabase client configuration
├── pages/              # Page components
│   ├── admin/          # Admin dashboard
│   ├── auth/           # Login, Sign Up
│   └── home/           # Home page
├── routes/             # Route definitions and protected routes
└── types/              # TypeScript type definitions
```

## Key Files & Features

### Authentication

- **Supabase Client:** `src/lib/supabase/client.ts`
- **Auth Actions:** `src/features/auth/actions.ts`
  - `signIn()` - Email/password login
  - `signUp()` - User registration
  - `signOut()` - Session logout
- **Auth Context:** `src/context/AuthContext.tsx` with `AuthProvider`
- **Auth Hook:** `src/hooks/useAuth.tsx` - Access user & loading state

### Routing

- **Main Routes:** `src/routes/AppRoutes.tsx`
- **Protected Routes:** `src/routes/ProtectedRoute.tsx` - Guards admin pages

### Pages

- **Login:** `src/pages/auth/Login.tsx`
- **Sign Up:** `src/pages/auth/SignUp.tsx`
- **Admin Dashboard:** `src/pages/admin/dashboard/Dashboard.tsx`
- **Home:** `src/pages/home/Home.tsx`

### UI Components & Forms

- **Form Input:** `src/components/form/InputField.tsx`
- **UI Primitives:** Button, Input, Label, Toaster
- **Headers & Navigation:** `src/components/Header.tsx`, `src/components/admin/Header.tsx`
- **Sign Out:** `src/components/SignOutButton.tsx`
- **Layout Wrappers:** Landing, Auth, Admin layouts

## Features

✅ Email/password authentication via Supabase  
✅ Session persistence & real-time listener  
✅ Protected admin routes  
✅ Reusable form components with validation  
✅ Tailwind CSS styling with UI primitives  
✅ Toast notifications (Sonner)  
✅ TypeScript for type safety

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (tsc -b && vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Dependencies

### Runtime

- `react`, `react-dom` - UI library
- `react-router-dom` - Routing
- `react-hook-form` - Form handling
- `@supabase/supabase-js` - Backend as a service
- `tailwindcss` - Utility-first CSS
- `sonner` - Toast notifications
- `lucide-react` - Icon library

### Development

- `typescript` - Type checking
- `vite` - Build tool
- `eslint`, `prettier` - Code quality

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started with Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up `.env` with Supabase credentials
4. Start dev server: `npm run dev`
5. Open browser to `http://localhost:5173`
   import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
