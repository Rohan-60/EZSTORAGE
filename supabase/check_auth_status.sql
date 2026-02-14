-- ============================================
-- CHECK AUTH SETUP
-- ============================================
-- Run this in Supabase SQL Editor to diagnose auth issues

-- Step 1: Check staff records
SELECT 
  staff_code,
  email,
  role,
  CASE 
    WHEN auth_user_id IS NULL THEN '❌ NO AUTH USER'
    ELSE '✅ Linked: ' || auth_user_id
  END as auth_status
FROM staff
WHERE is_active = true AND deleted_at IS NULL
ORDER BY staff_code;

-- Step 2: Check if any auth users exist (join with auth.users)
-- Note: This requires querying auth.users which may need special permissions
-- If this fails, check manually in Authentication > Users panel

SELECT 
  s.email as staff_email,
  s.role,
  au.email as auth_email,
  au.created_at,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ User exists in Auth'
    ELSE '❌ No auth user created'
  END as status
FROM staff s
LEFT JOIN auth.users au ON s.auth_user_id = au.id
WHERE s.is_active = true AND s.deleted_at IS NULL
ORDER BY s.staff_code;

-- Step 3: Show quick summary
SELECT 
  COUNT(*) FILTER (WHERE auth_user_id IS NOT NULL) as linked_staff,
  COUNT(*) FILTER (WHERE auth_user_id IS NULL) as unlinked_staff,
  COUNT(*) as total_active_staff
FROM staff
WHERE is_active = true AND deleted_at IS NULL;
