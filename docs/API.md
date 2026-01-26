# API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Posts](#posts-endpoints)
  - [Comments](#comments-endpoints)
  - [Likes](#likes-endpoints)
  - [Views](#views-endpoints)
  - [Categories](#categories-endpoints)
  - [Profile](#profile-endpoints)

---

## Overview

This API provides access to the Admin Panel's blog management system, user profiles, and content management features. The API is built on top of Supabase, providing real-time database access with Row Level Security (RLS) policies.

**API Version:** 1.0.0  
**Base Technology:** Supabase (PostgreSQL + REST API)  
**Authentication:** JWT Bearer Token (Supabase Auth)

---

## Authentication

All authenticated endpoints require a valid Supabase JWT token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

The token is automatically managed by the Supabase client library and is obtained through the authentication endpoints.

### User Roles

The API supports role-based access control with the following roles:

- `guest` - Unauthenticated users (public access only)
- `customer` - Authenticated customers (can comment and like)
- `employee` - Staff members (can create/edit posts)
- `admin` - Administrators (full access)
- `superAdmin` - Super administrators (full access + system management)

---

## Base URL

The API uses Supabase REST endpoints. The base URL is constructed from your Supabase project URL:

```
https://<project-ref>.supabase.co/rest/v1/
```

For client-side usage, the Supabase JavaScript client handles URL construction automatically.

---

## Error Handling

### Standard Error Response

All errors follow a consistent format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Status Code | Description                             |
| ----------- | --------------------------------------- |
| 200         | Success                                 |
| 201         | Created                                 |
| 400         | Bad Request - Invalid input             |
| 401         | Unauthorized - Missing or invalid token |
| 403         | Forbidden - Insufficient permissions    |
| 404         | Not Found - Resource doesn't exist      |
| 409         | Conflict - Resource already exists      |
| 422         | Unprocessable Entity - Validation error |
| 500         | Internal Server Error                   |

### Supabase Error Codes

Common Supabase-specific error codes:

- `PGRST116` - No rows returned (not necessarily an error)
- `23505` - Unique constraint violation
- `23503` - Foreign key constraint violation
- `42501` - Insufficient privileges (RLS policy violation)

---

## Rate Limiting

Rate limiting is handled by Supabase based on your plan:

- Free tier: 500 requests per second
- Pro tier: Higher limits based on plan

---

## Endpoints

### Authentication Endpoints

#### Sign In

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /auth/v1/token?grant_type=password`

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1234567890
  }
}
```

**Errors:**

- `400` - Invalid email or password format
- `401` - Invalid credentials

---

#### Sign Up

Register a new user account.

**Endpoint:** `POST /auth/v1/signup`

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "options": {
    "data": {
      "full_name": "John Doe",
      "country": "AE",
      "role": "customer"
    }
  }
}
```

**Response:** `200 OK`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

**Errors:**

- `400` - Invalid input
- `409` - Email already exists

---

#### Sign Out

Sign out the current user and invalidate the session.

**Endpoint:** `POST /auth/v1/logout`

**Access:** Authenticated

**Response:** `204 No Content`

---

### Posts Endpoints

#### Get Published Posts

Retrieve a paginated list of published blog posts.

**Function:** `getPublishedPosts(page, pageSize, limit?)`

**Access:** Public

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 10) - Items per page
- `limit` (number, optional) - Override pagination, return first N posts

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Blog Post Title",
      "slug": "blog-post-title",
      "excerpt": "Post excerpt...",
      "content": "{}",
      "featured_image_url": "https://...",
      "is_published": true,
      "is_pinned": false,
      "is_featured": false,
      "view_count": 100,
      "published_at": "2024-01-01T00:00:00Z",
      "author": {
        "user_id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      },
      "category": {
        "id": "uuid",
        "name": "Technology",
        "slug": "technology"
      }
    }
  ],
  "count": 50
}
```

---

#### Get All Posts (Admin)

Retrieve all posts including drafts (admin only).

**Function:** `getAllPostsAdmin(page, pageSize)`

**Access:** Admin, SuperAdmin

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 10) - Items per page

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Blog Post Title",
      "slug": "blog-post-title",
      "is_published": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 100
}
```

---

#### Get Post by Slug

Retrieve a single published post by its slug.

**Function:** `getPostBySlug(slug)`

**Access:** Public

**Path Parameters:**

- `slug` (string, required) - Post slug

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "title": "Blog Post Title",
  "slug": "blog-post-title",
  "excerpt": "Post excerpt...",
  "content": "{}",
  "featured_image_url": "https://...",
  "is_published": true,
  "view_count": 100,
  "published_at": "2024-01-01T00:00:00Z",
  "author": {
    "user_id": "uuid",
    "full_name": "John Doe",
    "avatar_url": "https://..."
  },
  "category": {
    "id": "uuid",
    "name": "Technology",
    "slug": "technology"
  }
}
```

**Errors:**

- `404` - Post not found or not published

---

#### Create Post

Create a new blog post (draft or published).

**Function:** `createPost(data)`

**Access:** Employee, Admin, SuperAdmin

**Request Body:**

```json
{
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "excerpt": "Post excerpt...",
  "content": "{}",
  "category_id": "uuid",
  "featured_image_url": "https://...",
  "is_published": false,
  "is_pinned": false,
  "is_featured": false,
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "meta_keywords": ["keyword1", "keyword2"]
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400` - Invalid input
- `409` - Slug already exists
- `403` - Insufficient permissions

---

#### Update Post

Update an existing blog post.

**Function:** `updatePost(postId, data)`

**Access:** Employee, Admin, SuperAdmin (own posts or admin)

**Path Parameters:**

- `postId` (string, required) - Post ID

**Request Body:**

```json
{
  "title": "Updated Title",
  "excerpt": "Updated excerpt...",
  "is_published": true,
  "published_at": "2024-01-01T00:00:00Z"
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "title": "Updated Title",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `404` - Post not found
- `403` - Insufficient permissions

**Note:** If `featured_image_url` is updated, the old image is automatically deleted from storage.

---

#### Delete Post

Delete a blog post and its associated images.

**Function:** `deletePost(postId)`

**Access:** Admin, SuperAdmin

**Path Parameters:**

- `postId` (string, required) - Post ID

**Response:** `204 No Content`

**Errors:**

- `404` - Post not found
- `403` - Insufficient permissions

**Note:** This operation also deletes the post's featured image from Supabase Storage.

---

#### Upload Post Image

Upload an image for use in blog posts.

**Function:** `uploadPostImage(file, userId)`

**Access:** Employee, Admin, SuperAdmin

**Request:**

- `file` (File, required) - Image file
- `userId` (string, required) - User ID

**Response:** `200 OK`

```json
{
  "publicUrl": "https://<project>.supabase.co/storage/v1/object/public/blog-images/posts/user-123-1234567890.jpg"
}
```

**Errors:**

- `400` - Invalid file type or size
- `413` - File too large

**Storage Path:** `blog-images/posts/{userId}-{timestamp}.{ext}`

---

#### Get Related Posts

Get related posts from the same category.

**Function:** `getRelatedPosts(postId, categoryId)`

**Access:** Public

**Parameters:**

- `postId` (string, required) - Current post ID
- `categoryId` (string, required) - Category ID

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Related Post",
      "slug": "related-post",
      "excerpt": "...",
      "featured_image_url": "https://..."
    }
  ]
}
```

**Note:** Returns up to 3 related posts, excluding the current post.

---

#### Get Latest Featured Post

Get the most recent featured post.

**Function:** `getLatestFeaturedPost()`

**Access:** Public

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "title": "Featured Post",
  "slug": "featured-post",
  "is_featured": true,
  "published_at": "2024-01-01T00:00:00Z",
  "author": {
    "user_id": "uuid",
    "full_name": "John Doe",
    "avatar_url": "https://..."
  },
  "category": {
    "id": "uuid",
    "name": "Technology",
    "slug": "technology"
  }
}
```

**Errors:**

- `404` - No featured post found

---

#### Get Latest Pinned Posts

Get the latest 3 pinned posts.

**Function:** `getLatestPinnedPosts()`

**Access:** Public

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Pinned Post",
      "slug": "pinned-post",
      "is_pinned": true,
      "published_at": "2024-01-01T00:00:00Z",
      "author": {
        "user_id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      },
      "category": {
        "id": "uuid",
        "name": "Technology",
        "slug": "technology"
      }
    }
  ]
}
```

---

### Comments Endpoints

#### Get Approved Comments

Retrieve all approved comments for a post.

**Function:** `getApprovedComments(postId)`

**Access:** Public

**Parameters:**

- `postId` (string, required) - Post ID

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "post_id": "uuid",
    "user_id": "uuid",
    "content": "Great post!",
    "status": "approved",
    "created_at": "2024-01-01T00:00:00Z",
    "profile": {
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "role": "customer",
      "country": "AE"
    },
    "posts": {
      "id": "uuid",
      "title": "Blog Post Title"
    }
  }
]
```

---

#### Create Comment

Create a new comment (status: pending, requires moderation).

**Function:** `createComment(postId, content, parentId?)`

**Access:** Customer (authenticated)

**Request Body:**

```json
{
  "post_id": "uuid",
  "content": "This is a great post!",
  "parent_id": "uuid" // Optional, for threaded comments
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid",
  "content": "This is a great post!",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400` - Invalid input
- `401` - Not authenticated
- `403` - Only customers can comment

---

#### Update Comment

Update own comment.

**Function:** `updateComment(commentId, content)`

**Access:** Customer (own comments only)

**Parameters:**

- `commentId` (string, required) - Comment ID
- `content` (string, required) - Updated content

**Request Body:**

```json
{
  "content": "Updated comment text"
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "content": "Updated comment text",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `404` - Comment not found
- `403` - Not your comment

---

#### Delete Comment

Delete own comment.

**Function:** `deleteComment(commentId)`

**Access:** Customer (own comments only)

**Parameters:**

- `commentId` (string, required) - Comment ID

**Response:** `204 No Content`

**Errors:**

- `404` - Comment not found
- `403` - Not your comment

---

#### Moderate Comment

Approve, reject, or mark comment as spam.

**Function:** `moderateComment(commentId, status)`

**Access:** Admin, SuperAdmin

**Parameters:**

- `commentId` (string, required) - Comment ID
- `status` (string, required) - One of: `"approved"`, `"rejected"`, `"spam"`

**Request Body:**

```json
{
  "status": "approved"
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "status": "approved",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400` - Invalid status
- `404` - Comment not found
- `403` - Insufficient permissions

---

#### Get All Comments (Admin)

Get all comments with optional status filter.

**Function:** `getAllCommentsAdmin(status?)`

**Access:** Admin, SuperAdmin

**Query Parameters:**

- `status` (string, optional) - Filter by status: `"pending"`, `"approved"`, `"rejected"`, `"spam"`

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "post_id": "uuid",
      "user_id": "uuid",
      "content": "Comment text",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "posts": {
        "id": "uuid",
        "title": "Blog Post Title"
      },
      "profile": {
        "full_name": "John Doe",
        "avatar_url": "https://...",
        "role": "customer",
        "country": "AE"
      }
    }
  ]
}
```

---

#### Bulk Moderate Comments

Approve, reject, or mark multiple comments at once.

**Function:** `bulkModerateComments(commentIds, status)`

**Access:** Admin, SuperAdmin

**Request Body:**

```json
{
  "comment_ids": ["uuid1", "uuid2", "uuid3"],
  "status": "approved"
}
```

**Response:** `200 OK`

```json
{
  "updated": 3
}
```

**Errors:**

- `400` - Invalid input
- `403` - Insufficient permissions

---

### Likes Endpoints

#### Like Post

Like a post (idempotent - safe to call multiple times).

**Function:** `likePost(postId)`

**Access:** Customer (authenticated)

**Parameters:**

- `postId` (string, required) - Post ID

**Response:** `200 OK`

```json
{
  "data": {
    "post_id": "uuid",
    "user_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "error": null
}
```

**Errors:**

- `401` - Not authenticated
- `404` - Post not found

**Note:** This operation is idempotent. Calling it multiple times will not cause errors.

---

#### Unlike Post

Remove like from a post.

**Function:** `unlikePost(postId)`

**Access:** Customer (authenticated)

**Parameters:**

- `postId` (string, required) - Post ID

**Response:** `200 OK`

```json
{
  "error": null
}
```

**Errors:**

- `401` - Not authenticated
- `404` - Like not found

---

#### Toggle Post Like

Toggle like status (recommended for UI).

**Function:** `togglePostLike(postId, currentlyLiked)`

**Access:** Customer (authenticated)

**Parameters:**

- `postId` (string, required) - Post ID
- `currentlyLiked` (boolean, required) - Current like status

**Response:** `200 OK`

```json
{
  "isLiked": true,
  "error": null
}
```

**Errors:**

- `401` - Not authenticated

---

#### Check If Liked

Check if user has liked a post.

**Function:** `hasLikedPost(postId, userId)`

**Access:** Public (with user context)

**Parameters:**

- `postId` (string, required) - Post ID
- `userId` (string, required) - User ID

**Response:** `200 OK`

```json
true
```

---

#### Get Customer Liked Post IDs

Get all post IDs liked by the current user.

**Function:** `getCustomerLikedPostIds()`

**Access:** Customer (authenticated)

**Response:** `200 OK`

```json
["uuid1", "uuid2", "uuid3"]
```

**Returns:** `Set<string>` of post IDs

---

#### Get Customer Liked Posts

Get paginated list of posts liked by the current user.

**Function:** `getCustomerLikedPosts(limit, offset)`

**Access:** Customer (authenticated)

**Query Parameters:**

- `limit` (number, default: 20) - Number of posts to return
- `offset` (number, default: 0) - Pagination offset

**Response:** `200 OK`

```json
{
  "data": [
    {
      "liked_at": "2024-01-01T00:00:00Z",
      "post": {
        "id": "uuid",
        "title": "Liked Post",
        "slug": "liked-post",
        "excerpt": "...",
        "featured_image_url": "https://...",
        "published_at": "2024-01-01T00:00:00Z",
        "like_count": 10,
        "view_count": 100,
        "reading_time": 5,
        "author": {
          "full_name": "John Doe",
          "avatar_url": "https://..."
        }
      }
    }
  ],
  "hasMore": true,
  "total": 50
}
```

---

#### Bulk Like Posts

Like multiple posts at once (idempotent).

**Function:** `likePosts(postIds)`

**Access:** Customer (authenticated)

**Request Body:**

```json
{
  "post_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `200 OK`

```json
{
  "newLikes": 3,
  "total": 3,
  "data": [...]
}
```

---

#### Bulk Unlike Posts

Unlike multiple posts at once.

**Function:** `unlikePosts(postIds)`

**Access:** Customer (authenticated)

**Request Body:**

```json
{
  "post_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:** `200 OK`

```json
{
  "count": 3
}
```

---

### Views Endpoints

#### Track Post View

Track a post view (fire and forget).

**Function:** `trackPostView(postId, userId?)`

**Access:** Public

**Parameters:**

- `postId` (string, required) - Post ID
- `userId` (string, optional) - User ID (if authenticated)

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid" | null,
  "view_count": 1,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Note:** This is a fire-and-forget operation. Errors are typically not critical and can be ignored.

---

### Categories Endpoints

#### Get Categories

Retrieve all categories, optionally filtered by parent.

**Function:** `getCategories(parentId?)`

**Access:** Public

**Query Parameters:**

- `parentId` (string, optional) - Filter by parent category ID

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Technology",
      "slug": "technology",
      "description": "Tech-related posts",
      "parent_id": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### Get Category by Slug

Retrieve a single category by its slug.

**Function:** `getCategoryBySlug(slug)`

**Access:** Public

**Path Parameters:**

- `slug` (string, required) - Category slug

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "name": "Technology",
  "slug": "technology",
  "description": "Tech-related posts",
  "parent_id": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `404` - Category not found

---

#### Create Category

Create a new category.

**Function:** `createCategory(data)`

**Access:** Employee, Admin, SuperAdmin

**Request Body:**

```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "parent_id": "uuid" // Optional
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "parent_id": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400` - Invalid input
- `409` - Slug already exists
- `403` - Insufficient permissions

---

#### Update Category

Update an existing category.

**Function:** `updateCategory(categoryId, data)`

**Access:** Employee, Admin, SuperAdmin

**Path Parameters:**

- `categoryId` (string, required) - Category ID

**Request Body:**

```json
{
  "name": "Updated Category",
  "description": "Updated description"
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "name": "Updated Category",
  "slug": "category-slug",
  "description": "Updated description",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `404` - Category not found
- `403` - Insufficient permissions

---

#### Delete Category

Delete a category.

**Function:** `deleteCategory(categoryId)`

**Access:** Admin, SuperAdmin

**Path Parameters:**

- `categoryId` (string, required) - Category ID

**Response:** `204 No Content`

**Errors:**

- `404` - Category not found
- `403` - Insufficient permissions
- `409` - Category has associated posts

---

### Profile Endpoints

#### Get Profile

Retrieve the current user's profile.

**Function:** `getProfile(userId)`

**Access:** Authenticated (own profile)

**Parameters:**

- `userId` (string, required) - User ID

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "role": "customer",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "phone": "+1234567890",
  "age": 30,
  "country": "AE",
  "theme": "light",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `404` - Profile not found
- `403` - Access denied

---

#### Create Profile

Create a user profile (typically auto-created on signup).

**Function:** `createProfile(user, data)`

**Access:** Authenticated

**Request Body:**

```json
{
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "phone": "+1234567890",
  "age": 30,
  "country": "AE",
  "theme": "light"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "role": "customer",
  "full_name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `400` - Invalid input
- `409` - Profile already exists

---

#### Update Profile

Update the current user's profile.

**Function:** `updateProfile(profileId, updates)`

**Access:** Authenticated (own profile)

**Path Parameters:**

- `profileId` (string, required) - Profile ID

**Request Body:**

```json
{
  "full_name": "Jane Doe",
  "phone": "+9876543210",
  "age": 25,
  "country": "US"
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "full_name": "Jane Doe",
  "phone": "+9876543210",
  "age": 25,
  "country": "US",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**

- `404` - Profile not found
- `403` - Access denied

---

#### Delete Profile

Delete a user profile (rarely used).

**Function:** `deleteProfile(profileId)`

**Access:** Authenticated (own profile) or Admin

**Path Parameters:**

- `profileId` (string, required) - Profile ID

**Response:** `204 No Content`

**Errors:**

- `404` - Profile not found
- `403` - Access denied

---

## Data Models

### Post

```typescript
interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string; // Editor.js JSON or HTML
  featured_image_url: string | null;
  featured_image_alt: string | null;
  author_id: string;
  category_id: string | null;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  reading_time: number | null;
  is_featured: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}
```

### Comment

```typescript
interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  status: "pending" | "approved" | "rejected" | "spam";
  like_count: number;
  created_at: string;
  updated_at: string;
}
```

### Category

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}
```

### UserProfile

```typescript
interface UserProfile {
  id: string;
  user_id: string;
  role: "superAdmin" | "admin" | "employee" | "customer";
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  age: number | null;
  country: string | null;
  theme: "light" | "dark";
  created_at: string;
  updated_at: string;
}
```

---

## Best Practices

### Client-Side Usage

1. **Always use the Supabase client singleton:**

   ```typescript
   import { supabase } from "@/lib/supabase/client";
   ```

2. **Handle errors gracefully:**

   ```typescript
   try {
     const { data, error } = await getPublishedPosts(1, 10);
     if (error) throw error;
     // Use data
   } catch (error) {
     toast.error("Failed to load posts");
   }
   ```

3. **Check authentication before protected operations:**
   ```typescript
   const {
     data: { user },
   } = await supabase.auth.getUser();
   if (!user) {
     throw new Error("Not authenticated");
   }
   ```

### Pagination

Always use pagination for list endpoints to avoid performance issues:

```typescript
const { data, count } = await getPublishedPosts(page, pageSize);
const totalPages = Math.ceil((count || 0) / pageSize);
```

### Image Uploads

1. Validate file types and sizes before upload
2. Use the provided `uploadPostImage` function
3. Store the returned `publicUrl` in the database
4. Clean up old images when updating/deleting posts

### Row Level Security (RLS)

All database operations are protected by Supabase RLS policies:

- Public endpoints: Anyone can read
- Customer endpoints: Only authenticated customers
- Admin endpoints: Only admin/superAdmin roles
- Owner checks: Users can only modify their own resources

---

## Changelog

### Version 1.0.0 (2024-01-01)

- Initial API documentation
- All endpoints documented
- Authentication and authorization flows
- Error handling guidelines

---

## Support

For issues, questions, or contributions, please refer to the main [README.md](../README.md) file.

---

**Last Updated:** 2024-01-01
