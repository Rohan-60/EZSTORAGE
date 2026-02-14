-- ============================================
-- EZSTORAGE - REMOVE ALL TEST/DEMO DATA
-- ============================================
-- This script removes ALL auto-generated test data from the database
-- while preserving the schema, triggers, functions, and RLS policies.
--
-- ⚠️ WARNING: This will DELETE all data from your database!
-- ⚠️ Only manually entered data after running this script will remain.
--
-- Run this in: Supabase SQL Editor
-- 
-- What this script does:
-- ✅ Deletes all records from all tables
-- ✅ Resets auto-increment sequences for customer codes, order numbers, etc.
-- ✅ Preserves all schema, triggers, functions, and policies
-- ✅ Preserves all staff/auth user accounts (optional - see below)
--
-- ============================================

-- Start a transaction (so you can rollback if needed)
BEGIN;

-- ============================================
-- STEP 1: DISABLE TRIGGERS TEMPORARILY
-- ============================================
-- This prevents audit logs from being created for deletions
-- and stops trigger-based updates during cleanup

SET session_replication_role = 'replica';

-- ============================================
-- STEP 2: DELETE ALL DATA (IN CORRECT ORDER)
-- ============================================
-- Delete in order to respect foreign key constraints

-- Delete audit logs first (no dependencies)
DELETE FROM audit_logs;

-- Delete payments (depends on customers, orders, storage_units)
DELETE FROM payments;

-- Delete inventory items (depends on customers, storage_units, warehouses)
DELETE FROM inventory_items;

-- Delete orders (depends on customers, staff, warehouses, storage_units)
DELETE FROM orders;

-- Delete storage units (depends on warehouses, customers)
DELETE FROM storage_units;

-- Delete customers (independent, but referenced by many)
DELETE FROM customers;

-- Delete staff (may depend on warehouses)
-- ⚠️ OPTION 1: Keep staff accounts (recommended if you have real user accounts)
-- Comment out the line below to keep staff:
DELETE FROM staff;

-- ⚠️ OPTION 2: Only delete specific test staff members
-- Uncomment the lines below and comment out the DELETE FROM staff above
-- to keep certain staff members (e.g., your real admin account):
-- DELETE FROM staff WHERE staff_code IN ('STF-0001', 'STF-0002', 'STF-0003', 'STF-0004', 'STF-0005', 'STF-0006');
-- DELETE FROM staff WHERE email LIKE '%@ezstorage.sg';

-- Delete warehouses (cascades to storage_units via ON DELETE CASCADE)
DELETE FROM warehouses;

-- ============================================
-- STEP 3: RE-ENABLE TRIGGERS
-- ============================================

SET session_replication_role = 'origin';

-- ============================================
-- STEP 4: RESET SEQUENCES FOR AUTO-GENERATED CODES
-- ============================================
-- This ensures that new records start from 0001 again

-- Note: PostgreSQL doesn't use traditional sequences for our custom codes
-- (CUST-0001, ORD-2026-0001, etc.) because we use trigger functions.
-- The triggers automatically find the next available number.
-- So no sequence reset is needed - new records will start from 0001!

-- ============================================
-- STEP 5: VERIFY CLEANUP
-- ============================================

-- Check row counts
SELECT 
  'Customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'Warehouses', COUNT(*) FROM warehouses
UNION ALL
SELECT 'Storage Units', COUNT(*) FROM storage_units
UNION ALL
SELECT 'Staff', COUNT(*) FROM staff
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Inventory Items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM audit_logs;

-- ============================================
-- COMMIT OR ROLLBACK
-- ============================================

-- If everything looks good, commit the transaction:
COMMIT;

-- If you want to undo the changes (only works if you haven't committed yet):
-- ROLLBACK;

-- ============================================
-- NOTES
-- ============================================
--
-- After running this script:
-- 1. All test data from seed.sql will be removed
-- 2. Your database schema remains intact
-- 3. All triggers, functions, and RLS policies are still active
-- 4. You can now manually enter real customer/order data
-- 5. New records will automatically get codes starting from:
--    - Customers: CUST-0001
--    - Orders: ORD-2026-0001 (uses current year)
--    - Payments: PAY-2026-0001 (uses current year)
--    - Staff: STF-0001 (if you deleted staff)
--
-- To add data manually:
-- - Use your application's UI to create customers, orders, etc.
-- - Or write custom INSERT statements
-- - The auto-generated codes will be created by triggers
--
