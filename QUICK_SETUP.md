# 🚀 QUICK SETUP GUIDE - Simplified for Testing

Follow these steps to get your database working with a simple login (NO email verification needed).

---

## Step 1: Disable Email Verification in Supabase

**IMPORTANT**: Do this FIRST before creating any users!

1. Go to: [https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz/auth/url-configuration](https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz/auth/url-configuration)

2. Scroll down to **"Email Auth"** section

3. **DISABLE** these options:
   - ✅ Turn OFF "Enable email confirmations"
   - ✅ Turn OFF "Enable email change confirmations"
   - ✅ Turn OFF "Secure email change"

4. Click **Save**

✅ Now you can login without verifying emails!

---

## Step 2: Create Database Tables

1. Open Supabase SQL Editor: [https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz/sql](https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz/sql)

2. Click "+ New query"

3. Copy ALL content from: `d:\react project\EZSTORAGE\supabase\schema.sql`

4. Paste and click **Run**

✅ Creates your database tables

---

## Step 3: Add Security Policies

1. Create another new query

2. Copy ALL content from: `d:\react project\EZSTORAGE\supabase\rls_policies.sql`

3. Paste and click **Run**

✅ Enables security

---

## Step 4: Add Minimal Test Data

**SIMPLIFIED**: Only creates 1 admin + 1 warehouse + 3 storage units

1. Create another new query

2. Copy ALL content from: `d:\react project\EZSTORAGE\supabase\seed_minimal.sql`  
   *(Note: This is the MINIMAL version, not the full seed.sql)*

3. Paste and click **Run**

✅ Creates minimal test data

---

## Step 5: Create ONE Test User

1. Go to Authentication → Users: [https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz/auth/users](https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz/auth/users)

2. Click "Add user" → "Create new user"

3. Enter:
   - **Email**: `admin@test.com`
   - **Password**: `test123` (or any password you want)
   - **Auto Confirm User**: ✅ **Turn this ON** (important!)

4. Click "Create user"

✅ Your test user is created!

---

## Step 6: Link Auth User to Staff

1. Go back to SQL Editor

2. Copy and run: `d:\react project\EZSTORAGE\supabase\link_auth_users.sql`

✅ Links the auth user to the admin staff record

---

## Step 7: Test Login

1. Open: http://localhost:3000

2. Click "Sign In to Dashboard"

3. Login with:
   - **Email**: `admin@test.com`
   - **Password**: (whatever you set in Step 5)

✅ You should see the admin dashboard!

---

## What You Get

**Minimal setup**:
- ✅ 1 warehouse (Test Warehouse)
- ✅ 1 admin user (admin@test.com)
- ✅ 3 storage units (Small, Medium, Large)
- ✅ No email verification required
- ✅ Simple login

**That's it!** No complicated data to understand.

---

## Troubleshooting

**Can't login / "Invalid credentials"**
- Make sure you created the user in Step 5
- Make sure you ran link_auth_users.sql in Step 6
- Check email/password are correct

**"Email must be confirmed"**
- You didn't disable email confirmation in Step 1
- OR you didn't check "Auto Confirm User" when creating the user

**"Table does not exist" errors**
- You didn't run schema.sql in Step 2

---

## Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz
- **SQL Editor**: https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz/sql
- **Users**: https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz/auth/users
- **Email Settings**: https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz/auth/url-configuration
- **Your App**: http://localhost:3000
