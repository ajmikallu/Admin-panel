# Admin Panel

A modern, role-based admin panel with a public blog system built with React 19, TypeScript, Vite, and Supabase. Features comprehensive authentication, role-based access control, rich text editing, and a full-featured blog management system.

## Technology Stack

### Core Framework

- **React** 19.2.0 - UI library
- **TypeScript** ~5.9.3 - Type safety
- **Vite** 7.2.4 - Build tool and dev server
- **React Router DOM** 7.11.0 - Client-side routing

### Backend & Database

- **Supabase** 2.89.0 - Backend as a service (Auth, Database, Storage)
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication with session management
  - Storage for blog images

### Styling & UI

- **Tailwind CSS** 4.1.18 - Utility-first CSS framework
- **@tailwindcss/vite** 4.1.18 - Vite integration
- **Radix UI** - Accessible UI primitives (Avatar, Label, Select, Separator)
- **next-themes** 0.4.6 - Theme management (light/dark mode)
- **lucide-react** 0.562.0 - Icon library

### Rich Text Editing

- **Editor.js** 2.31.0 - Block-style editor
- **Editor.js Plugins**: Header, Paragraph, List, Image, Code, Table, Quote, Link, Embed, Marker, Warning, Delimiter, Inline Code

### Forms & Validation

- **react-hook-form** 7.69.0 - Form state management
- Custom form components with validation

### Utilities

- **DOMPurify** 3.3.1 - HTML sanitization for safe content rendering
- **sonner** 2.0.7 - Toast notifications
- **pino** 10.2.0 - Logging

## Project Architecture

This is a **role-based admin panel** with a public blog system. The architecture follows a feature-based structure with clear separation of concerns:

### Data Flow

```
Supabase (Auth/Database)
  → Feature-based API Layer (src/features/**/api/)
  → React Context (AuthProvider, ThemeContext)
  → Layout-based Route Hierarchy
  → Page Components
```

### Key Architectural Components

1. **Authentication Layer**
   - `AuthProvider` manages Supabase session persistence
   - `useAuth()` hook provides user authentication state
   - `useProfile()` hook fetches role-based profile data
   - Role-based access control via `ProtectedRoute` component

2. **Routing System**
   - Protected routes enforce roles at route level
   - Layouts provide secondary role checks
   - Nested route structure with persistent UI (headers, sidebars, footers)

3. **Blog System**
   - Editor.js-based rich text editing
   - Categories, drafts, publishing workflow
   - View tracking and analytics
   - Supabase Storage for image management

4. **API Layer**
   - Feature-based structure under `src/features/`
   - Modular API functions (posts, comments, likes, views, categories)
   - Direct Supabase queries with RLS enforcement

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Admin-panel
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   > **Note:** Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This command:

1. Runs TypeScript type checking (`tsc -b`)
2. Builds the production bundle with Vite

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components (CategoryModal, EditorComponent)
│   ├── blog/           # Blog-related components (BlogComment, BlogContent, EditorRenderer)
│   ├── customer/       # Customer-specific components
│   ├── form/           # Form components (InputField, SelectField)
│   ├── skeleton/       # Loading skeleton components
│   └── ui/             # UI primitives (button, input, label, select, avatar, separator)
├── context/            # React Context providers
│   ├── AuthProvider.tsx    # Authentication state management
│   ├── ThemeContext.tsx    # Theme (light/dark) management
│   └── LoaderContext.tsx   # Global loading state
├── features/           # Feature-based API layer
│   ├── auth/           # Authentication actions
│   ├── blog/           # Blog API (posts, comments, likes, views)
│   ├── category/       # Category API
│   └── profile/        # Profile actions
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx         # Authentication hook
│   ├── useProfile.ts       # Profile and role management
│   ├── useBlogDetails.ts   # Blog post details
│   ├── useBlogComments.ts  # Blog comments management
│   └── useTrackView.ts     # View tracking
├── Layout/             # Layout components
│   ├── LandingLayout.tsx   # Public landing page layout
│   ├── AuthLayout.tsx      # Authentication pages layout
│   ├── AdminLayout.tsx     # Admin dashboard layout
│   └── CustomerLayout.tsx  # Customer area layout
├── lib/                # Utility libraries
│   ├── supabase/           # Supabase client singleton
│   ├── utils.ts            # Utility functions (cn, clsx)
│   └── logger.ts           # Logging utilities
├── pages/              # Page components
│   ├── admin/          # Admin pages (Dashboard, BlogList, NewBlog, Category)
│   ├── auth/           # Authentication pages (Login, SignUp)
│   ├── blog/           # Public blog pages (BlogList, BlogDetails, LatestBlogs)
│   ├── customer/       # Customer pages (Dashboard, ProfilePage)
│   └── home/           # Home page
├── routes/             # Route definitions
│   ├── AppRoutes.tsx       # Main route configuration
│   └── ProtectedRoute.tsx  # Role-based route protection
└── types/              # TypeScript type definitions
    ├── models.ts           # User profiles, roles, auth types
    ├── blog.types.ts       # Blog-related types
    └── editorjs.d.ts       # Editor.js type definitions
