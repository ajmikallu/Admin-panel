-- =============================================
-- ADVANCED BLOG SYSTEM FOR SUPABASE
-- With Role-Based Access Control
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. TAGS TABLE
-- =============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. POSTS TABLE (Main Blog Table)
-- =============================================
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
  
  -- Publishing Status (Simplified)
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
  
  -- Reading Time (in minutes)
  reading_time INTEGER,
  
  -- Featured & Pinned
  is_featured BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. POST_TAGS (Many-to-Many Relationship)
-- =============================================
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- =============================================
-- 5. COMMENTS TABLE (Only customers can comment)
-- =============================================
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

-- =============================================
-- 6. POST_LIKES TABLE (Only customers can like)
-- =============================================
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- =============================================
-- 7. COMMENT_LIKES TABLE (Only customers can like)
-- =============================================
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- =============================================
-- 8. POST_VIEWS TABLE (For Analytics)
-- =============================================
CREATE TABLE post_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add session_id and referrer columns to existing table
ALTER TABLE post_views 
ADD COLUMN session_id VARCHAR(255),
ADD COLUMN referrer TEXT;



-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Posts indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(is_published);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE is_featured = TRUE;

-- Full-text search index
CREATE INDEX idx_posts_search ON posts USING GIN (
  to_tsvector('english', title || ' ' || excerpt || ' ' || content)
);

-- Comments indexes
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);

-- Likes indexes
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);

-- Views indexes
CREATE INDEX idx_post_views_post ON post_views(post_id);
CREATE INDEX idx_post_views_date ON post_views(viewed_at DESC);
-- Add index for deduplication checks
CREATE INDEX idx_post_views_session ON post_views(session_id, post_id, viewed_at);
CREATE INDEX idx_post_views_user ON post_views(user_id, post_id, viewed_at);

-- =============================================
-- TRIGGERS FOR AUTO-UPDATE
-- =============================================

-- Update updated_at timestamp
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

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set published_at when is_published changes to true
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = TRUE AND OLD.is_published = FALSE AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_published_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION set_published_at();

-- =============================================
-- TRIGGERS FOR ENGAGEMENT METRICS
-- =============================================

-- Update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET like_count = like_count + 1 
    WHERE id = NEW.post_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET like_count = GREATEST(like_count - 1, 0)  -- ✅ Never go below 0
    WHERE id = OLD.post_id;
    
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_post_like_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_like_count();

-- Update comment like count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comment_like_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_like_count();

-- Update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- =============================================
-- HELPER FUNCTION TO GET USER ROLE
-- =============================================
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

-- =============================================
-- ROW LEVEL SECURITY (RLS) - ROLE-BASED
-- =============================================

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POSTS POLICIES (Role-Based)
-- =============================================

-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts"
  ON posts FOR SELECT
  USING (is_published = TRUE);

-- Staff (employee, admin, superadmin) can view all posts
CREATE POLICY "Staff can view all posts"
  ON posts FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('employee', 'admin', 'superadmin')
  );

-- Only employee, admin, superadmin can CREATE posts
CREATE POLICY "Staff can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    get_user_role(auth.uid()) IN ('employee', 'admin', 'superadmin')
  );

-- Only employee, admin, superadmin can UPDATE posts
CREATE POLICY "Staff can update posts"
  ON posts FOR UPDATE
  USING (
    get_user_role(auth.uid()) IN ('employee', 'admin', 'superadmin')
  );

-- Only admin and superadmin can DELETE posts
CREATE POLICY "Admin and SuperAdmin can delete posts"
  ON posts FOR DELETE
  USING (
    get_user_role(auth.uid()) IN ('admin', 'superadmin')
  );

-- =============================================
-- CATEGORIES & TAGS POLICIES
-- =============================================

-- Anyone can view categories and tags
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view post_tags"
  ON post_tags FOR SELECT
  USING (true);

-- Only staff can manage categories
CREATE POLICY "Staff can manage categories"
  ON categories FOR ALL
  USING (
    get_user_role(auth.uid()) IN ('employee', 'admin', 'superadmin')
  );

