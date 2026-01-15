# Copilot Instructions for Admin Panel

## Architecture Overview

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Supabase

This is a **role-based admin panel** with a public blog system. Data flows from Supabase auth/database through a feature-based API layer, managed by React Context, and displayed through layout-based route hierarchy.

### Key Components:

- **Auth**: Supabase session management (AuthProvider → AuthContext) with role-based access control
- **Routing**: Protected routes enforce roles at route level via `ProtectedRoute`; layouts provide secondary role checks
- **Blog System**: Editor.js-based rich text editing with categories, drafts, publishing, view tracking, and Supabase Storage images
- **API Layer**: Feature-based structure under `src/features/` with modular API functions (posts, comments, likes, views, categories)
- **Forms**: `react-hook-form` integration with custom `InputField` and `SelectField` components

## Project Structure Conventions

### 1. **API & Data Access** (`src/features/**/api/`)

- Each feature has its own API file (e.g., `posts.api.ts`, `comments.api.ts`)
- Functions query Supabase directly using the singleton client from `src/lib/supabase/client.ts`
- Return raw Supabase responses, error handling is caller's responsibility
- **Pattern**: Named exports, simple async functions accepting query params
  ```typescript
  // Example: getPublishedPosts(page, pageSize, limit?)
  // Returns paginated results with author/category relations
  ```

### 2. **Actions** (`src/features/*/actions/`)

- Business logic functions that call APIs and transform data if needed
- Used by pages/components for major operations (auth, profile updates)
- **File naming**: `{feature}.actions.ts` (e.g., `auth.actions.ts`, `profile.actions.ts`)

### 3. **Components Structure**

- **`src/components/ui/`**: Radix UI primitives (button, input, label, select, avatar, separator) - wrapped with Tailwind styling
- **`src/components/form/`**: Form-specific components (InputField, SelectField) accepting `react-hook-form` integration
- **`src/components/{role}/`**: Role-specific headers (AdminHeader, CustomerHeader, LandingHeader)
- **`src/components/admin/editor/`**: EditorComponent.tsx for Editor.js rich text editing

### 4. **Pages & Layouts**

- **Pages** organized by role/feature: `src/pages/{role}/{feature}/`
- **Layouts** (Landing, Auth, Admin, Customer) wrap nested routes with persistent UI (headers, sidebars, footers)
- Layouts act as route containers: `<Routes><Route element={<LayoutComponent />}><Route path="..." element={<Page />} /></Route></Routes>`

## Critical Patterns & Conventions

### Authentication Flow

1. **AuthProvider** (src/context/AuthProvider.tsx) runs `supabase.auth.getSession()` on mount
2. Listens for `onAuthStateChange` and updates AuthContext with `User` object
3. **useAuth()** hook provides `{ user, loading, signIn, signUp, signOut }` - user auth state only, no role info
4. **useProfile()** hook auto-fetches `profiles` table record on `user` change via `supabase.from('profiles').select('*').eq('user_id', user.id)`
5. Protected routes retrieve role from `profile.role` (profiles table, not auth metadata) via useProfile hook

### Role Storage & Synchronization

**Canonical Source of Truth: `profiles.role`** (database table)

- **Primary storage**: `profiles.role` field (AppRole: superAdmin | admin | employee | customer)
- **Secondary storage** (deprecated): `auth.users.user_metadata.role` - stored during signup in `signUpAction` but NOT used for authorization
- **Synchronization**: One-way at signup only; role changes in `profiles` table do NOT sync back to `auth.users.user_metadata`
  - When: `signUpAction()` writes role to `auth.users.user_metadata.data.role`
  - Mechanism: Supabase `signUp` options.data parameter (metadata only, not enforced)
  - Note: Role is NOT mirrored on profile updates; edit `profiles.role` directly for role changes

**Authorization Logic (ProtectedRoute)**

```typescript
// Property path used: profile?.role (from profiles table)
if (allowedRoles?.length && profile?.role && !allowedRoles.includes(profile.role)) {
  return <Navigate to="/unauthorized" replace />;
}
```

