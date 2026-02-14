# 🔐 AUTHENTICATION SETUP GUIDE

## ⚠️ IMPORTANT: You Need to Create Auth Users

Your staff records exist in the database, but **authentication users don't exist yet**.

---

## 📋 Quick Setup Steps

### Step 1: Open Supabase Dashboard
1. Go to: https://xoptdmugsgcmrhemsxed.supabase.co/project/xoptdmugsgcmrhemsxed/auth/users
2. Click the green **"Add user"** button

### Step 2: Create These 5 Users

For **EACH** user below, click "Add user" and fill in:

#### User 1: Admin
- ✅ **Create user** tab
- Email address: `admin@test.com`
- Password: `Admin123!`
- ✅ **Check**: "Auto Confirm User" 
- Click "Create user"

#### User 2: Operations Manager
- Email address: `ops@test.com`
- Password: `Ops123!`
- ✅ **Check**: "Auto Confirm User"
- Click "Create user"

#### User 3: Warehouse Staff
- Email address: `warehouse@test.com`
- Password: `Warehouse123!`
- ✅ **Check**: "Auto Confirm User"
- Click "Create user"

#### User 4: Driver
- Email address: `driver@test.com`
- Password: `Driver123!`
- ✅ **Check**: "Auto Confirm User"
- Click "Create user"

#### User 5: Accountant
- Email address: `accountant@test.com`
- Password: `Accountant123!`
- ✅ **Check**: "Auto Confirm User"
- Click "Create user"

---

### Step 3: Link Auth Users to Staff Records

After creating all 5 users:
1. Go to Supabase Dashboard → SQL Editor
2. Open and run: `supabase/link_auth_users.sql`
3. You should see "✅ Linked" for all users

---

### Step 4: Enable Development RLS Policies

Run this SQL file in Supabase SQL Editor:
- `supabase/rls_development_mode.sql`

This allows full access during development.

---

### Step 5: Test Login!

Now you can login to your app at: http://localhost:3001/login

Use any of these credentials:
- `admin@test.com` / `Admin123!`
- `ops@test.com` / `Ops123!`
- `warehouse@test.com` / `Warehouse123!`
- `driver@test.com` / `Driver123!`
- `accountant@test.com` / `Accountant123!`

---

## 🎯 Quick Video Guide

1. Dashboard → Authentication → Users
2. Click "Add user" button (top right)
3. Select "Create user" tab
4. Enter email and password
5. ✅ Check "Auto Confirm User"
6. Click "Create user"
7. Repeat 5 times!

---

## ✅ Verification

Run this to verify everything is set up:
```bash
npm run test:login
```

You should see:
```
✅ Authentication successful
✅ Staff info fetched
✅ Signed out successfully
```

---

## 🐛 Troubleshooting

### "Invalid login credentials"
→ Auth users not created yet. Follow Step 1-2 above.

### "Failed to fetch staff info"
→ Auth users not linked. Run `link_auth_users.sql` (Step 3).

### "RLS policy violation"
→ Run `rls_development_mode.sql` (Step 4).

### "Email already registered"
→ Good! This user already exists. Skip to next user.

---

## 📝 Why These Steps?

1. **Staff table** = Your employee records (already created ✅)
2. **Auth users** = Login credentials (you need to create these ❌)
3. **Link** = Connect staff records to auth users
4. **RLS policies** = Allow development access

Your staff records exist but can't login without auth users!
