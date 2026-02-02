# 🗄️ PRODUCTION DATABASE SETUP GUIDE

**Status:** Fresh Railway MySQL Database Setup  
**Goal:** Create all tables and populate with initial data  
**Database:** Railway MySQL  
**Time Required:** 5-10 minutes

---

## ✅ WHAT YOU'LL DO

```
Step 1: Push schema to database (create all tables)
         ↓
Step 2: Seed initial data (admin user, categories, posts)
         ↓
Step 3: Verify data was created
         ↓
Done! 🎉
```

---

## 🚀 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Create Database Schema (Create All Tables)**

Run this command **in your project terminal** (where package.json is):

```bash
npx prisma migrate deploy
```

**What this does:**

- Creates all tables based on `prisma/schema.prisma`
- Creates indexes for performance
- Sets up relationships between tables
- Takes ~30 seconds

**Expected Output:**

```
✔ Prisma schema loaded from prisma/schema.prisma
✔ Datasource verified. Connected to MySQL
✔ Migrations to apply:
  - 20260122114712_init
  - 20260122123124_featured_post
  - 20260122125520_featured_post
  - 20260124190427_add_comments_ads_settings
  - 20260127171544_add_performance_indexes
  - 20260128110856_add_email_smtp_settings
  - 20260128112522_add_advanced_features

✔ All migrations applied successfully
```

---

### **STEP 2: Populate Initial Data (Seed the Database)**

Run this command **in your project terminal**:

```bash
npx prisma db seed
```

**What this does:**

- Creates admin user (email: `admin@eatsmartdaily.com`, password: `admin123`)
- Creates 4 categories (Healthy Eating, Diet Tips, Recipes, Nutrition)
- Creates sample posts (10 blog posts with content)
- Creates sample tags
- Creates site settings

**Expected Output:**

```
Running seed command `tsx prisma/seed.ts` ...

✅ Admin user ensured
✅ Categories created
✅ Tags created
✅ Posts created (10 sample posts)
✅ Site settings created
✅ Database seeded successfully
```

---

### **STEP 3: Verify Data Was Created**

**Option A: Using Prisma Studio (Visual)**

```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555`

You'll see:

- ✅ User table with admin user
- ✅ Post table with 10 sample posts
- ✅ Category table with 4 categories
- ✅ And all other tables

**Option B: Using Railway Dashboard**

