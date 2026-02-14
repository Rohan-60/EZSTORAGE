-- ============================================
-- CREATE TEST USERS FOR ALL ROLES
-- ============================================
-- This creates one staff member for each role for testing
-- Run this in: Supabase SQL Editor
-- ============================================

-- First, check if staff already exist
DO $
$
BEGIN
    IF NOT EXISTS (SELECT 1
    FROM staff
    WHERE staff_code = 'STF-0001') THEN
    -- 1. ADMIN USER
    INSERT INTO staff
        (staff_code, first_name, last_name, email, phone, role, hire_date, is_active)
    VALUES
        ('STF-0001', 'Admin', 'User', 'admin@test.com', '+65 9000 0001', 'admin', CURRENT_DATE, true);

    RAISE NOTICE '✅ Created Admin (admin@test.com)';
ELSE
        RAISE NOTICE '⚠️  Admin already exists';
END
IF;

    IF NOT EXISTS (SELECT 1
FROM staff
WHERE staff_code = 'STF-0002') THEN
-- 2. OPERATIONS MANAGER
INSERT INTO staff
    (staff_code, first_name, last_name, email, phone, role, hire_date, is_active)
VALUES
    ('STF-0002', 'Operations', 'Manager', 'ops@test.com', '+65 9000 0002', 'operations_manager', CURRENT_DATE, true);

RAISE NOTICE '✅ Created Operations Manager (ops@test.com)';
    ELSE
        RAISE NOTICE '⚠️  Operations Manager already exists';
END
IF;

    IF NOT EXISTS (SELECT 1
FROM staff
WHERE staff_code = 'STF-0003') THEN
-- 3. WAREHOUSE STAFF
INSERT INTO staff
    (staff_code, first_name, last_name, email, phone, role, hire_date, is_active)
VALUES
    ('STF-0003', 'Warehouse', 'Staff', 'warehouse@test.com', '+65 9000 0003', 'warehouse_staff', CURRENT_DATE, true);

RAISE NOTICE '✅ Created Warehouse Staff (warehouse@test.com)';
    ELSE
        RAISE NOTICE '⚠️  Warehouse Staff already exists';
END
IF;

    IF NOT EXISTS (SELECT 1
FROM staff
WHERE staff_code = 'STF-0004') THEN
-- 4. DRIVER
INSERT INTO staff
    (
    staff_code, first_name, last_name, email, phone, role,
    hire_date, is_active,
    license_number, vehicle_number, vehicle_type
    )
VALUES
    (
        'STF-0004', 'Driver', 'One', 'driver@test.com', '+65 9000 0004', 'driver',
        CURRENT_DATE, true,
        'S1234567A', 'SGX1234A', 'Van'
        );

RAISE NOTICE '✅ Created Driver (driver@test.com)';
    ELSE
        RAISE NOTICE '⚠️  Driver already exists';
END
IF;

    IF NOT EXISTS (SELECT 1
FROM staff
WHERE staff_code = 'STF-0005') THEN
-- 5. ACCOUNTANT
INSERT INTO staff
    (staff_code, first_name, last_name, email, phone, role, hire_date, is_active)
VALUES
    ('STF-0005', 'Finance', 'Staff', 'accountant@test.com', '+65 9000 0005', 'accountant', CURRENT_DATE, true);

RAISE NOTICE '✅ Created Accountant (accountant@test.com)';
    ELSE
        RAISE NOTICE '⚠️  Accountant already exists';
END
IF;
END $$;

-- Also create a test warehouse if needed (for assignments)
INSERT INTO warehouses
    (warehouse_code, name, address_line1, city, postal_code, total_units, occupied_units, is_active)
VALUES
    ('WH-001', 'Test Warehouse', '10 Tuas Avenue 20', 'Singapore', '638824', 10, 0, true)
ON CONFLICT
(warehouse_code) DO NOTHING;

-- Assign warehouse to warehouse staff
UPDATE staff 
SET warehouse_id = (SELECT id
FROM warehouses
WHERE warehouse_code = 'WH-001')
WHERE staff_code = 'STF-0003';

-- Show all created staff
SELECT
    staff_code,
    first_name || ' ' || last_name as name,
    email,
    role,
    CASE WHEN auth_user_id IS NOT NULL THEN '🔓 Linked' ELSE '🔒 Not Linked' END as auth_status
FROM staff
WHERE staff_code IN ('STF-0001', 'STF-0002', 'STF-0003', 'STF-0004', 'STF-0005')
ORDER BY staff_code;

-- ============================================
-- NEXT STEPS
-- ============================================
SELECT '
✅ Staff created! Now create auth users:

1. Go to Supabase Dashboard → Authentication → Users
2. Create 5 users with these credentials:

   Email: admin@test.com       | Password: Admin123!
   Email: ops@test.com          | Password: Ops123!
   Email: warehouse@test.com    | Password: Warehouse123!
   Email: driver@test.com       | Password: Driver123!
   Email: accountant@test.com   | Password: Accountant123!

3. ✅ Check "Auto-confirm user" for each
4. After creating all users, run: link_auth_users.sql
5. Then you can login with any role!

' as instructions;