**useProfile() Return Object**

- Fetches `profiles` record when `user` changes via side effect
- Caches result in component state (no global cache)
- Returns: `{ profile, loading, role, permissions, refetch }`
  - `profile`: Full UserProfile object from database
  - `role`: AppRole with "customer" default
  - `permissions`: Pre-computed boolean flags (isAdmin, isSuperAdmin, canCreateBlog, canDeleteBlog, canComment, canLike, etc.)
  - `refetch`: Manual refresh function for profile updates
- **Permissions object** is useful for conditional UI rendering without checking role directly:
  ```typescript
  const { permissions } = useProfile();
  if (permissions.canCreateBlog) {
    // Show "Create Post" button
  }
  ```

### Role-Based Access

- **Authorization check**: ProtectedRoute compares `profile?.role` against route's `allowedRoles` prop; layouts provide secondary role checks
- **Timing**: ProtectedRoute waits for BOTH `authLoading` AND `profileLoading` to complete before allowing/denying access
- **Layout-level checks**: AdminLayout and CustomerLayout redirect to /admin or / based on role (e.g., admin redirected from customer area)
- **Default role**: If profile.role is missing, defaults to "customer" via `const role: AppRole = profile?.role ?? "customer"`
- **Routes return `<Unauthorized />`** if `profile.role` is not in `allowedRoles`
- **No refetch on role change required**: Role persists across page navigations via useProfile hook caching

### Two-Level Authorization Pattern

**Level 1: ProtectedRoute (Route-level)**

- Wraps entire role-based sections (admin, customer, etc.)
- Checks `profile?.role` against route's `allowedRoles` prop
- Waits for BOTH `authLoading` AND `profileLoading` before checking
- Returns `<Navigate to="/unauthorized" />` if role doesn't match

**Level 2: Layout-level (Secondary redirect)**

- AdminLayout: Checks if user is admin/superAdmin; redirects non-admins to customer area
- CustomerLayout: Checks if user is customer/employee; redirects admins to admin panel
- Prevents layout confusion if role changes during session (rare)

### Verification Checklist for Role Authority

- [ ] Authorization logic reads `profile.role` from `useProfile()` hook (not auth metadata)
- [ ] `useProfile()` fetches from `profiles` table via `supabase.from('profiles').select('*').eq('user_id', user.id)`
- [ ] Role changes are made by UPDATE on `profiles` table directly
- [ ] `auth.users.user_metadata.role` is NOT used for access control (only set at signup, not maintained)
- [ ] ProtectedRoute waits for both `authLoading` AND `profileLoading` to complete before checking `allowedRoles`
- [ ] Test role changes: UPDATE profiles SET role = 'admin' WHERE id = ...; verify ProtectedRoute respects new role on next navigation

### Blog Data Model (Supabase)

- **Posts table**: title, slug, content (Editor.js JSON), excerpt, meta fields, is_published, published_at, view_count
- **Categories**: id, name, slug
- **Post Likes**: Tracks customer engagement; RLS policies restrict likes to customers only
- **Posts have relations**: author (via profiles), category, comments, likes, views
- **Content is richly related**: getPublishedPosts() joins author + category by default

### Post Likes Feature - Role-Based Implementation

**Database Schema:**

**RLS Policies (Row Level Security):**

- **SELECT**: Anyone can view post likes (anonymous + all roles)
- **INSERT**: Only customers can like posts via `get_user_role(auth.uid()) = 'customer'`
- **DELETE**: Only customers can unlike their own likes

**Frontend Handling - Handling Non-Customers:**

When a non-customer (admin, employee) tries to like a post:

1. **Frontend Check First** (`permissions.canLike`):
   - Button is disabled and grayed out for non-customers
   - Shows tooltip: "Only customers can like posts"
   - Prevents unnecessary API calls

2. **If Somehow Bypassed - Backend RLS Enforces**:
   - Supabase RLS policy rejects the INSERT/DELETE
   - Error message: "new row violates row-level security policy"
   - Frontend catches error and shows: "Only customers can like blog posts"