1. Go to [Railway.app](https://railway.app)
2. Find your MySQL service
3. Click "Connect"
4. View tables and data

**Option C: Using MySQL Command Line**

```bash
# Connect to your database
mysql -u root -p -h mysql.railway.internal -D railway

# List all tables
SHOW TABLES;

# Count records
SELECT COUNT(*) FROM post;
SELECT COUNT(*) FROM user;
SELECT COUNT(*) FROM category;
```

---

## 📋 WHAT TABLES WERE CREATED?

Here's everything set up in your production database:

| Table                  | Purpose                  | Initial Records          |
| ---------------------- | ------------------------ | ------------------------ |
| `user`                 | Admin users & authors    | 1 (admin)                |
| `post`                 | Blog posts/articles      | 10 sample posts          |
| `category`             | Post categories          | 4 categories             |
| `comment`              | Post comments            | Empty (users create)     |
| `tag`                  | Post tags                | 3 tags                   |
| `posttag`              | Post-tag relationship    | Auto-created             |
| `postversion`          | Post edit history        | Auto-created             |
| `newslettersubscriber` | Email subscribers        | Empty (users signup)     |
| `contactmessage`       | Contact form submissions | Empty (users submit)     |
| `ad`                   | Advertisement units      | Empty (create via admin) |
| `activitylog`          | User activity tracking   | Auto-created             |
| `sitesettings`         | Site configuration       | 1 default entry          |
| `sessionlog`           | Session tracking         | Auto-created             |
| `smsettings`           | SMTP email config        | Auto-created             |

**Total:** 13 tables automatically created ✅

---

## 👤 DEFAULT ADMIN USER

After seeding, you can login with:

```
Email:    admin@eatsmartdaily.com
Password: admin123
```

**⚠️ IMPORTANT:** Change this password immediately!

**Steps to change:**

1. Deploy app to production
2. Go to `https://yourdomain.com/admin/login`
3. Login with credentials above
4. Go to `/admin/users` or settings
5. Change password
6. Save

---

## 📊 SAMPLE DATA CREATED

### Admin User

```
Name: Admin
Email: admin@eatsmartdaily.com
Role: ADMIN
Password: admin123 (hashed with bcrypt)
```

### Categories

```
1. Healthy Eating (slug: healthy-eating)
2. Diet Tips (slug: diet-tips)
3. Recipes (slug: recipes)
4. Nutrition (slug: nutrition)
```

### Sample Posts (10 total)

```
1. "10 Superfoods You Should Eat Every Day"
2. "How to Start a Sustainable Diet"
3. "Top 5 Weight Loss Tips That Actually Work"
4. "The Complete Beginner's Guide to Meal Prep"
5. "Protein-Rich Foods for Vegetarians"
6. "Understanding Carbohydrates"
7. "Healthy Snack Ideas Under 100 Calories"
8. "How to Read Nutrition Labels"
9. "Water Fasting: Benefits and Risks"
10. "Best Foods for Gut Health"
```

All posts:

- ✅ Are PUBLISHED
- ✅ Have featured images
- ✅ Have rich content
- ✅ Have SEO metadata
- ✅ Are assigned to categories
- ✅ Some are marked as featured
- ✅ Some are marked to show in slider

---

## 🔄 FULL COMMANDS IN ONE BLOCK

Run these two commands in sequence:

```bash
# Create all tables
npx prisma migrate deploy

# Populate with data
npx prisma db seed

# (Optional) View data visually
npx prisma studio
```

**That's it!** Your production database is now fully set up! 🎉

---

## ⚠️ IMPORTANT NOTES

### If Seed Fails

If you get an error like "Admin already exists", it means:

- The seed partially ran before
- Run this to reset and try again:

```bash
# Delete all data (starts fresh)
npx prisma db push --force-reset

# Then seed again
npx prisma db seed
```

### If You Get "Migration Failed"

This means tables already exist. Run:

```bash
# Check what migrations exist
npx prisma migrate status

# Reset everything and start fresh
npx prisma migrate reset

# This will:
# - Drop all tables
# - Re-create schema
# - Run seed
# (All in one command!)
```

---

## 🧪 TESTING YOUR SETUP

After seeding, test these:

### 1. **Login to Admin**

```
URL: https://yourdomain.com/admin/login
Email: admin@eatsmartdaily.com
Password: admin123
Expected: ✅ Login successful, see dashboard
```

### 2. **View Blog Posts**

```
URL: https://yourdomain.com/blog
Expected: ✅ See 10 sample posts
```

### 3. **View Categories**

```
URL: https://yourdomain.com/category/recipes
Expected: ✅ See posts in that category
```

### 4. **Check Database Health**

```bash
npx prisma studio
# Or check Railway dashboard
Expected: ✅ All tables populated with data
```

---

## 🚀 AFTER SETUP

### Next Steps:

1. ✅ **Change admin password**
   - Go to `/admin/users`
   - Change password immediately

2. ✅ **Update site settings**
   - Go to `/admin/settings`
   - Update site name, description, contact email
   - Upload logos
   - Add social links

3. ✅ **Create more posts** (optional)
   - Go to `/admin/posts`
   - Create new posts
   - Or use sample posts to test features

4. ✅ **Configure email** (if using)
   - Add SMTP credentials to `.env.production`
   - Test by submitting contact form

5. ✅ **Configure analytics** (optional)
   - Add Google Analytics ID
   - Add Sentry DSN
   - Add other services

---

## 📞 TROUBLESHOOTING

### Issue: "Error: connect ECONNREFUSED"

**Cause:** Can't connect to Railway database

**Solutions:**

1. Verify DATABASE_URL in `.env` is correct
2. Check Railway MySQL service is running
3. Check IP whitelisting in Railway (allow all IPs)
4. Test connection:
   ```bash
   npx prisma db execute --stdin < /dev/null
   ```

### Issue: "Error: Table 'post' doesn't exist"

**Cause:** Migrations haven't been run

**Solution:**

```bash
npx prisma migrate deploy
```

### Issue: "Error: Duplicate entry for key 'admin@eatsmartdaily.com'"

**Cause:** Seed data already exists

**Solution:**

```bash
# Option 1: Just skip and continue (app works fine)
# Option 2: Reset database
npx prisma migrate reset
```

### Issue: "Error: Unique constraint failed"

**Cause:** Trying to seed duplicate data

**Solution:**

```bash
# Check existing data
npx prisma studio

# Reset and reseed
npx prisma migrate reset
```

---

## 📊 DATABASE MIGRATION HISTORY

Your app has these migrations:

1. **20260122114712_init** - Initial schema
2. **20260122123124_featured_post** - Featured posts feature
3. **20260122125520_featured_post** - Featured posts update
4. **20260124190427_add_comments_ads_settings** - Comments & ads
5. **20260127171544_add_performance_indexes** - Performance indexes
6. **20260128110856_add_email_smtp_settings** - Email SMTP config
7. **20260128112522_add_advanced_features** - Advanced features

All of these will be applied when you run `npx prisma migrate deploy` ✅

---

## ✅ FINAL CHECKLIST

```
☐ DATABASE_URL added to .env file
☐ Ran: npx prisma migrate deploy (create tables)
☐ Ran: npx prisma db seed (populate data)
☐ Verified data exists (via studio or Railway)
☐ Tested login (admin@eatsmartdaily.com / admin123)
☐ Changed admin password
☐ Viewed blog posts on frontend
☐ Updated site settings
☐ All working! 🎉
```

---

## 🎉 YOU'RE DONE!

Your production database is now:

- ✅ Created with all tables
- ✅ Populated with sample data
- ✅ Ready for users
- ✅ Ready for production traffic

**Next:** Deploy your app to production and start serving users! 🚀
