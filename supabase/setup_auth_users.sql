-- ============================================
-- SIMPLIFIED: Link Existing Staff to Auth Users
-- ============================================
-- You already have 6 staff members from seed.sql
-- Just need to create auth users and link them

-- ============================================
-- STEP 1: Check existing staff
-- ============================================
SELECT 
  staff_code,
  first_name || ' ' || last_name as name,
  email,
  role,
  CASE 
    WHEN auth_user_id IS NOT NULL THEN '✅ Already linked'
    ELSE '❌ Need auth user'
  END as status
FROM staff
WHERE deleted_at IS NULL
ORDER BY staff_code;

-- Expected output:
-- STF-0001 | Admin User | admin@ezstorage.sg | admin
-- STF-0002 | Operations Manager | ops@ezstorage.sg | operations_manager
-- STF-0003 | Warehouse Lead | warehouse1@ezstorage.sg | warehouse_staff
-- STF-0004 | Driver One | driver1@ezstorage.sg | driver
-- STF-0005 | Driver Two | driver2@ezstorage.sg | driver
-- STF-0006 | Finance Staff | accounts@ezstorage.sg | accountant

-- ============================================
-- STEP 2: Create Auth Users in Supabase
-- ============================================
-- Go to: https://supabase.com/dashboard/project/bipwsfegdkkjrsinfcjz/auth/users
-- Click "Add user" → "Create new user" for each:

-- 1. admin@ezstorage.sg
--    Password: Admin@123 (your choice)
--    ✅ Auto Confirm User
--    Copy UUID after creation!

-- 2. ops@ezstorage.sg
--    Password: Ops@123
--    ✅ Auto Confirm User
--    Copy UUID!

-- 3. warehouse1@ezstorage.sg (note: warehouse1, not warehouse)
--    Password: Warehouse@123
--    ✅ Auto Confirm User
--    Copy UUID!

-- 4. driver1@ezstorage.sg
--    Password: Driver@123
--    ✅ Auto Confirm User
--    Copy UUID!

-- 5. accounts@ezstorage.sg
--    Password: Accounts@123
--    ✅ Auto Confirm User
--    Copy UUID!

-- Note: We only need 5 auth users since we'll use driver1 for testing
-- driver2 can be added later if needed

-- ============================================
-- STEP 3: Link Auth UUIDs to Staff
-- ============================================
-- Replace UUIDs below with actual ones from Supabase Auth panel

BEGIN;

-- Link admin
UPDATE staff 
SET auth_user_id = 'PASTE_ADMIN_UUID_HERE'
WHERE email = 'admin@ezstorage.sg';

-- Link operations manager
UPDATE staff 
SET auth_user_id = 'PASTE_OPS_UUID_HERE'
WHERE email = 'ops@ezstorage.sg';

-- Link warehouse staff
UPDATE staff 
SET auth_user_id = 'PASTE_WAREHOUSE_UUID_HERE'
WHERE email = 'warehouse1@ezstorage.sg';

-- Link driver
UPDATE staff 
SET auth_user_id = 'PASTE_DRIVER_UUID_HERE'
WHERE email = 'driver1@ezstorage.sg';

-- Link accountant
UPDATE staff 
SET auth_user_id = 'PASTE_ACCOUNTANT_UUID_HERE'
WHERE email = 'accounts@ezstorage.sg';

COMMIT;

-- ============================================
-- STEP 4: Verify All Linked
-- ============================================
SELECT 
  staff_code,
  email,
  role,
  CASE 
    WHEN auth_user_id IS NOT NULL THEN '✅ Linked'
    ELSE '❌ Not Linked'
  END as status,
  auth_user_id
FROM staff
WHERE email IN (
  'admin@ezstorage.sg',
  'ops@ezstorage.sg',
  'warehouse1@ezstorage.sg',
  'driver1@ezstorage.sg',
  'accounts@ezstorage.sg'
)
ORDER BY staff_code;

-- All 5 should show ✅ Linked
