# Complete Blog System SQL Schema Explanation

## 🔧 Extension Setup

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**What it does:** Enables UUID generation in PostgreSQL. UUIDs are unique identifiers (like `550e8400-e29b-41d4-a716-446655440000`) that are better than auto-incrementing numbers for distributed systems.

---

## 📊 TABLE STRUCTURES

### 1. Categories Table

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Organize blog posts into categories (like "Technology", "Travel", "Food")

**Column Breakdown:**

- `id`: Unique identifier for each category
- `name`: Display name (e.g., "Technology")
- `slug`: URL-friendly version (e.g., "technology")
- `description`: Optional description of the category
- `parent_id`: Allows nested categories (e.g., "Web Development" under "Technology")
  - `ON DELETE SET NULL`: If parent is deleted, child becomes top-level
- `created_at`: When category was created
- `updated_at`: Last modification time

**Example Data:**
| id | name | slug | parent_id |
|----|------|------|-----------|
| uuid-1 | Technology | technology | NULL |
| uuid-2 | Web Dev | web-dev | uuid-1 |

---

### 2. Tags Table

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Flexible labeling system for posts (e.g., "javascript", "tutorial", "beginner")

**Why Tags vs Categories?**

- Categories: Hierarchical, each post has ONE category
- Tags: Flat structure, posts can have MULTIPLE tags

**Example Data:**
| id | name | slug |
|----|------|------|
| uuid-1 | JavaScript | javascript |
| uuid-2 | Tutorial | tutorial |

---

### 3. Posts Table (Main Blog Table)

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,

  -- Media
  featured_image_url TEXT,
  featured_image_alt VARCHAR(255),

  -- Author & Category
  author_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Publishing Status
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,

  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  meta_keywords TEXT[],

  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- Reading Time
  reading_time INTEGER,

  -- Featured & Pinned
  is_featured BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** The main blog post table containing all article data

**Column Breakdown:**

**Basic Info:**

- `title`: Post headline (max 255 chars)
- `slug`: URL-friendly version (e.g., "how-to-learn-react")
- `excerpt`: Short summary for previews
- `content`: Full article content (HTML or Markdown)

**Media:**

- `featured_image_url`: Main image URL
- `featured_image_alt`: Alt text for accessibility/SEO

**Relationships:**

- `author_id`: Who wrote it (links to profiles table)
  - `ON DELETE CASCADE`: If user deleted, their posts are deleted
- `category_id`: Which category (links to categories table)
  - `ON DELETE SET NULL`: If category deleted, post keeps existing

**Publishing:**

- `is_published`: TRUE = visible to public, FALSE = draft
- `published_at`: When it was published (set automatically)

**SEO (Search Engine Optimization):**

- `meta_title`: Custom title for Google (max 60 chars)
- `meta_description`: Description in search results (max 160 chars)
- `meta_keywords`: Array of keywords (e.g., `['react', 'tutorial']`)

**Engagement Metrics:**

- `view_count`: How many times viewed
- `like_count`: How many likes (auto-updated)
- `comment_count`: How many comments (auto-updated)

**Other:**

- `reading_time`: Estimated minutes to read (calculated by your app)
- `is_featured`: Show on homepage/featured section
- `is_pinned`: Keep at top of lists

**Example Post:**

```
title: "Getting Started with React"
slug: "getting-started-with-react"
excerpt: "Learn React basics in 10 minutes"
content: "<full article HTML>"
is_published: true
view_count: 1250
like_count: 45
```

---

### 4. Post_Tags Table (Junction/Bridge Table)

```sql
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);
```

**Purpose:** Links posts to tags (many-to-many relationship)

**Why This Table?**

- One post can have multiple tags
- One tag can be on multiple posts
- This table connects them

**Example Data:**
| post_id | tag_id | Meaning |
|---------|--------|---------|
| post-1 | tag-javascript | Post 1 has JavaScript tag |
| post-1 | tag-tutorial | Post 1 has Tutorial tag |
| post-2 | tag-javascript | Post 2 also has JavaScript tag |

**Cascade Deletes:**

- If post deleted → remove its tag connections
- If tag deleted → remove connections to that tag

---

### 5. Comments Table

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  content TEXT NOT NULL,

  -- Moderation
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),

  -- Engagement
  like_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** User comments on blog posts with moderation and nested replies

**Column Breakdown:**

- `post_id`: Which post is being commented on
- `user_id`: Who wrote the comment (must be a customer)
- `parent_id`: For threaded replies
  - `NULL` = top-level comment
  - `uuid` = reply to another comment
- `content`: The actual comment text

**Moderation System:**