```

## Key Features

### Authentication & Authorization

- ✅ Email/password authentication via Supabase
- ✅ Session persistence with automatic token refresh
- ✅ Role-based access control (superAdmin, admin, employee, customer)
- ✅ Protected routes with role validation
- ✅ Two-level authorization (route-level + layout-level)

### Blog Management

- ✅ Rich text editing with Editor.js (blocks: header, paragraph, list, image, code, table, quote, etc.)
- ✅ Category management
- ✅ Draft and publish workflow
- ✅ Featured images and thumbnails
- ✅ SEO meta fields (title, description, keywords)
- ✅ Post pinning and featuring
- ✅ View tracking and analytics

### User Engagement

- ✅ Blog comments system
- ✅ Post likes (customer-only via RLS)
- ✅ View count tracking
- ✅ Liked posts dashboard for customers

### User Interface

- ✅ Responsive design with Tailwind CSS
- ✅ Light/dark theme support
- ✅ Accessible UI components (Radix UI)
- ✅ Toast notifications (Sonner)
- ✅ Loading states and skeletons
- ✅ Form validation with react-hook-form

### Content Management

- ✅ Image upload to Supabase Storage
- ✅ Automatic image cleanup on post deletion
- ✅ Content sanitization with DOMPurify
- ✅ Pagination for blog lists
- ✅ Search and filtering capabilities

## Documentation

### API Documentation

Comprehensive API documentation is available in [`docs/API.md`](docs/API.md). The documentation includes:

- Complete endpoint reference for all API functions
- Authentication and authorization details
- Request/response examples
- Error handling guidelines
- Data models and type definitions
- Best practices for client-side usage

**Quick Links:**

- [API Documentation](docs/API.md) - Complete API reference
- [Database Schema](#database-schema) - Database structure (below)
- [Architecture Overview](#project-architecture) - System architecture

## Development Workflow

### Code Organization

1. **API Functions** (`src/features/**/api/`)
   - Each feature has its own API file
   - Functions query Supabase directly
   - Return raw Supabase responses
   - Error handling is caller's responsibility

2. **Actions** (`src/features/**/actions/`)
   - Business logic functions
   - Call APIs and transform data
   - Used by pages/components for major operations

3. **Components**
   - `src/components/ui/` - Radix UI primitives with Tailwind styling
   - `src/components/form/` - Form components with react-hook-form integration
   - `src/components/{role}/` - Role-specific components
   - `src/components/admin/editor/` - Editor.js integration

4. **Pages & Layouts**
   - Pages organized by role/feature: `src/pages/{role}/{feature}/`
   - Layouts wrap nested routes with persistent UI

### Adding a New API Function

1. Create function in `src/features/{feature}/api/{feature}.api.ts`
2. Export from `src/features/{feature}/api/index.ts`
3. Call from pages/hooks using async/await
4. Handle errors with try-catch; display via `sonner.toast()`

### Adding a Protected Admin Page

1. Create component in `src/pages/admin/{feature}/ComponentName.tsx`
2. Import into `src/routes/AppRoutes.tsx`
3. Add route inside `<ProtectedRoute allowedRoles={["admin"]}>` wrapper
4. Wrap page in appropriate layout (AdminLayout, CustomerLayout)

### Form Handling

1. Use `react-hook-form`'s `useForm()` hook
2. Use `InputField`/`SelectField` components for form fields
3. Call actions/APIs on `onSubmit`
4. Display success/error toasts via `sonner.toast()`

## Coding Standards

### TypeScript

- Strict mode enabled
- Type checking runs before build (`tsc -b`)
- All components and functions are typed
- Path alias `@/` resolves to `src/`

### Component Patterns

- Functional components with hooks
- Custom hooks for reusable logic
- Context providers for global state
- Memoization for performance optimization

### Styling

- Tailwind CSS utility classes
- No CSS modules (all styling via Tailwind)
- Component-level scoped styles via `clsx`/`cn` utilities
- Responsive design with Tailwind breakpoints

### Security

- Content sanitization with DOMPurify before rendering
- Row Level Security (RLS) policies in Supabase
- Role-based access control at route and component level
- Environment variables for sensitive data

### Error Handling

- Try-catch blocks for async operations
- User-friendly error messages via toast notifications
- Error logging with pino logger
- Graceful fallbacks for failed operations

## Testing

### Manual Testing Checklist

- [ ] Create post as admin → verify `is_published=false` initially
- [ ] Publish post → verify `published_at` timestamp is set
- [ ] View published post on public blog list → verify view_count increments
- [ ] Add comment → verify appears immediately for all users
- [ ] Delete post → verify images cleaned up from Storage
- [ ] Switch theme (light/dark) → verify persists on reload
- [ ] Sign out → verify AuthContext clears and redirects to login
- [ ] Access admin route as customer → verify Unauthorized page shown

### Browser DevTools

- **React DevTools**: Inspect component tree, hooks state, and context values
- **Network tab**: Verify Supabase requests (POST to /rest/v1, RLS policies)
- **Storage tab**: Check browser localStorage for auth tokens (managed by Supabase)

### Common Issues & Solutions

**Auth state not persisting after refresh**

- Check `AuthProvider.tsx` is wrapping entire app
- Verify `supabase.auth.getSession()` is called on mount
- Confirm `onAuthStateChange` listener is active

**Protected routes returning Unauthorized**

- Verify `profile.role` (from `useProfile()` hook) matches route's `allowedRoles`
- Check that ProtectedRoute is properly comparing `profile?.role` with `allowedRoles` array
- Confirm user profile record exists in `profiles` table with correct role

**Editor.js images not uploading**

- Confirm Supabase Storage bucket name matches in `EditorComponent.tsx`
- Check Storage bucket public policies allow authenticated uploads
- Verify image paths are full URLs (not relative paths) before saving to DB

## Database Schema

### Core Tables

#### `profiles` (User profiles)

```sql
id UUID PRIMARY KEY,
user_id UUID UNIQUE REFERENCES auth.users(id),
role AppRole (superAdmin|admin|employee|customer),
full_name TEXT,
avatar_url TEXT,
phone TEXT,
age INT,
country TEXT,
theme light|dark,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

