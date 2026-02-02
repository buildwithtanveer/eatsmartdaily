
import { prisma } from "@/lib/prisma";

export async function restoreBackup(backupId: number, userId: number) {
  const backup = await prisma.backup.findUnique({
    where: { id: backupId },
  });

  if (!backup) {
    throw new Error("Backup not found");
  }

  if (backup.status !== "COMPLETED") {
    throw new Error("Can only restore completed backups");
  }

  if (!backup.content) {
    throw new Error("Backup content not found in database");
  }

  // Parse backup content
  let payload;
  try {
    payload = JSON.parse(backup.content);
  } catch (e) {
    throw new Error("Invalid backup content format");
  }

  const data = payload.data;
  if (!data) {
    throw new Error("No data found in backup");
  }

  console.log(`[Backup Restore ${backupId}] Started by user ${userId}`);
  
  // Enable Maintenance Mode
  await prisma.siteSettings.updateMany({
    data: { maintenanceMode: true }
  });

  try {
    const stats = {
      users: 0,
      categories: 0,
      tags: 0,
      posts: 0,
      comments: 0,
      settings: 0,
      ads: 0,
      redirects: 0,
    };

    // 1. Restore Users
    if (data.users && Array.isArray(data.users)) {
      for (const u of data.users) {
        // Separate ID from data for update
        const { id, posts, comments, activityLogs, reviewedPosts, postVersions, backups, ...userData } = u;
        
        await prisma.user.upsert({
          where: { id: u.id },
          update: userData,
          create: {
            ...userData,
            id: u.id,
            password: u.password || "", // Use existing hash if available, else empty
          },
        });
        stats.users++;
      }
    }

    // 2. Restore Categories
    if (data.categories && Array.isArray(data.categories)) {
      for (const cat of data.categories) {
        const { id, posts, ...catData } = cat;
        await prisma.category.upsert({
          where: { id: cat.id },
          update: catData,
          create: { ...catData, id: cat.id },
        });
        stats.categories++;
      }
    }

    // 3. Restore Tags
    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        const { id, posts, ...tagData } = tag;
        await prisma.tag.upsert({
          where: { id: tag.id },
          update: tagData,
          create: { ...tagData, id: tag.id },
        });
        stats.tags++;
      }
    }

    // 4. Restore Posts
    if (data.posts && Array.isArray(data.posts)) {
      for (const post of data.posts) {
        // Handle Date conversion
        const postData = {
          ...post,
          createdAt: post.createdAt ? new Date(post.createdAt) : undefined,
          updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
          previewExpiresAt: post.previewExpiresAt ? new Date(post.previewExpiresAt) : undefined,
        };

        // Remove relations and ID
        // Note: cleanPostWithoutId contains authorId, categoryId scalars
        const { id, author, category, tags, comments, versions, ...cleanPostWithoutId } = postData;

        await prisma.post.upsert({
          where: { id: post.id },
          update: cleanPostWithoutId,
          create: {
            ...cleanPostWithoutId,
            id: post.id,
          },
        });

        // Restore Tags connection
        if (tags && Array.isArray(tags)) {
          // For explicit many-to-many via PostTag, we delete existing and create new links
          await prisma.post.update({
            where: { id: post.id },
            data: {
              tags: {
                deleteMany: {},
                create: tags.map((t: any) => ({
                  tag: {
                    connect: { id: t.tagId }
                  }
                })),
              },
            },
          });
        }

        // Restore Versions
        if (versions && Array.isArray(versions)) {
          for (const v of versions) {
            const vData = {
              ...v,
              createdAt: v.createdAt ? new Date(v.createdAt) : new Date(),
            };
            const { id, post, editor, ...cleanVersion } = vData;
            
            await prisma.postVersion.upsert({
              where: { id: v.id },
              update: cleanVersion,
              create: {
                ...cleanVersion,
                id: v.id,
              },
            });
          }
        }

        stats.posts++;
      }
    }

    // 5. Restore Comments
    if (data.comments && Array.isArray(data.comments)) {
      const sortedComments = [...data.comments].sort((a: any, b: any) => a.id - b.id);
      
      for (const comment of sortedComments) {
         const commentData = {
          ...comment,
          createdAt: comment.createdAt ? new Date(comment.createdAt) : undefined,
        };
        // Remove relations and ID
        const { id, post, user, parent, replies, ...cleanComment } = commentData;

        await prisma.comment.upsert({
          where: { id: comment.id },
          update: cleanComment,
          create: {
            ...cleanComment,
            id: comment.id,
          },
        });
        stats.comments++;
      }
    }

    // 6. Restore Settings
    if (data.settings) {
      const settings = data.settings;
      if (settings.id) {
          const { id, ...settingsData } = settings;
          // Ensure we don't accidentally enable maintenance mode if it was enabled in backup
          // or maybe we do want to restore exactly as is?
          // For now, let's restore as is, but finally block will disable it.
          await prisma.siteSettings.upsert({
              where: { id: settings.id },
              update: settingsData,
              create: { ...settingsData, id: settings.id }
          });
          stats.settings++;
      }
    }

    // 7. Restore Ads
    if (data.ads && Array.isArray(data.ads)) {
      for (const ad of data.ads) {
          const { id, ...adData } = ad;
          const cleanAd = {
              ...adData,
              createdAt: ad.createdAt ? new Date(ad.createdAt) : new Date()
          };
          
          await prisma.ad.upsert({
              where: { id: ad.id },
              update: cleanAd,
              create: { ...cleanAd, id: ad.id }
          });
          stats.ads++;
      }
    }

    // 8. Restore Redirects
    if (data.redirects && Array.isArray(data.redirects)) {
      for (const r of data.redirects) {
          const { id, ...rData } = r;
          const cleanR = {
              ...rData,
              createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
              updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date()
          };
          
          await prisma.redirect.upsert({
              where: { id: r.id },
              update: cleanR,
              create: { ...cleanR, id: r.id }
          });
          stats.redirects++;
      }
    }

    // Log success
    await prisma.activityLog.create({
      data: {
        action: "backup_restore_completed",
        resource: `backup_${backupId}`,
        details: `Restore completed. Recovered: ${stats.posts} posts, ${stats.users} users, ${stats.comments} comments.`,
        userId: userId,
      },
    });

    return stats;

  } finally {
    // Disable Maintenance Mode
    await prisma.siteSettings.updateMany({
      data: { maintenanceMode: false }
    });
  }
}
