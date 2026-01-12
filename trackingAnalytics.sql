-- Unique views vs total views
SELECT 
  COUNT(*) as total_views,
  COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_views
FROM post_views
WHERE post_id = 'your-post-id';

-- Views over time
SELECT 
  DATE(viewed_at) as date,
  COUNT(*) as views
FROM post_views
WHERE post_id = 'your-post-id'
GROUP BY DATE(viewed_at)
ORDER BY date DESC;

-- Top referrers
SELECT 
  COALESCE(referrer, 'Direct') as source,
  COUNT(*) as visits
FROM post_views
WHERE post_id = 'your-post-id'
GROUP BY referrer
ORDER BY visits DESC
LIMIT 10;

-- Device/Browser breakdown
SELECT 
  CASE 
    WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
    WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
    ELSE 'Desktop'
  END as device_type,
  COUNT(*) as views
FROM post_views
WHERE post_id = 'your-post-id'
GROUP BY device_type;