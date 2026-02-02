@echo off
REM Database Setup Script for EatSmartDaily (Windows)
REM This script will automatically set up your production database
REM Works on: Windows

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo.  EatSmartDaily Database Setup
echo ==========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo.
    echo ❌ Error: package.json not found!
    echo Please run this script from your project root directory
    echo.
    pause
    exit /b 1
)

echo ✅ Found package.json
echo.

REM Step 1: Create database schema
echo ==========================================
echo Step 1: Creating database tables...
echo ==========================================
echo.

call npx prisma migrate deploy

if errorlevel 1 (
    echo.
    echo ❌ Error: Migration failed!
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Database tables created successfully!
echo.

REM Step 2: Seed database with data
echo ==========================================
echo Step 2: Populating database with data...
echo ==========================================
echo.

call npx prisma db seed

if errorlevel 1 (
    echo.
    echo ❌ Error: Seeding failed!
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo ✅ DATABASE SETUP COMPLETE!
echo ==========================================
echo.
echo 📊 Your database now has:
echo    ✅ 13 tables created
echo    ✅ 1 admin user (admin@eatsmartdaily.com / admin123)
echo    ✅ 10 sample blog posts
echo    ✅ 4 categories
echo    ✅ Site settings configured
echo.
echo 🔐 Next steps:
echo    1. Deploy your app to production
echo    2. Login with admin@eatsmartdaily.com / admin123
echo    3. Change the admin password immediately!
echo    4. Update site settings
echo.
echo 🔍 To view your database:
echo    npx prisma studio
echo.
echo ==========================================
echo.

pause
