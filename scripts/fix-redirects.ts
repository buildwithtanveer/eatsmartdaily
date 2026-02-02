import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Starting redirect cleanup...");

  const redirects = await prisma.redirect.findMany();
  let fixedCount = 0;

  for (const r of redirects) {
    let newSource = r.source;
    let changed = false;

    // 1. Strip domain
    if (newSource.match(/^https?:\/\//i)) {
      try {
        const url = new URL(newSource);
        newSource = url.pathname;
        changed = true;
        console.log(`Strip domain: ${r.source} -> ${newSource}`);
      } catch (e) {
        console.warn(`Failed to parse URL: ${r.source}`);
      }
    }

    // 2. Ensure leading slash
    if (!newSource.startsWith("/")) {
      newSource = "/" + newSource;
      changed = true;
    }

    // 3. Remove trailing slash (if not root)
    if (newSource.length > 1 && newSource.endsWith("/")) {
      newSource = newSource.slice(0, -1);
      changed = true;
    }

    if (changed) {
      // Check if a redirect with this normalized source already exists to avoid unique constraint error
      const existing = await prisma.redirect.findUnique({
        where: { source: newSource },
      });

      if (existing && existing.id !== r.id) {
        console.warn(`Skipping fix for ${r.id} because ${newSource} already exists (ID: ${existing.id}). Deleting duplicate...`);
        await prisma.redirect.delete({ where: { id: r.id } });
      } else {
        await prisma.redirect.update({
          where: { id: r.id },
          data: { source: newSource },
        });
        console.log(`Updated ID ${r.id}: ${r.source} -> ${newSource}`);
        fixedCount++;
      }
    }
  }

  console.log(`Cleanup complete. Fixed ${fixedCount} redirects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