3. **Not Authenticated (No User)** - Redirect to Login:
   - Toast shows: "Sign in to like posts"
   - Navigate to `/login` page

**Implementation in BlogDetails.tsx:**

```typescript
// 1. Check auth status → redirect to login if needed
if (!user) {
  toast.error("Sign in to like posts");
  navigate("/login");
  return;
}

// 2. Check role via permissions → disable UI if not customer
if (!permissions.canLike) {
  toast.error("Cannot like posts", {
    description: "Only customers can like blog posts",
  });
  return;
}

// 3. Optimistic UI: update state immediately, revert on error
const previousLiked = isLiked;
const previousLikeCount = post.like_count;

setIsLiked(true); // Optimistic
setPost({ ...post, like_count: previousLikeCount + 1 });

try {
  const { error } = await likePost(post.id);
  if (error) throw error;
} catch (err) {
  // Revert on failure
  setIsLiked(previousLiked);
  setPost({ ...post, like_count: previousLikeCount });
  toast.error("Failed to like post");
}
```

**API Functions (likes.api.ts):**

- `likePost(postId)`: Inserts like (auth enforces via RLS policy)
- `unlikePost(postId)`: Deletes like (auth enforces via RLS policy)
- `hasLikedPost(postId, userId)`: Checks if user already liked post (used on load)

### Form Patterns

- Use `react-hook-form` with `InputField` / `SelectField` components
- `InputField` wrapper handles label, error display, validation status
- Form validation errors are displayed inline; success via `sonner.toast()`

### Styling

- **Tailwind CSS v4** (integrated via @tailwindcss/vite)
- Use Radix UI components for accessible primitives
- Theme support via `next-themes` (ThemeContext provides light/dark mode)
- Icon library: **lucide-react** for SVG icons

### Editor.js Integration

- Rich text editor for blog creation: [src/components/admin/editor/EditorComponent.tsx](src/components/admin/editor/EditorComponent.tsx)
- Outputs JSON blocks (header, paragraph, list, image, code, table, quote, etc.)
- Rendering: [EditorRenderer.tsx](src/components/blog/EditorRenderer.tsx) converts JSON back to HTML, sanitized with DOMPurify
- **Image Upload**: Uses `uploadPostImage()` from posts.api.ts
  - Uploads to Supabase Storage bucket `blog-images`
  - File path: `posts/{userId}-{timestamp}.{ext}`
  - Returns full public URL for Editor.js image block
  - On post delete/update: Cleanup removes old images via `deleteImageFromStorage()` and `extractFilePathFromUrl()`
- Featured image: Separate image upload for post thumbnails, also stored in blog-images bucket

## Build & Development

```bash
npm install           # Install dependencies
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint check
npm run preview      # Preview prod build
```

**TypeScript Compilation:** `tsc -b` checks all tsconfig files before Vite build (strict mode enforced).

## Key Files Reference

| File                                                                                               | Purpose                                          |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [src/routes/AppRoutes.tsx](src/routes/AppRoutes.tsx)                                               | Route definitions with layout nesting            |
| [src/routes/ProtectedRoute.tsx](src/routes/ProtectedRoute.tsx)                                     | Role-based access control wrapper                |
| [src/context/AuthProvider.tsx](src/context/AuthProvider.tsx)                                       | Session persistence & auth state                 |
| [src/features/blog/api/posts.api.ts](src/features/blog/api/posts.api.ts)                           | Blog post CRUD & queries (pagination, filtering) |
| [src/components/admin/editor/EditorComponent.tsx](src/components/admin/editor/EditorComponent.tsx) | Rich text editor interface                       |
| [src/lib/supabase/client.ts](src/lib/supabase/client.ts)                                           | Supabase singleton client                        |
| [src/types/blog.types.ts](src/types/blog.types.ts)                                                 | Post, Category, Comment TypeScript interfaces    |
| [src/types/models.ts](src/types/models.ts)                                                         | User profiles, roles, auth form types            |

