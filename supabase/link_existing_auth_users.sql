-- ============================================
-- OPTION 1: Update Staff Emails to Match Auth Users
-- ============================================
-- This is EASIER since you already have auth users created
-- Just update the staff emails to match your auth users

BEGIN;

-- Update staff emails to match auth users
UPDATE staff SET email = 'admin@test.com' WHERE staff_code = 'STF-0001';
UPDATE staff SET email = 'ops@test.com' WHERE staff_code = 'STF-0002';
UPDATE staff SET email = 'warehouse@test.com' WHERE staff_code = 'STF-0003';
UPDATE staff SET email = 'driver@test.com' WHERE staff_code = 'STF-0004';
UPDATE staff SET email = 'accountant@test.com' WHERE staff_code = 'STF-0006';

COMMIT;

-- Verify the update
SELECT 
  staff_code,
  email,
  role
FROM staff
WHERE staff_code IN ('STF-0001', 'STF-0002', 'STF-0003', 'STF-0004', 'STF-0006')
ORDER BY staff_code;

-- ============================================
-- Now Link Auth Users to Staff
-- ============================================
-- Copy the UUIDs from your Supabase Auth panel and paste below

BEGIN;

-- From your screenshot:
-- admin@test.com: 62ad3f31-9cd4-4164-a645-d0d66e0be6f9
UPDATE staff 
SET auth_user_id = '62ad3f31-9cd4-4164-a645-d0d66e0be6f9'
WHERE email = 'admin@test.com';

-- ops@test.com: 73fa6d98-4a79-4dd0-b0c3-53bb338eabce
UPDATE staff 
SET auth_user_id = '73fa6d98-4a79-4dd0-b0c3-53bb338eabce'
WHERE email = 'ops@test.com';

-- warehouse@test.com: ca040a4c-3c44-4a6a-a0b4-b4666ce86b4b
UPDATE staff 
SET auth_user_id = 'ca040a4c-3c44-4a6a-a0b4-b4666ce86b4b'
WHERE email = 'warehouse@test.com';

-- driver@test.com: 99a92004-4f9c-444e-b44d-fbd41ba46e16
UPDATE staff 
SET auth_user_id = '99a92004-4f9c-444e-b44d-fbd41ba46e16'
WHERE email = 'driver@test.com';

-- accountant@test.com: 96c8dc1f1-da9d-4d6f-a816-afe9a23cd1a1
UPDATE staff 
SET auth_user_id = '96c8dc1f1-da9d-4d6f-a816-afe9a23cd1a1'
WHERE email = 'accountant@test.com';

COMMIT;

-- ============================================
-- Verify Everything is Linked
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
  'admin@test.com',
  'ops@test.com',
  'warehouse@test.com',
  'driver@test.com',
  'accountant@test.com'
)
ORDER BY staff_code;

-- All 5 should show ✅ Linked
