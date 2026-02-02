# ⚡ QUICK COMMAND REFERENCE - DATABASE SETUP

**Copy and paste these commands into your terminal**

---

## 🚀 THE TWO COMMANDS YOU NEED

### Command 1: Create All Tables

```bash
npx prisma migrate deploy
```

**What it does:** Creates all 13 tables in your fresh Railway database  
**Time:** ~30 seconds  
**Run:** Once

---

### Command 2: Populate With Data

```bash
npx prisma db seed
```

**What it does:** Adds sample data (admin user, posts, categories, etc.)  
**Time:** ~10 seconds  
**Run:** Once (only on fresh database)

---

## ✅ THAT'S IT!

Those two commands will:

1. ✅ Create all database tables
2. ✅ Set up all relationships
3. ✅ Create indexes
4. ✅ Add admin user
5. ✅ Add 10 sample posts
6. ✅ Add 4 categories
7. ✅ Add site settings
8. ✅ Ready for production!

---

## 📋 OPTIONAL: Verify Data

```bash
# Visual database browser
npx prisma studio
```

Opens at `http://localhost:5555` to see all your data

---

## 🔄 IF YOU NEED TO START OVER

```bash
# This resets everything and re-seeds (fresh start)
npx prisma migrate reset
```

---

## 📝 IMPORTANT NOTES

✅ Your `.env` file already has the correct `DATABASE_URL`  
✅ No code changes needed  
✅ All 13 tables created automatically  
✅ Sample data included  
✅ Admin user: `admin@eatsmartdaily.com` / `admin123`

---

## 🎯 STEP-BY-STEP EXECUTION

1. Open terminal in your project folder
2. Run: `npx prisma migrate deploy`
3. Wait for completion
4. Run: `npx prisma db seed`
5. Wait for completion
6. Done! ✅

**Total time:** 5 minutes

---

**That's all you need to know!** 🚀
