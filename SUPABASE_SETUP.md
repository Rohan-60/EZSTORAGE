# 🚀 EZSTORAGE - Supabase Database Setup Guide

## ✅ Step 1: Credentials Configured

Your `.env.local` file has been created with your Supabase credentials. ✓

## 📊 Step 2: Create Database Tables

Now you need to execute the SQL files in your Supabase dashboard to create all the tables.

### 2.1 Execute Main Schema (Required)

1. **Open Supabase SQL Editor**  
   Click here: [Open SQL Editor](https://supabase.com/dashboard/project/xoptdmugsgcmrhemsxed/sql)

2. **Create a New Query**  
   - Click the **"+ New query"** button (usually top right)
   - Give it a name like "Create EZSTORAGE Schema"

3. **Copy and Paste Schema**  
   - Open the file: `D:\react project\EZSTORAGE\supabase\schema.sql`
   - Copy **ALL** the content (664 lines)
   - Paste it into the SQL editor

4. **Run the Query**  
   - Click the **"Run"** button (or press F5)
   - Wait for execution to complete (~5-10 seconds)
   - You should see: "Success. No rows returned"

**What this creates:**
- ✅ 8 tables (customers, warehouses, storage_units, staff, orders, inventory_items, payments, audit_logs)
- ✅ 5 enums (status types)
- ✅ 20+ indexes for performance
- ✅ Triggers for auto-codes and timestamps
- ✅ Functions for business logic

---

### 2.2 Add Security Policies (Required)

1. **Create Another New Query**  
   - Click **"+ New query"** again
   - Name it "RLS Policies"

2. **Copy and Paste RLS Policies**  
   - Open: `D:\react project\EZSTORAGE\supabase\rls_policies.sql`
   - Copy **ALL** the content
   - Paste it into the SQL editor

3. **Run the Query**  
   - Click **"Run"**
   - Wait for completion

**What this creates:**
- ✅ Row Level Security policies for all 8 tables
- ✅ Role-based access control
- ✅ Helper functions (is_admin, is_operations_manager, etc.)

---

### 2.3 Add Demo Data (Optional)

If you want to test with sample data:

1. **Create Another New Query**  
   - Click **"+ New query"**
   - Name it "Seed Data"

2. **Copy and Paste Seed Data**  
   - Open: `D:\react project\EZSTORAGE\supabase\seed.sql`
   - Copy **ALL** the content
   - Paste it into SQL editor

3. **Run the Query**  
   - Click **"Run"**

**What this creates:**
- ✅ 5 sample customers
- ✅ 3 warehouses
- ✅ 24 storage units
- ✅ 5 staff members
- ✅ Sample orders and payments

---

## 🧪 Step 3: Verify Tables

After running the schema, verify tables were created:

1. In Supabase, go to **Table Editor** (left sidebar)
2. You should see all 8 tables:
   - customers
   - warehouses
   - storage_units
   - staff
   - orders
   - inventory_items
   - payments
   - audit_logs

---

## 🔐 Step 4: Create Auth Users (If Using Seed Data)

If you ran the seed data, create these users in Supabase Auth:

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Create these accounts:

| Email | Password (choose any) | Role |
|-------|---------------------|------|
| admin@ezstorage.sg | YourPassword123 | Admin |
| ops@ezstorage.sg | YourPassword123 | Operations |
| driver1@ezstorage.sg | YourPassword123 | Driver |
| warehouse1@ezstorage.sg | YourPassword123 | Warehouse |
| accounts@ezstorage.sg | YourPassword123 | Accounts |

4. After creating users, link them to staff records by running this SQL:

```sql
-- Link auth users to staff records
UPDATE staff 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = staff.email);
```

---

## ✅ Step 5: Test Connection

The dev server will automatically pick up the new `.env.local` file.

**Restart the dev server:**

1. In your terminal, press **Ctrl+C** to stop the server
2. Run: `npm run dev`
3. Open: http://localhost:3000

Your app should now be connected to Supabase! 🎉

---

## 🔧 Troubleshooting

### Error: "relation does not exist"
- You didn't run `schema.sql` successfully
- Go back to Step 2.1 and try again

### Error: "policies don't allow access"
- You didn't run `rls_policies.sql`
- Go back to Step 2.2

### Can't see any data
- Make sure you ran `seed.sql` (Step 2.3)
- Or start creating data manually through your app

---

## 📝 Quick Links

- **Your Supabase Project**: https://supabase.com/dashboard/project/xoptdmugsgcmrhemsxed
- **SQL Editor**: https://supabase.com/dashboard/project/xoptdmugsgcmrhemsxed/sql
- **Table Editor**: https://supabase.com/dashboard/project/xoptdmugsgcmrhemsxed/editor
- **Authentication**: https://supabase.com/dashboard/project/xoptdmugsgcmrhemsxed/auth/users

---

**Ready?** Start with Step 2.1 and execute the schema! 🚀