-- Only staff can manage tags
CREATE POLICY "Staff can manage tags"
  ON tags FOR ALL
  USING (
    get_user_role(auth.uid()) IN ('employee', 'admin', 'superadmin')
  );

-- =============================================
-- COMMENTS POLICIES (Only customers can comment)
-- =============================================

-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments"
  ON comments FOR SELECT
  USING (status = 'approved');

-- Only CUSTOMERS can create comments
CREATE POLICY "Only customers can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );

-- Staff can moderate all comments
CREATE POLICY "Staff can moderate comments"
  ON comments FOR UPDATE
  USING (
    get_user_role(auth.uid()) IN ('admin', 'superadmin')
  );

-- =============================================
-- LIKES POLICIES (Only customers can like)
-- =============================================

-- Anyone can view post likes
CREATE POLICY "Anyone can view post likes"
  ON post_likes FOR SELECT
  USING (true);

-- Only CUSTOMERS can like posts
CREATE POLICY "Only customers can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );

-- Only CUSTOMERS can unlike posts
CREATE POLICY "Only customers can unlike posts"
  ON post_likes FOR DELETE
  USING (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );

-- Anyone can view comment likes
CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

-- Only CUSTOMERS can like comments
CREATE POLICY "Only customers can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );

-- Only CUSTOMERS can unlike comments
CREATE POLICY "Only customers can unlike comments"
  ON comment_likes FOR DELETE
  USING (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );

-- =============================================
-- VIEWS POLICIES
-- =============================================

-- Anyone can create views
CREATE POLICY "Anyone can create views"
  ON post_views FOR INSERT
  WITH CHECK (true);

-- Staff can view analytics
CREATE POLICY "Staff can view analytics"
  ON post_views FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('employee', 'admin', 'superadmin')
  );

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to get trending posts
CREATE OR REPLACE FUNCTION get_trending_posts(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  post_id UUID,
  title VARCHAR,
  slug VARCHAR,
  view_count BIGINT,
  like_count INTEGER,
  comment_count INTEGER,
  score NUMERIC
) AS $$
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

-- Function to search posts
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  excerpt TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
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
    AND to_tsvector('english', p.title || ' ' || p.excerpt || ' ' || p.content) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get posts by author (for staff dashboard)
CREATE OR REPLACE FUNCTION get_posts_by_author(author_uuid UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  is_published BOOLEAN,
  view_count INTEGER,
  like_count INTEGER,
  comment_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.slug,
    p.is_published,
    p.view_count,
    p.like_count,
    p.comment_count,
    p.created_at
  FROM posts p
  WHERE p.author_id = author_uuid
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;





-- =============================================
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Allow everyone to view images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND auth.uid() = owner);
-- =============================================

-- =============================================
--New function RPC Function with Smart Deduplication
-- =============================================

-- Drop if exists (for re-running)
DROP FUNCTION IF EXISTS track_post_view(UUID, UUID, VARCHAR, TEXT, INET, TEXT);

