# 🚀 Database Setup - Quick Start Guide

**IMPORTANT**: Follow these steps in order to get your database properly connected.

## ✅ What's Already Done

Your environment is properly configured:
- ✓ Supabase credentials in `.env.local`
- ✓ Supabase client configured in `lib/supabase/client.ts`
- ✓ Dev server running on `http://localhost:3000`
- ✓ Database schema files ready to execute

## 📋 What You Need To Do

### Step 1: Execute Database Schema (Required)

1. **Open Supabase SQL Editor**  
   Click: [https://supabase.com/dashboard/project/xoptdmugsgcmrhemsxed/sql](https://supabase.com/dashboard/project/xoptdmugsgcmrhemsxed/sql)

2. **Create New Query**
   - Click "+ New query" button

3. **Copy and Run Schema**
   - Open file: `d:\react project\EZSTORAGE\supabase\schema.sql`
   - Copy **all 664 lines**
   - Paste into SQL editor  
   - Click **"Run"** button
   - **Expected result**: "Success. No rows returned" (takes ~10 seconds)

✅ This creates 8 tables: `customers`, `warehouses`, `storage_units`, `staff`, `orders`, `inventory_items`, `payments`, `audit_logs`

---

### Step 2: Add Security Policies (Required)

1. **Create Another New Query**
   - Click "+ New query" again

2. **Copy and Run RLS Policies**
   - Open file: `d:\react project\EZSTORAGE\supabase\rls_policies.sql`
   - Copy **all 334 lines**
   - Paste into SQL editor
   - Click **"Run"**
   - **Expected result**: "Success. No rows returned"

✅ This enables Row Level Security and role-based access control

---

### Step 3: Add Demo Data (Optional but Recommended)

1. **Create Another New Query**

2. **Copy and Run Seed Data**
   - Open file: `d:\react project\EZSTORAGE\supabase\seed.sql`
   - Copy **all 362 lines**
   - Paste into SQL editor
   - Click **"Run"**

✅ This creates sample customers, warehouses, storage units, staff, orders, and payments for testing

---

### Step 4: Create Auth Users (If You Ran Seed Data)

If you executed the seed data, create these user accounts:

1. **Go to Authentication**  
   Click: [https://supabase.com/dashboard/project/xoptdmugsgcmrhemsxed/auth/users](https://supabase.com/dashboard/project/xoptdmugsgcmrhemsxed/auth/users)

2. **Click "Add user" → "Create new user"**

3. **Create These Users** (use any password you want):

| Email | Password | Role |
|-------|----------|------|
| admin@ezstorage.sg | (choose any) | Admin |
| ops@ezstorage.sg | (choose any) | Operations |
| driver1@ezstorage.sg | (choose any) | Driver |
| warehouse1@ezstorage.sg | (choose any) | Warehouse |
| accounts@ezstorage.sg | (choose any) | Accountant |

4. **Link Auth Users to Staff Records**
   - Go back to SQL Editor
   - Open file: `d:\react project\EZSTORAGE\supabase\link_auth_users.sql`
   - Copy and run it
   - **Expected result**: Shows all staff with "✅ Linked" status

---

### Step 5: Test Your Connection

Run this command in your terminal:

```powershell
cd "d:\react project\EZSTORAGE"
npx tsx scripts/test_connection.ts
```

**Expected output:**
```
✅ Environment variables loaded
✅ Supabase client created
✅ Database connection successful
✅ Table "customers" - 5 rows
✅ Table "warehouses" - 3 rows
✅ Table "staff" - 6 rows
... (and more)
```

If you see errors:
- ❌ "Table does not exist" → Go back to Step 1
- ❌ "RLS policies" errors → Go back to Step 2
- ⚠️ "Not Linked" status → Go back to Step 4

---

## 🎉 All Done!

Your database is now properly connected. You can:

1. **Test the app**: Open http://localhost:3000
2. **Login** with one of the auth users you created
3. **View data** in your dashboards

---

## 🔧 Troubleshooting

**"relation does not exist" error**
- You didn't run schema.sql
- Go to Step 1

**"new row violates row-level security policy" error**
- You didn't run rls_policies.sql (Step 2)
- OR you're not logged in as a user with auth_user_id linked to staff

**Can't see any data**
- Run seed.sql (Step 3) to add demo data
- OR start creating data through your app

**Can't login**
- Make sure you created auth users (Step 4)
- Make sure you ran link_auth_users.sql

---

## 📁 File Reference

All database files are in: `d:\react project\EZSTORAGE\supabase\`

- `schema.sql` - Database tables (Step 1)
- `rls_policies.sql` - Security policies (Step 2)
- `seed.sql` - Demo data (Step 3)
- `link_auth_users.sql` - Auth linking (Step 4)
- `verify_setup.sql` - Status check queries

Test script: `d:\react project\EZSTORAGE\scripts\test_connection.ts`

---

**Need Help?** The test script will tell you exactly what's missing!
