#!/bin/bash
# Database Setup Script for EatSmartDaily
# This script will automatically set up your production database
# Works on: Mac, Linux, WSL

echo "=========================================="
echo "🚀 EatSmartDaily Database Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from your project root directory"
    exit 1
fi

echo "✅ Found package.json"
echo ""

# Step 1: Create database schema
echo "=========================================="
echo "Step 1: Creating database tables..."
echo "=========================================="
echo ""

npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error: Migration failed!"
    exit 1
fi

echo ""
echo "✅ Database tables created successfully!"
echo ""

# Step 2: Seed database with data
echo "=========================================="
echo "Step 2: Populating database with data..."
echo "=========================================="
echo ""

npx prisma db seed

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error: Seeding failed!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ DATABASE SETUP COMPLETE!"
echo "=========================================="
echo ""
echo "📊 Your database now has:"
echo "   ✅ 13 tables created"
echo "   ✅ 1 admin user (admin@eatsmartdaily.com / admin123)"
echo "   ✅ 10 sample blog posts"
echo "   ✅ 4 categories"
echo "   ✅ Site settings configured"
echo ""
echo "🔐 Next steps:"
echo "   1. Deploy your app to production"
echo "   2. Login with admin@eatsmartdaily.com / admin123"
echo "   3. Change the admin password immediately!"
echo "   4. Update site settings"
echo ""
echo "🔍 To view your database:"
echo "   npx prisma studio"
echo ""
echo "=========================================="