- `pending`: New comment awaiting approval
- `approved`: Visible to everyone
- `rejected`: Hidden by moderator
- `spam`: Marked as spam

**Comment Threading Example:**

```
Comment 1 (parent_id: NULL)
  └─ Reply 1 (parent_id: Comment 1's ID)
  └─ Reply 2 (parent_id: Comment 1's ID)
Comment 2 (parent_id: NULL)
```

---

### 6. Post_Likes Table

```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

**Purpose:** Track which users liked which posts

**Key Feature:**

- `UNIQUE(post_id, user_id)`: Each user can only like a post once

**How It Works:**

1. User clicks "like" → Insert row
2. User clicks "unlike" → Delete row
3. Try to like twice → Database prevents it (unique constraint)

**Example Data:**
| post_id | user_id | Meaning |
|---------|---------|---------|
| post-1 | user-a | User A liked Post 1 |
| post-1 | user-b | User B liked Post 1 |
| post-2 | user-a | User A liked Post 2 |

---

### 7. Comment_Likes Table

```sql
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);
```

**Purpose:** Same as post likes, but for comments

**Why Separate Table?**

- Clean data structure
- Different permission rules
- Can track comment likes independently

---

### 8. Post_Views Table (Analytics)

```sql
CREATE TABLE post_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:** Track every view for analytics

**Column Breakdown:**

- `post_id`: Which post was viewed
- `user_id`: Who viewed it (NULL for anonymous)
- `ip_address`: Visitor's IP (for analytics/abuse prevention)
- `user_agent`: Browser info (Chrome, Safari, etc.)
- `viewed_at`: Timestamp of view

**Use Cases:**

- "Most viewed posts this week"
- "Where are readers coming from?"
- "Which posts are trending?"
- Prevent view count manipulation

---

## 🚀 INDEXES (Performance Optimization)

```sql
CREATE INDEX idx_posts_author ON posts(author_id);
```

**What Are Indexes?**
Think of them like a book's index. Instead of reading every page to find "React", you look in the index and jump to the right page.

**Common Indexes Explained:**

```sql
CREATE INDEX idx_posts_slug ON posts(slug);
```

**Why:** Queries like `SELECT * FROM posts WHERE slug = 'my-post'` become instant

```sql
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
```

**Why:** Sorting by date (newest first) is super fast

```sql
CREATE INDEX idx_posts_search ON posts USING GIN (
  to_tsvector('english', title || ' ' || excerpt || ' ' || content)
);
```

**What:** Full-text search index
**Why:** Enables fast searching like Google through post content
**How:** Creates searchable "tokens" from text

---

## ⚡ TRIGGERS (Auto-Updates)

### 1. Auto-Update Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**What It Does:**
Every time you UPDATE a post, `updated_at` is automatically set to current time.

**Example:**

```sql
UPDATE posts SET title = 'New Title' WHERE id = 'post-1';
-- updated_at automatically becomes NOW()
```

**Without Trigger:** You'd have to remember to manually set it every time!

---

### 2. Auto-Set Published Date

```sql
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = TRUE AND OLD.is_published = FALSE AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**What It Does:**
When you change `is_published` from FALSE to TRUE (publishing a draft), it automatically records the publish timestamp.

**Logic Breakdown:**

- `NEW.is_published = TRUE`: New value is published
- `OLD.is_published = FALSE`: Old value was draft
- `NEW.published_at IS NULL`: No publish date set yet
- **Action:** Set publish date to now

**Example:**

```sql
-- Draft post
UPDATE posts SET is_published = true WHERE id = 'post-1';
-- published_at is automatically set to NOW()
```

---

### 3. Auto-Update Like Counts

```sql
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**What It Does:**
Keeps `like_count` in sync with actual likes in `post_likes` table.

**How It Works:**

- User likes post → INSERT into `post_likes` → Trigger runs → `like_count += 1`
- User unlikes → DELETE from `post_likes` → Trigger runs → `like_count -= 1`

**Why This Matters:**
Instead of counting likes every time with `COUNT(*)`, you just read the cached number. Much faster!

**Same Logic For:**

- Comment like counts
- Post comment counts

---

## 🔐 ROW LEVEL SECURITY (RLS)

### What Is RLS?

**Instead of:**

```typescript
// Manually checking permissions in your app
if (user.role === "admin") {
  // Allow delete
}
```

**With RLS:**

```sql
-- Database automatically enforces rules
CREATE POLICY "Only admins can delete"
  ON posts FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');
```

**Benefits:**

