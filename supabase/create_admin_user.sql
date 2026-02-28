-- ============================================================
-- EZSTORAGE: Create Admin Auth User & Link to Staff
-- Run this AFTER phase1_migration.sql
-- ============================================================
-- This creates a working admin account you can log in with.
-- 
-- WHAT IT DOES:
-- 1. Creates a Supabase auth user with email + password
-- 2. Links it to the existing staff admin record (or creates one)
-- 3. You can then log in with: admin@ezstorage.com / Admin@123456
--
-- CHANGE THE PASSWORD before going to production!
-- ============================================================

-- Step 1: Check current staff state
SELECT 
  staff_code,
  first_name || ' ' || last_name as name,
  email,
  role,
  auth_user_id,
  is_active
FROM staff
WHERE deleted_at IS NULL
ORDER BY role;

-- Step 2: Create or update admin auth user
-- NOTE: Run this in Supabase SQL Editor as the postgres user (service role)
DO $$
DECLARE
  new_user_id UUID;
  existing_user_id UUID;
  admin_email TEXT := 'admin@ezstorage.com';
  admin_password TEXT := 'Admin@123456'; -- Change this!
BEGIN
  -- Check if auth user already exists
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = admin_email;

  IF existing_user_id IS NULL THEN
    -- Create new auth user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"first_name": "Admin", "last_name": "User"}',
      NOW(),
      NOW(),
      '',
      ''
    ) RETURNING id INTO new_user_id;

    -- Create identity record (required for email/password login)
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id,
      admin_email,
      format('{"sub":"%s","email":"%s"}', new_user_id::text, admin_email)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created auth user with id: %', new_user_id;
  ELSE
    new_user_id := existing_user_id;
    RAISE NOTICE 'Auth user already exists with id: %', new_user_id;
    
    -- Update password
    UPDATE auth.users
    SET encrypted_password = crypt(admin_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = new_user_id;
    RAISE NOTICE 'Password reset for existing auth user';
  END IF;

  -- Step 3: Link to staff table or create staff record
  IF EXISTS (SELECT 1 FROM staff WHERE role = 'admin' AND deleted_at IS NULL) THEN
    -- Update existing admin staff record
    UPDATE staff
    SET auth_user_id = new_user_id,
        email = admin_email,
        is_active = true
    WHERE role = 'admin' AND deleted_at IS NULL;
    RAISE NOTICE 'Linked auth user to existing admin staff record';
  ELSE
    -- Create new staff record
    INSERT INTO staff (
      auth_user_id,
      first_name,
      last_name,
      email,
      role,
      is_active
    ) VALUES (
      new_user_id,
      'Admin',
      'User',
      admin_email,
      'admin',
      true
    );
    RAISE NOTICE 'Created new admin staff record';
  END IF;
END $$;

-- Step 4: Verify it worked
SELECT 
  s.staff_code,
  s.first_name || ' ' || s.last_name as name,
  s.email,
  s.role,
  s.is_active,
  CASE 
    WHEN s.auth_user_id IS NOT NULL THEN '✅ Auth linked'
    ELSE '❌ No auth'
  END as auth_status,
  u.email as auth_email,
  u.email_confirmed_at IS NOT NULL as email_confirmed
FROM staff s
LEFT JOIN auth.users u ON u.id = s.auth_user_id
WHERE s.deleted_at IS NULL AND s.role = 'admin';

SELECT '✅ Done! Login with: admin@ezstorage.com / Admin@123456' as result;
