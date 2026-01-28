import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@eatsmartdaily.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@eatsmartdaily.com",
      password,
      role: "ADMIN",
      bio: "Founder and Lead Nutritionist at Eat Smart Daily.",
      jobTitle: "Lead Nutritionist",
    },
  });

  console.log("✅ Admin user ensured");

  // 2. Create Categories
  const categories = [
    { name: "Healthy Eating", slug: "healthy-eating" },
    { name: "Diet Tips", slug: "diet-tips" },
    { name: "Recipes", slug: "recipes" },
    { name: "Nutrition", slug: "nutrition" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories created");

  const healthyCat = await prisma.category.findUnique({ where: { slug: "healthy-eating" } });
  const dietCat = await prisma.category.findUnique({ where: { slug: "diet-tips" } });

  // 3. Create Tags
  const tags = [
    { name: "Superfoods", slug: "superfoods" },
    { name: "Weight Loss", slug: "weight-loss" },
    { name: "Meal Prep", slug: "meal-prep" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log("✅ Tags created");

  const superfoodsTag = await prisma.tag.findUnique({ where: { slug: "superfoods" } });

  // 4. Create Sample Posts
  const posts = [
    {
      title: "10 Superfoods You Should Eat Every Day",
      slug: "10-superfoods-every-day",
      content: "<p>Superfoods are nutrient-dense foods that provide significant health benefits...</p><h2>1. Blueberries</h2><p>Packed with antioxidants...</p>",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: admin.id,
      categoryId: healthyCat?.id,
      excerpt: "Discover the most powerful foods on the planet that can boost your energy and health.",
      featuredImage: "https://images.unsplash.com/photo-1490818387583-1baba5e638af",
      isFeatured: true,
      showInSlider: true,
    },
    {
      title: "How to Start a Sustainable Diet",
      slug: "sustainable-diet-guide",
      content: "<p>Many people fail at dieting because they choose restrictive plans...</p><h2>Focus on Whole Foods</h2><p>Sustainable dieting is about balance...</p>",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: admin.id,
      categoryId: dietCat?.id,
      excerpt: "Forget crash diets. Learn how to build a lifestyle that lasts a lifetime.",
      featuredImage: "https://images.unsplash.com/photo-1494390248081-4e521a5940db",
      showInLatest: true,
    }
  ];

  for (const postData of posts) {
    const { ...data } = postData;
    const post = await prisma.post.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        publishedAt: new Date(),
      } as any,
    });

    if (superfoodsTag && data.slug === "10-superfoods-every-day") {
        await prisma.postTag.upsert({
            where: { postId_tagId: { postId: post.id, tagId: superfoodsTag.id } },
            update: {},
            create: { postId: post.id, tagId: superfoodsTag.id }
        });
    }
  }
  console.log("✅ Sample posts created");

  // 5. Site Settings
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: "Eat Smart Daily",
      siteDescription: "Expert-backed nutrition tips and healthy recipes.",
      contactEmail: "hello@eatsmartdaily.com",
    },
  });
  console.log("✅ Site settings created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
