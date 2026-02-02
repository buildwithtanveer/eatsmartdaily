# 🤖 AUTOMATED DATABASE SETUP - DO IT FOR YOU!

I've created **automated scripts** that will do everything for you!

---

## 🎯 CHOOSE YOUR SYSTEM

### 🪟 **Windows Users:**

**Double-click this file:**

```
setup-db.bat
```

Or run in PowerShell:

```powershell
.\setup-db.bat
```

---

### 🍎 **Mac/Linux Users:**

Run this in terminal:

```bash
chmod +x setup-db.sh
./setup-db.sh
```

Or:

```bash
bash setup-db.sh
```

---

## ⚡ WHAT THE SCRIPT DOES

When you run it, it will **automatically**:

```
✅ Check if you're in the right folder
✅ Run: npx prisma migrate deploy (create tables)
✅ Run: npx prisma db seed (add sample data)
✅ Show you the results
✅ Tell you what was created
✅ Give you next steps
```

**Time:** ~5 minutes (fully automated!)

---

## 📋 STEP BY STEP

### **Windows (Easiest):**

1. Open File Explorer
2. Navigate to your project folder
3. Find `setup-db.bat`
4. **Double-click it** ✨
5. Watch the magic happen!
6. Press Enter when done

### **Mac/Linux:**

1. Open Terminal
2. Navigate to your project folder:
   ```bash
   cd /path/to/eatsmartdaily
   ```
3. Run the script:
   ```bash
   bash setup-db.sh
   ```
4. Watch the magic happen!

---

## ✅ WHAT YOU'LL SEE

The script will output something like this:

```
==========================================
  EatSmartDaily Database Setup
==========================================

✅ Found package.json

==========================================
Step 1: Creating database tables...
==========================================

✔ Datasource verified
✔ Migrations to apply: 7
✔ All migrations applied successfully

✅ Database tables created successfully!

==========================================
Step 2: Populating database with data...
==========================================

✅ Admin user ensured
✅ Categories created
✅ Tags created
✅ Posts created
✅ Site settings created

==========================================
✅ DATABASE SETUP COMPLETE!
==========================================

📊 Your database now has:
   ✅ 13 tables created
   ✅ 1 admin user (admin@eatsmartdaily.com / admin123)
   ✅ 10 sample blog posts
   ✅ 4 categories
   ✅ Site settings configured

🔐 Next steps:
   1. Deploy your app to production
   2. Login with admin@eatsmartdaily.com / admin123
   3. Change the admin password immediately!
   4. Update site settings

🔍 To view your database:
   npx prisma studio
```

---

## 🎉 AFTER THE SCRIPT FINISHES

Your database will be **completely ready** with:

✅ **13 Tables Created:**

- user, post, category, tag, comment
- contactmessage, newslettersubscriber, ad
- postversion, activitylog, sitesettings
- sessionlog, smsettings

✅ **Admin User Ready:**

- Email: `admin@eatsmartdaily.com`
- Password: `admin123`

✅ **Sample Data Populated:**

- 10 blog posts
- 4 categories
- 3 tags
- Site settings

✅ **Ready for Production!**

---

## ⚠️ REQUIREMENTS

Before running the script, make sure you have:

```
✅ Node.js installed (npm must work)
✅ .env file with DATABASE_URL set
✅ DATABASE_URL points to Railway MySQL
✅ You can access the Railway MySQL
✅ You're in your project folder (where package.json is)
```

Check with:

```bash
# Should show version number
node --version
npm --version

# Should show your database URL
cat .env | grep DATABASE_URL
```

---

## 🆘 IF SCRIPT FAILS

### Error: "package.json not found"

```
❌ Problem: You're not in the project folder
✅ Solution: Open Terminal/PowerShell in your project folder
           (Right-click folder → Open in Terminal)
```

### Error: "Database connection refused"

```
❌ Problem: DATABASE_URL is wrong or Railway is down
✅ Solution: Check .env file has correct DATABASE_URL
           Check Railway dashboard if service is running
```

### Error: "Table already exists"

```
❌ Problem: Migrations already partially ran
✅ Solution: This is OK, just continue
           Script handles this automatically
```

### Error: "npm command not found"

```
❌ Problem: Node.js/npm not installed
✅ Solution: Install Node.js from nodejs.org
           Restart Terminal
           Try script again
```

---

## 📊 SCRIPT CONTENTS (What's Inside)

### Windows Script (`setup-db.bat`):

- Checks for package.json
- Runs `npx prisma migrate deploy`
- Runs `npx prisma db seed`
- Shows results
- Waits for you to press Enter

### Mac/Linux Script (`setup-db.sh`):

- Same as Windows version
- Uses bash syntax
- Handles errors gracefully

---

## 🚀 MANUAL ALTERNATIVE

If scripts don't work, run these commands manually:

```bash
# Command 1
npx prisma migrate deploy

# Wait for completion, then Command 2
npx prisma db seed
```

---

## ✨ IT'S THAT SIMPLE!

Just run the script for your system, and you're done! 🎉

---

## 📞 QUICK REFERENCE

| Action               | Command                     |
| -------------------- | --------------------------- |
| **Run on Windows**   | Double-click `setup-db.bat` |
| **Run on Mac/Linux** | `bash setup-db.sh`          |
| **Manual Way**       | See above                   |
| **View Database**    | `npx prisma studio`         |
| **Check Status**     | `npx prisma migrate status` |

---

## 🎯 YOU'RE ALL SET!

- ✅ Scripts created and ready
- ✅ Just run the right one for your OS
- ✅ Sit back and watch
- ✅ Database will be fully populated
- ✅ You'll be ready for production!

**That's it!** Run the script now! 🚀