#### `posts` (Blog content)

```sql
id UUID PRIMARY KEY,
user_id UUID REFERENCES profiles,
category_id UUID REFERENCES categories,
title TEXT NOT NULL,
slug TEXT UNIQUE,
excerpt TEXT,
content JSONB (Editor.js blocks),
meta_title TEXT,
meta_description TEXT,
meta_keywords TEXT,
featured_image_url TEXT,
is_published BOOLEAN DEFAULT false,
is_pinned BOOLEAN DEFAULT false,
is_featured BOOLEAN DEFAULT false,
view_count INT DEFAULT 0,
published_at TIMESTAMP,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

#### `categories`

```sql
id UUID PRIMARY KEY,
name TEXT UNIQUE NOT NULL,
slug TEXT UNIQUE NOT NULL,
description TEXT,
created_at TIMESTAMP
```

#### `post_comments`

```sql
id UUID PRIMARY KEY,
post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
user_id UUID REFERENCES profiles(id),
content TEXT NOT NULL,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

#### `post_likes`

```sql
post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
user_id UUID REFERENCES profiles(id),
created_at TIMESTAMP,
PRIMARY KEY (post_id, user_id)
```

#### `post_views` (Analytics)

```sql
id UUID PRIMARY KEY,
post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
user_id UUID (nullable - anonymous views too),
view_count INT DEFAULT 1,
created_at TIMESTAMP
```

## Performance Optimization

### Query Optimization

- Use `.select()` precisely (fetch only required columns)
- Avoid N+1 queries with joins
- Paginate large result sets
- Filter at database level, not in JavaScript

### Frontend Performance

- Image lazy loading for blog thumbnails
- Component memoization for heavy components
- Avoid unnecessary re-renders of Editor.js
- Consider virtual scrolling for large lists

### Caching Strategies

- Published posts: Cache with 5-minute stale time
- User profile: Cache in AuthContext, refetch on explicit update
- Categories: Fetch once on app mount, store in context

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the coding standards
4. Test your changes thoroughly
5. Commit with clear messages: `git commit -m "Add: feature description"`
6. Push to your branch: `git push origin feature/your-feature-name`
7. Create a Pull Request

### Code Review Guidelines

- Follow TypeScript strict mode
- Use Tailwind CSS for styling
- Write reusable components
- Add proper error handling
- Include user-friendly error messages
- Test role-based access control changes
- Verify RLS policies for new database operations

## Scripts

- `npm run dev` - Start Vite dev server (localhost:5173)
- `npm run build` - TypeScript check + Vite build
- `npm run lint` - ESLint check
- `npm run preview` - Preview production build

## Important Notes

- **Environment Variables**: Supabase URL and anon key via `VITE_SUPABASE_*` (Vite prefix required)
- **Path Alias**: `@/` resolves to `src/` (configured in vite.config.ts)
- **No CSS Modules**: All styling is Tailwind utility classes
- **DOMPurify Usage**: Always sanitize editor content before rendering to prevent XSS
- **View Tracking**: Posts increment view_count on BlogDetails load via `useTrackView()` hook
- **Image Cleanup**: Deleting a post removes associated images from Supabase Storage
- **Role Storage**: Canonical source of truth is `profiles.role` (database table), not `auth.users.user_metadata.role`

## License

[Add license information here]

---

For more detailed information about the architecture, patterns, and conventions, see [.github/copilot-instructions.md](.github/copilot-instructions.md).
