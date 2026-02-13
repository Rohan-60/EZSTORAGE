-- Quick link auth users to staff after creating them in Supabase Auth
-- Run this AFTER you create users in Authentication -> Users

-- This will automatically link all auth users to their corresponding staff records
UPDATE staff 
SET auth_user_id = (
  SELECT id 
  FROM auth.users 
  WHERE auth.users.email = staff.email
)
WHERE auth_user_id IS NULL;

-- Verify the linking worked
SELECT 
  s.staff_code,
  s.first_name,
  s.last_name,
  s.email,
  s.role,
  s.auth_user_id,
  CASE 
    WHEN s.auth_user_id IS NOT NULL THEN '✅ Linked'
    ELSE '❌ Not Linked'
  END as status
FROM staff s
ORDER BY s.role;