## Common Development Tasks

### Adding a New API Function

1. Create function in `src/features/{feature}/api/{feature}.api.ts`
2. Export from `src/features/{feature}/api/index.ts`
3. Call from pages/hooks using async/await
4. Handle errors with try-catch; display via `sonner.toast()`

### Adding a Protected Admin Page

1. Create component in `src/pages/admin/{feature}/ComponentName.tsx`
2. Import into [src/routes/AppRoutes.tsx](src/routes/AppRoutes.tsx)
3. Add route inside `<ProtectedRoute allowedRoles={["admin"]}>` wrapper
4. Wrap page in appropriate layout (AdminLayout, CustomerLayout)

### Form Handling

1. Use `react-hook-form`'s `useForm()` hook
2. Use `InputField`/`SelectField` components for form fields
3. Call actions/APIs on `onSubmit`
4. Display success/error toasts via `sonner.toast()`

### Editor.js for New Content Type

1. Extend EditorComponent.tsx to include new block type tools
2. Update Editor.js tools config with new tool plugins
3. Renderer should handle new block type in EditorRenderer.tsx
4. Save editor output JSON directly to posts.content

## Supabase Schema Reference

### Core Tables & Relations

#### `auth.users` (Supabase Auth)

- **user_metadata**: Contains `full_name`, `country`, `role` (AppRole)
- **email_confirmed_at**: Null until user confirms email
- **created_at**: Account creation timestamp

#### `profiles` (Custom user profile)

```sql
id UUID PRIMARY KEY,
user_id UUID UNIQUE REFERENCES auth.users(id),
role AppRole (superAdmin|admin|employee|customer),
full_name TEXT,
avatar_url TEXT (Supabase Storage path),
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
user_id UUID (author, REFERENCES profiles),
category_id UUID REFERENCES categories,
title TEXT NOT NULL,
slug TEXT UNIQUE,
excerpt TEXT,
content JSONB (Editor.js blocks),
meta_title TEXT,
meta_description TEXT,
meta_keywords TEXT,
featured_image_url TEXT (Supabase Storage),
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

#### `post_comments` (Join table)

```sql
id UUID PRIMARY KEY,
post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
user_id UUID REFERENCES profiles(id),
content TEXT NOT NULL,
created_at TIMESTAMP,
updated_at TIMESTAMP
```

#### `post_likes` (Join table)

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

### Query Patterns

**Fetch post with author + category:**

```typescript
supabase
  .from("posts")
  .select(`*, author:profiles!inner(...), category:categories(...)`)
  .eq("id", postId);
```

**Paginated query with count:**

```typescript
supabase.from("posts").select(`...`, { count: "exact" }).range(start, end); // (page-1)*size to page*size-1
```

---

## Debugging & Testing Workflows

### Local Development Setup

1. **Start dev server**: `npm run dev` (watches src/ for changes)
2. **Check TypeScript errors**: `npm run build` (runs `tsc -b` before Vite build)
3. **Lint issues**: `npm run lint` (ESLint on all files)

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
- Test with different role accounts (admin vs customer)

**Editor.js images not uploading**

- Confirm Supabase Storage bucket name matches in `EditorComponent.tsx`
- Check Storage bucket public policies allow authenticated uploads
- Verify image paths are full URLs (not relative paths) before saving to DB

**Pagination off-by-one errors**

- Remember: range is INCLUSIVE on both ends (`from` to `to` inclusive)
- Calculate correctly: `from = (page-1)*size`, `to = from+size-1`
- Test with small page sizes (3-5 items) to verify boundaries

**Slow blog list loads**

- Profile query with `.select(..., { count: 'exact' })` - only use on initial load
- Consider using `.limit()` without count on pagination subsequent requests
- Check if image URLs are CDN-optimized (lazy load thumbnails)

### Manual Testing Checklist

- [ ] Create post as admin → verify `is_published=false` initially
- [ ] Publish post → verify `published_at` timestamp is set
- [ ] View published post on public blog list → verify view_count increments
- [ ] Add comment → verify appears immediately for all users
- [ ] Delete post → verify images cleaned up from Storage
- [ ] Switch theme (light/dark) → verify persists on reload
- [ ] Sign out → verify AuthContext clears and redirects to login
- [ ] Access admin route as customer → verify Unauthorized page shown

---

## Performance Optimization Guidelines

### Query Optimization

**1. Use `.select()` precisely**

```typescript
// ❌ SLOW: Fetch all columns when only needing title
.select('*')

