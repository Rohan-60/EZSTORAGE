-- ============================================
-- LINK AUTH USERS TO STAFF RECORDS
-- ============================================
-- Run this in Supabase SQL Editor AFTER creating auth users
-- This connects your auth users to staff records
-- ============================================

-- Link all auth users to their corresponding staff records
UPDATE staff 
SET auth_user_id = (
  SELECT id 
  FROM auth.users 
  WHERE auth.users.email = staff.email
)
WHERE email IN (
  'admin@test.com',
  'ops@test.com',
  'warehouse@test.com',
  'driver@test.com',
  'accountant@test.com'
);

-- Verify the linking worked
SELECT 
  s.staff_code,
  s.first_name || ' ' || s.last_name as name,
  s.email,
  s.role,
  s.auth_user_id,
  CASE 
    WHEN s.auth_user_id IS NOT NULL THEN '✅ Linked'
    ELSE '❌ Not Linked'
  END as status
FROM staff s
WHERE s.email IN (
  'admin@test.com',
  'ops@test.com',
  'warehouse@test.com',
  'driver@test.com',
  'accountant@test.com'
)
ORDER BY s.staff_code;

-- Show result message
SELECT '
✅ Auth users linked successfully!

Now you can login with:
  • admin@test.com / Admin123!
  • ops@test.com / Ops123!
  • warehouse@test.com / Warehouse123!
  • driver@test.com / Driver123!
  • accountant@test.com / Accountant123!

Go to: http://localhost:3001/login
' as message;