- Security at database level (can't be bypassed)
- Consistent rules everywhere
- Less code in your application

---

### Helper Function: get_user_role()

```sql
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE user_id = user_uuid;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**What It Does:**
Given a user ID, returns their role ('customer', 'employee', 'admin', 'superadmin')

**SECURITY DEFINER:**
Runs with database privileges (can read profiles table even if user can't)

---

### RLS Policies Explained

#### 1. View Published Posts

```sql
CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (is_published = TRUE);
```

**Who:** Anyone (even not logged in)
**What:** Can read posts
**Condition:** Only if `is_published = TRUE`

---

#### 2. Staff Can View All Posts

```sql
CREATE POLICY "Staff can view all posts"
  ON posts FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('employee', 'admin', 'superadmin')
  );
```

**Who:** Employees, admins, superadmins
**What:** Can read ALL posts (including drafts)
**Why:** Staff needs to see unpublished posts

---

#### 3. Staff Can Create Posts

```sql
CREATE POLICY "Staff can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    get_user_role(auth.uid()) IN ('employee', 'admin', 'superadmin')
  );
```

**Who:** Staff only
**What:** Can INSERT new posts
**Checks:**

- Must be creating as themselves (`auth.uid() = author_id`)
- Must be staff role

**Prevents:**

- Customers creating posts
- Staff creating posts as other users

---

#### 4. Only Admins Can Delete

```sql
CREATE POLICY "Admin and SuperAdmin can delete posts"
  ON posts FOR DELETE
  USING (
    get_user_role(auth.uid()) IN ('admin', 'superadmin')
  );
```

**Who:** Only admins and superadmins
**What:** Can DELETE posts
**Hierarchy:** Employees can create/edit, but only admins can delete

---

#### 5. Only Customers Can Comment

```sql
CREATE POLICY "Only customers can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );
```

**Who:** Only customers
**What:** Can create comments
**Logic:** Staff shouldn't comment (keeps blog user-focused)

---

#### 6. Only Customers Can Like

```sql
CREATE POLICY "Only customers can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );
```

**Why:** Prevents staff from artificially boosting like counts

---

## 🔍 UTILITY FUNCTIONS

### 1. Get Trending Posts

```sql
CREATE OR REPLACE FUNCTION get_trending_posts(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.slug,
    COUNT(pv.id) as view_count,
    p.like_count,
    p.comment_count,
    (COUNT(pv.id) * 1.0 + p.like_count * 5.0 + p.comment_count * 3.0) as score
  FROM posts p
  LEFT JOIN post_views pv ON p.id = pv.post_id
    AND pv.viewed_at >= NOW() - INTERVAL '1 day' * days_back
  WHERE p.is_published = TRUE
  GROUP BY p.id, p.title, p.slug, p.like_count, p.comment_count
  ORDER BY score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

**What It Does:** Calculates which posts are "trending"

**Trending Score Formula:**

```
score = (views × 1) + (likes × 5) + (comments × 3)
```

**Why Different Weights?**

- Views = 1: Easy to get, less valuable
- Likes = 5: Shows engagement
- Comments = 3: Shows strong engagement

**Usage:**

```sql
SELECT * FROM get_trending_posts(7, 10);
-- Top 10 trending posts from last 7 days
```

---

### 2. Search Posts

```sql
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT)
RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.published_at,
    ts_rank(
      to_tsvector('english', p.title || ' ' || p.excerpt || ' ' || p.content),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM posts p
  WHERE
    p.is_published = TRUE
    AND to_tsvector('english', p.title || ' ' || p.excerpt || ' ' || p.content)
        @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

**What It Does:** Full-text search like Google

**How It Works:**

1. `to_tsvector`: Converts text to searchable tokens
2. `plainto_tsquery`: Converts search into query
3. `@@`: Matches query against tokens
4. `ts_rank`: Scores relevance

**Example:**

```sql
SELECT * FROM search_posts('react hooks tutorial');
-- Returns posts about React hooks, ranked by relevance
```

---

## 📝 SUMMARY

**8 Tables:**

1. **categories** - Organize posts
2. **tags** - Label posts
3. **posts** - Main content
4. **post_tags** - Link posts to tags
5. **comments** - User comments
6. **post_likes** - Track likes on posts
7. **comment_likes** - Track likes on comments
8. **post_views** - Analytics tracking

**Key Features:**

- ✅ Role-based permissions (customers vs staff)
- ✅ Auto-updating counters (likes, comments, views)
- ✅ Full-text search capability
- ✅ Trending algorithm
- ✅ Comment moderation system
- ✅ SEO optimization fields
- ✅ Database-level security (RLS)

**The database handles:**

- Permission checking
- Counter updates
- Timestamp management
- Publish date tracking
- Everything automatically!
