-- Clean up extra staff records (keep only admin@test.com)
-- Run this ONLY if you want to remove the other staff records

-- First, check what staff records exist
SELECT 
    staff_code,
    email,
    first_name,
    last_name,
    role
FROM staff
ORDER BY created_at;

-- Option 1: Delete all staff except admin@test.com
-- Uncomment the line below if you want to delete them
-- DELETE FROM staff WHERE email != 'admin@test.com';

-- Option 2: Just keep them (they won't affect login)
-- The extra staff records are harmless - they just don't have auth users
-- Only admin@test.com can login since that's the only auth user

-- To verify what's left:
-- SELECT * FROM staff;