// ✅ FAST: Fetch only required columns
.select('id, title, slug, published_at')
```

**2. Avoid N+1 queries with joins**

```typescript
// ❌ N+1: Fetch posts, then loop to fetch author profiles
posts.forEach(post => {
  const author = await getProfile(post.user_id);
});

// ✅ GOOD: Join in single query
.select('*, author:profiles!inner(...)')
```

**3. Paginate large result sets**

```typescript
// ❌ BAD: Fetch 10,000 posts at once
.select('*')

// ✅ GOOD: Fetch 20 per request
.range(0, 19).select('*', { count: 'exact' })
```

**4. Filter before counting**

```typescript
// ❌ BAD: Fetch all posts then filter in JS
const all = await supabase.from('posts').select('*', { count: 'exact' });
const published = all.filter(p => p.is_published);

// ✅ GOOD: Filter at database
.select('*', { count: 'exact' }).eq('is_published', true)
```

### Frontend Performance

**1. Image Optimization**

- Use `<img loading="lazy" />` for blog thumbnails below fold
- Store featured image at Supabase Storage with public URL
- Consider responsive image sizes for mobile vs desktop

**2. Component Memoization**

```typescript
// Memoize heavy components that don't update frequently
export const PostCard = React.memo(({ post }) => {
  return <div>{post.title}</div>;
});
```

**3. Avoid re-renders of Editor.js**

- Initialize EditorComponent once; don't remount on state changes
- Use `useCallback` for editor event handlers
- Store editor instance in ref to prevent recreation

**4. Blog List Performance**

- Use virtual scrolling (windowing) for 100+ posts: consider library like `react-window`
- Lazy load category filters instead of loading all categories upfront
- Debounce search input before querying

### Bundle Size

**Current Dependencies Optimization**

- **Editor.js plugins**: Only import plugins you use (header, paragraph, image, list)
- **Radix UI**: Tree-shakeable; unused components don't increase bundle
- **Tailwind CSS v4**: @tailwindcss/vite plugin handles tree-shaking automatically

**Monitor Build Size:**

```bash
npm run build # Check output file size in terminal
# Look for "dist/index.*.js" size; keep below 200KB gzipped for good UX
```

### Caching Strategies

**1. Published posts (read-heavy)**

- Cache on frontend with React Query or SWR: `staleTime: 5 * 60 * 1000` (5 mins)
- Invalidate on post creation/update

**2. User profile (changes infrequently)**

- Cache in AuthContext; only refetch on explicit profile update
- Don't refetch on every page navigation

**3. Categories (static)**

- Fetch once on app mount; store in context or global state
- Invalidate only on category CRUD operations

### Database Indexes

Key indexes for common queries (already should exist):

```sql
CREATE INDEX idx_posts_published ON posts(is_published, published_at DESC);
CREATE INDEX idx_posts_category ON posts(category_id, is_published);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_comments_post_id ON post_comments(post_id);
```

---

## Important Notes

- **Environment Variables**: Supabase URL and anon key via `VITE_SUPABASE_*` (Vite prefix required)
- **Path Alias**: `@/` resolves to `src/` (configured in vite.config.ts)
- **No CSS Modules**: All styling is Tailwind utility classes + component-level scoped styles via clsx/cn utilities
- **DOMPurify Usage**: Always sanitize editor content before rendering to prevent XSS
- **View Tracking**: Posts increment view_count on BlogDetails load via `useTrackView()` hook
- **Image Cleanup**: Deleting a post removes associated images from Supabase Storage (cleanup function in posts.api.ts)
