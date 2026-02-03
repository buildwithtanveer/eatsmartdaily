# Database Performance Indexes

The EatSmartDaily application should have the following additional indexes for optimal performance:

## Current Indexes
The application already has these indexes:
- Category: `slug` 
- Comment: `status`, `createdAt`
- Post: `slug`, `status`, `publishedAt`, `createdAt`, `authorId`, `categoryId`
- Tag: `slug`
- User: `email`, `role`

## Recommended Additional Indexes

### For Post Queries
```sql
-- Composite index for filtering by status and publication date
CREATE INDEX `Post_status_publishedAt_idx` ON `Post`(`status`, `publishedAt`);

-- Index for featured posts
CREATE INDEX `Post_isFeatured_status_publishedAt_idx` ON `Post`(`isFeatured`, `status`, `publishedAt`);

-- Index for popular posts (by views and publication date)
CREATE INDEX `Post_views_publishedAt_idx` ON `Post`(`views`, `publishedAt`);
```

### For Comment Queries
```sql
-- Index for approved comments on published posts
CREATE INDEX `Comment_status_postId_idx` ON `Comment`(`status`, `postId`);

-- Index for user comments
CREATE INDEX `Comment_userId_createdAt_idx` ON `Comment`(`userId`, `createdAt`);
```

### For User Queries
```sql
-- Index for user posts count
CREATE INDEX `Post_authorId_status_idx` ON `Post`(`authorId`, `status`);
```

### For Analytics Queries
```sql
-- Index for daily statistics
CREATE INDEX `DailyStat_date_idx` ON `DailyStat`(`date`);

-- Index for daily visitors
CREATE INDEX `DailyVisitor_statId_ipHash_idx` ON `DailyVisitor`(`statId`, `ipHash`);
```

### For Activity Logs
```sql
-- Index for user activity
CREATE INDEX `ActivityLog_userId_createdAt_idx` ON `ActivityLog`(`userId`, `createdAt`);

-- Index for resource-based activity
CREATE INDEX `ActivityLog_resource_action_idx` ON `ActivityLog`(`resource`, `action`);
```

### For Redirects
```sql
-- Index for active redirects lookup
CREATE INDEX `Redirect_isActive_source_idx` ON `Redirect`(`isActive`, `source`);
```

These indexes will significantly improve query performance for common operations like:
- Loading blog posts by status and date
- Filtering comments
- User-specific queries
- Analytics reporting
- Redirect lookups