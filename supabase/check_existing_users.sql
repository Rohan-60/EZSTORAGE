-- ============================================
-- VERIFY EXISTING AUTH USERS & STAFF
-- ============================================
-- Run this in Supabase SQL Editor to check current state

-- ============================================
-- 1. CHECK ALL STAFF RECORDS
-- ============================================
SELECT 
  '=== STAFF RECORDS ===' as section,
  '' as staff_code,
  '' as name,
  '' as email,
  '' as role,
  '' as auth_status;

SELECT 
  '' as section,
  staff_code,
  first_name || ' ' || last_name as name,
  email,
  role,
  CASE 
    WHEN auth_user_id IS NOT NULL THEN '✅ Has Auth User'
    ELSE '❌ No Auth User'
  END as auth_status,
  auth_user_id,
  is_active
FROM staff
WHERE deleted_at IS NULL
ORDER BY role, first_name;

-- ============================================
-- 2. CHECK FOR EXISTING AUTH USERS
-- ============================================
-- Note: We can't directly query auth.users from SQL Editor
-- but we can see which staff have auth_user_id set

SELECT 
  '=== AUTH USER MAPPING ===' as section,
  '' as role,
  '' as count;

SELECT 
  '' as section,
  role,
  COUNT(*) as count,
  COUNT(auth_user_id) as linked_count,
  COUNT(*) - COUNT(auth_user_id) as unlinked_count
FROM staff
WHERE deleted_at IS NULL
GROUP BY role
ORDER BY role;

-- ============================================
-- 3. CHECK WHICH ROLES ARE ALREADY LINKED
-- ============================================
SELECT 
  '=== ROLES WITH AUTH ===' as info;

SELECT 
  role,
  email,
  CASE 
    WHEN auth_user_id IS NOT NULL THEN '✅ Ready to use'
    ELSE '⚠️ Need to create auth user'
  END as status
FROM staff
WHERE deleted_at IS NULL
  AND role IN ('admin', 'operations_manager', 'warehouse_staff', 'driver', 'accountant')
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'operations_manager' THEN 2
    WHEN 'warehouse_staff' THEN 3
    WHEN 'driver' THEN 4
    WHEN 'accountant' THEN 5
  END;

-- ============================================
-- 4. GET STAFF DETAILS FOR AUTH SETUP
-- ============================================
SELECT 
  '=== STAFF READY FOR AUTH LINKING ===' as info;

SELECT 
  role,
  email,
  first_name || ' ' || last_name as name,
  staff_code,
  auth_user_id as current_auth_id,
  CASE 
    WHEN auth_user_id IS NULL THEN 'Create auth user with email: ' || email
    ELSE 'Already linked to: ' || auth_user_id
  END as action_needed
FROM staff
WHERE deleted_at IS NULL
  AND is_active = true
  AND role IN ('admin', 'operations_manager', 'warehouse_staff', 'driver', 'accountant')
ORDER BY role;

-- ============================================
-- SUMMARY
-- ============================================
SELECT 
  '=== SUMMARY ===' as info;

SELECT 
  COUNT(DISTINCT CASE WHEN role = 'admin' AND auth_user_id IS NOT NULL THEN 1 END) as admin_ready,
  COUNT(DISTINCT CASE WHEN role = 'operations_manager' AND auth_user_id IS NOT NULL THEN 1 END) as ops_ready,
  COUNT(DISTINCT CASE WHEN role = 'warehouse_staff' AND auth_user_id IS NOT NULL THEN 1 END) as warehouse_ready,
  COUNT(DISTINCT CASE WHEN role = 'driver' AND auth_user_id IS NOT NULL THEN 1 END) as driver_ready,
  COUNT(DISTINCT CASE WHEN role = 'accountant' AND auth_user_id IS NOT NULL THEN 1 END) as accountant_ready
FROM staff
WHERE deleted_at IS NULL AND is_active = true;
