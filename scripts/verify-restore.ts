
import { prisma } from "../src/lib/prisma";
import { restoreBackup } from "../src/lib/backup-service";

async function main() {
  console.log("Starting restore verification...");

  // 1. Setup: Get a user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No users found. Cannot run test.");
    return;
  }
  console.log(`Using user: ${user.email} (${user.id})`);

  // 2. Setup: Create a dummy post
  const dummyPostSlug = "test-restore-slug-" + Date.now();
  const dummyPost = await prisma.post.create({
    data: {
      title: "Test Restore Post",
      slug: dummyPostSlug,
      content: "This is a test post for backup restoration.",
      authorId: user.id,
      status: "DRAFT",
    },
  });
  console.log(`Created dummy post: ${dummyPost.id} (${dummyPost.slug})`);

  // 3. Create backup content
  const backupData = {
    posts: [
      {
        ...dummyPost,
        createdAt: dummyPost.createdAt.toISOString(),
        updatedAt: dummyPost.updatedAt.toISOString(),
      }
    ],
    users: [user], // Include user to satisfy dependencies
  };

  const payload = {
    exportedAt: new Date().toISOString(),
    exportType: "POSTS_ONLY",
    data: backupData,
  };

  const content = JSON.stringify(payload);
  const size = BigInt(content.length);

  // 4. Create backup record
  const backup = await prisma.backup.create({
    data: {
      filename: `test_backup_${Date.now()}.json`,
      type: "POSTS_ONLY",
      status: "COMPLETED",
      size: size,
      content: content,
      createdBy: user.id,
    },
  });
  console.log(`Created test backup: ${backup.id}`);

  // 5. Delete the post
  await prisma.post.delete({
    where: { id: dummyPost.id },
  });
  console.log(`Deleted dummy post: ${dummyPost.id}`);

  // Verify deletion
  const deletedPost = await prisma.post.findUnique({
    where: { id: dummyPost.id },
  });
  if (deletedPost) {
    console.error("Failed to delete post. Test aborted.");
    return;
  }

  // 6. Run Restore
  console.log("Running restoreBackup...");
  try {
    const stats = await restoreBackup(backup.id, user.id);
    console.log("Restore stats:", stats);
  } catch (e) {
    console.error("Restore failed:", e);
  }

  // 7. Verify Restoration
  const restoredPost = await prisma.post.findUnique({
    where: { id: dummyPost.id },
  });

  if (restoredPost) {
    console.log("SUCCESS: Post restored successfully!");
    console.log(`Restored Post ID: ${restoredPost.id}, Title: ${restoredPost.title}`);
  } else {
    console.error("FAILURE: Post was NOT restored.");
  }

  // 8. Cleanup
  console.log("Cleaning up...");
  if (restoredPost) {
    await prisma.post.delete({ where: { id: restoredPost.id } });
  }
  await prisma.backup.delete({ where: { id: backup.id } });
  console.log("Cleanup complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