-- Create the tracking function
CREATE OR REPLACE FUNCTION track_post_view(
  p_post_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_session_id VARCHAR DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_is_duplicate BOOLEAN := FALSE;
  v_view_id UUID;
  v_result jsonb;
BEGIN
  -- Check for duplicate view in last 24 hours
  -- Priority: user_id > session_id > ip_address
  IF p_user_id IS NOT NULL THEN
    -- Check if logged-in user already viewed
    SELECT EXISTS (
      SELECT 1 FROM post_views
      WHERE post_id = p_post_id
        AND user_id = p_user_id
        AND viewed_at > NOW() - INTERVAL '24 hours'
    ) INTO v_is_duplicate;
  ELSIF p_session_id IS NOT NULL THEN
    -- Check if anonymous session already viewed
    SELECT EXISTS (
      SELECT 1 FROM post_views
      WHERE post_id = p_post_id
        AND session_id = p_session_id
        AND viewed_at > NOW() - INTERVAL '24 hours'
    ) INTO v_is_duplicate;
  ELSIF p_ip_address IS NOT NULL THEN
    -- Fallback: Check if IP already viewed (less reliable)
    SELECT EXISTS (
      SELECT 1 FROM post_views
      WHERE post_id = p_post_id
        AND ip_address = p_ip_address
        AND viewed_at > NOW() - INTERVAL '24 hours'
    ) INTO v_is_duplicate;
  END IF;

  -- Only track if not duplicate
  IF NOT v_is_duplicate THEN
    -- Insert new view record
    INSERT INTO post_views (
      post_id, 
      user_id, 
      session_id, 
      referrer, 
      ip_address, 
      user_agent
    )
    VALUES (
      p_post_id, 
      p_user_id, 
      p_session_id, 
      p_referrer, 
      p_ip_address, 
      p_user_agent
    )
    RETURNING id INTO v_view_id;
    
    -- Increment view counter on posts table
    UPDATE posts 
    SET view_count = view_count + 1 
    WHERE id = p_post_id;
    
    -- Return success response
    v_result := jsonb_build_object(
      'success', true,
      'view_id', v_view_id,
      'is_new_view', true,
      'message', 'View tracked successfully'
    );
  ELSE
    -- Return duplicate response
    v_result := jsonb_build_object(
      'success', true,
      'view_id', NULL,
      'is_new_view', false,
      'message', 'Duplicate view (within 24 hours)'
    );
  END IF;

  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to track view'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- FIX 1: Update Comment Like Count Trigger
-- Add SECURITY DEFINER and prevent negative counts
-- =============================================

DROP FUNCTION IF EXISTS update_comment_like_count() CASCADE;

CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments 
    SET like_count = like_count + 1 
    WHERE id = NEW.comment_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments 
    SET like_count = GREATEST(like_count - 1, 0)  -- ✅ Prevent negative counts
    WHERE id = OLD.comment_id;
    
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  -- ✅ Added SECURITY DEFINER

-- Recreate trigger
CREATE TRIGGER trigger_comment_like_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_like_count();


-- =============================================
-- FIX 2: Update Post Comment Count Trigger
-- Add SECURITY DEFINER and prevent negative counts
-- =============================================

DROP FUNCTION IF EXISTS update_post_comment_count() CASCADE;

CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.post_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET comment_count = GREATEST(comment_count - 1, 0)  -- ✅ Prevent negative counts
    WHERE id = OLD.post_id;
    
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;  -- ✅ Added SECURITY DEFINER

-- Recreate trigger
CREATE TRIGGER trigger_post_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();


-- =============================================
-- FIX 3: Add Database Constraints
-- Prevent negative counts at database level
-- =============================================

-- Drop existing constraints if they exist (to avoid errors)
DO $ 
BEGIN
  ALTER TABLE posts DROP CONSTRAINT IF EXISTS check_view_count_positive;
  ALTER TABLE posts DROP CONSTRAINT IF EXISTS check_like_count_positive;
  ALTER TABLE posts DROP CONSTRAINT IF EXISTS check_comment_count_positive;
  ALTER TABLE comments DROP CONSTRAINT IF EXISTS check_like_count_positive;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $;

-- Add constraints to posts table
ALTER TABLE posts 
ADD CONSTRAINT check_view_count_positive CHECK (view_count >= 0);

ALTER TABLE posts 
ADD CONSTRAINT check_like_count_positive CHECK (like_count >= 0);

ALTER TABLE posts 
ADD CONSTRAINT check_comment_count_positive CHECK (comment_count >= 0);

-- Add constraints to comments table
ALTER TABLE comments
ADD CONSTRAINT check_like_count_positive CHECK (like_count >= 0);


-- =============================================
-- FIX 4: Reset All Counts to Match Reality
-- Recalculate all engagement metrics from actual data
-- =============================================

-- Reset post like counts
UPDATE posts p
SET like_count = COALESCE(
  (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id),
  0
);

-- Reset comment like counts
UPDATE comments c
SET like_count = COALESCE(
  (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id),
  0
);

-- Reset post comment counts
UPDATE posts p
SET comment_count = COALESCE(
  (SELECT COUNT(*) FROM comments WHERE post_id = p.id),
  0
);


-- =============================================
-- FIX 5: Add Performance Index
-- Optimize hasLikedPost() queries
-- =============================================

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_post_likes_user_post;
DROP INDEX IF EXISTS idx_comment_likes_user_comment;

-- Create new indexes
CREATE INDEX idx_post_likes_user_post 
ON post_likes(user_id, post_id);

CREATE INDEX idx_comment_likes_user_comment 
ON comment_likes(user_id, comment_id);


-- =============================================
-- VERIFICATION QUERIES
-- Run these to verify everything is fixed
-- =============================================

-- 1. Check all triggers exist with SECURITY DEFINER
SELECT 
  t.trigger_name,
  p.proname as function_name,
  CASE 
    WHEN p.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type
FROM information_schema.triggers t
JOIN pg_proc p ON p.proname = SUBSTRING(t.action_statement FROM 'EXECUTE FUNCTION ([a-z_]+)' FOR '#')
WHERE t.trigger_name IN (
  'trigger_post_like_count',
  'trigger_comment_like_count', 
  'trigger_post_comment_count'
)
ORDER BY t.trigger_name;

-- 2. Verify no negative counts exist
SELECT 'posts' as table_name, COUNT(*) as negative_count
FROM posts 
WHERE view_count < 0 OR like_count < 0 OR comment_count < 0
UNION ALL
SELECT 'comments' as table_name, COUNT(*) as negative_count
FROM comments 
WHERE like_count < 0;

-- 3. Verify counts match reality
SELECT 
  'Post Likes' as metric,
  COUNT(*) as mismatches
FROM (
  SELECT p.id
  FROM posts p
  LEFT JOIN post_likes pl ON p.id = pl.post_id
  GROUP BY p.id
  HAVING p.like_count != COUNT(pl.id)
) AS diff
UNION ALL
SELECT 
  'Comment Likes' as metric,
  COUNT(*) as mismatches
FROM (
  SELECT c.id
  FROM comments c
  LEFT JOIN comment_likes cl ON c.id = cl.comment_id
  GROUP BY c.id
  HAVING c.like_count != COUNT(cl.id)
) AS diff
UNION ALL
SELECT 
  'Post Comments' as metric,
  COUNT(*) as mismatches
FROM (
  SELECT p.id
  FROM posts p
  LEFT JOIN comments c ON p.id = c.post_id
  GROUP BY p.id
  HAVING p.comment_count != COUNT(c.id)
) AS diff;

-- Expected output: All metrics should show 0 mismatches


-- =============================================
-- SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ All fixes applied successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. Added SECURITY DEFINER to update_comment_like_count()';
  RAISE NOTICE '2. Added SECURITY DEFINER to update_post_comment_count()';
  RAISE NOTICE '3. Added GREATEST() to prevent negative counts';
  RAISE NOTICE '4. Added database constraints for positive counts';
  RAISE NOTICE '5. Reset all counts to match actual data';
  RAISE NOTICE '6. Added performance indexes for like checks';
  RAISE NOTICE '';
  RAISE NOTICE 'Run the verification queries above to confirm everything works!';
END $$;


-- =============================================
-- FIX 1: Update Comment Like Count Trigger
-- Add SECURITY DEFINER and prevent negative counts
-- =============================================

DROP FUNCTION IF EXISTS update_comment_like_count() CASCADE;

CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments 
    SET like_count = like_count + 1 
    WHERE id = NEW.comment_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments 
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = OLD.comment_id;
    
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_comment_like_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_like_count();


-- =============================================
-- FIX 2: Update Post Comment Count Trigger
-- Add SECURITY DEFINER and prevent negative counts
-- =============================================

DROP FUNCTION IF EXISTS update_post_comment_count() CASCADE;

CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.post_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts 
    SET comment_count = GREATEST(comment_count - 1, 0)
    WHERE id = OLD.post_id;
    
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_post_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();


-- =============================================
-- FIX 3: Add Database Constraints
-- Prevent negative counts at database level
-- =============================================

ALTER TABLE posts 
ADD CONSTRAINT check_view_count_positive CHECK (view_count >= 0);

ALTER TABLE posts 
ADD CONSTRAINT check_like_count_positive CHECK (like_count >= 0);

ALTER TABLE posts 
ADD CONSTRAINT check_comment_count_positive CHECK (comment_count >= 0);

ALTER TABLE comments
ADD CONSTRAINT check_comment_like_count_positive CHECK (like_count >= 0);


-- =============================================
-- FIX 4: Reset All Counts to Match Reality
-- Recalculate all engagement metrics from actual data
-- =============================================

UPDATE posts p
SET like_count = COALESCE(
  (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id),
  0
);

UPDATE comments c
SET like_count = COALESCE(
  (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id),
  0
);

UPDATE posts p
SET comment_count = COALESCE(
  (SELECT COUNT(*) FROM comments WHERE post_id = p.id),
  0
);


-- =============================================
-- FIX 5: Add Performance Index
-- Optimize hasLikedPost() queries
-- =============================================

DROP INDEX IF EXISTS idx_post_likes_user_post;
DROP INDEX IF EXISTS idx_comment_likes_user_comment;

CREATE INDEX idx_post_likes_user_post 
ON post_likes(user_id, post_id);

CREATE INDEX idx_comment_likes_user_comment 
ON comment_likes(user_id, comment_id);


-- =============================================
-- VERIFICATION QUERIES
-- Run these separately to verify everything is fixed
-- =============================================

-- 1. Check all triggers exist with SECURITY DEFINER
-- SELECT 
--   t.trigger_name,
--   p.proname as function_name,
--   CASE 
--     WHEN p.prosecdef THEN 'SECURITY DEFINER'
--     ELSE 'SECURITY INVOKER'
--   END as security_type
-- FROM information_schema.triggers t
-- JOIN pg_proc p ON p.proname = SUBSTRING(t.action_statement FROM 'EXECUTE FUNCTION ([a-z_]+)' FOR '#')
-- WHERE t.trigger_name IN (
--   'trigger_post_like_count',
--   'trigger_comment_like_count', 
--   'trigger_post_comment_count'
-- )
-- ORDER BY t.trigger_name;

-- 2. Verify no negative counts exist
-- SELECT 'posts' as table_name, COUNT(*) as negative_count
-- FROM posts 
-- WHERE view_count < 0 OR like_count < 0 OR comment_count < 0
-- UNION ALL
-- SELECT 'comments' as table_name, COUNT(*) as negative_count
-- FROM comments 
-- WHERE like_count < 0;

-- 3. Verify counts match reality
-- SELECT 
--   'Post Likes' as metric,
--   COUNT(*) as mismatches
-- FROM (
--   SELECT p.id
--   FROM posts p
--   LEFT JOIN post_likes pl ON p.id = pl.post_id
--   GROUP BY p.id
--   HAVING p.like_count != COUNT(pl.id)
-- ) AS diff
-- UNION ALL
-- SELECT 
--   'Comment Likes' as metric,
--   COUNT(*) as mismatches
-- FROM (
--   SELECT c.id
--   FROM comments c
--   LEFT JOIN comment_likes cl ON c.id = cl.comment_id
--   GROUP BY c.id
--   HAVING c.like_count != COUNT(cl.id)
-- ) AS diff
-- UNION ALL
-- SELECT 
--   'Post Comments' as metric,
--   COUNT(*) as mismatches
-- FROM (
--   SELECT p.id
--   FROM posts p
--   LEFT JOIN comments c ON p.id = c.post_id
--   GROUP BY p.id
--   HAVING p.comment_count != COUNT(c.id)
-- ) AS diff;

CREATE POLICY "public_read_approved_comments"
ON comments
FOR SELECT
USING (status = 'approved');
