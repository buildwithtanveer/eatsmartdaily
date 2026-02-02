import { prisma } from "../src/lib/prisma";
import { getRedirect } from "../src/lib/redirect-service";

async function main() {
  console.log("Starting redirect verification...");

  const testSource = "/test-redirect-source-" + Date.now();
  const testDestination = "/test-redirect-dest";

  // 1. Create a redirect
  console.log(`Creating redirect: ${testSource} -> ${testDestination}`);
  const redirect = await prisma.redirect.create({
    data: {
      source: testSource,
      destination: testDestination,
      type: "PERMANENT",
      isActive: true,
    },
  });

  // 2. Test exact match
  console.log("Testing exact match...");
  const result1 = await getRedirect(testSource);
  if (result1?.destination === testDestination) {
    console.log("✅ Exact match passed");
  } else {
    console.error("❌ Exact match failed", result1);
  }

  // 3. Test missing leading slash (getRedirect normalizes)
  console.log("Testing missing leading slash...");
  const result2 = await getRedirect(testSource.substring(1)); // remove leading /
  if (result2?.destination === testDestination) {
    console.log("✅ Normalization passed");
  } else {
    console.error("❌ Normalization failed", result2);
  }

  // 4. Test inactive redirect
  console.log("Testing inactive redirect...");
  await prisma.redirect.update({
    where: { id: redirect.id },
    data: { isActive: false },
  });
  const result3 = await getRedirect(testSource);
  if (result3 === null) {
    console.log("✅ Inactive check passed");
  } else {
    console.error("❌ Inactive check failed", result3);
  }

  // 5. Cleanup
  console.log("Cleaning up...");
  await prisma.redirect.delete({
    where: { id: redirect.id },
  });

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
