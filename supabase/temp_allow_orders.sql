-- ============================================
-- TEMPORARY FIX: Allow Order Creation for Testing
-- ============================================
-- ⚠️ WARNING: This allows anyone to create orders (for development only)
-- ⚠️ Remove these policies before production!
--
-- Run this in: Supabase SQL Editor
-- ============================================

-- Drop existing restrictive policies for orders
DROP POLICY
IF EXISTS "Staff can view orders based on role" ON orders;
DROP POLICY
IF EXISTS "Operations can create orders" ON orders;
DROP POLICY
IF EXISTS "Staff can update orders based on role" ON orders;
DROP POLICY
IF EXISTS "Admin can delete orders" ON orders;
DROP POLICY
IF EXISTS "Public can view orders (TEMPORARY)" ON orders;
DROP POLICY
IF EXISTS "Public can create orders (TEMPORARY)" ON orders;
DROP POLICY
IF EXISTS "Public can update orders (TEMPORARY)" ON orders;

-- Create temporary public access policies for orders
CREATE POLICY "Allow authenticated to view orders (TEMPORARY)"
ON orders FOR
SELECT
    TO authenticated
USING
(deleted_at IS NULL);

CREATE POLICY "Allow authenticated to create orders (TEMPORARY)"
ON orders FOR
INSERT
TO authenticated
WITH CHECK (
true);

CREATE POLICY "Allow authenticated to update orders (TEMPORARY)"
ON orders FOR
UPDATE
TO authenticated
USING (true)
WITH CHECK
(true);

CREATE POLICY "Allow authenticated to delete orders (TEMPORARY)"
ON orders FOR
DELETE
TO authenticated
USING (true);

-- Also allow public for testing (VERY TEMPORARY - remove this after testing!)
CREATE POLICY "Allow anon to view orders (TESTING ONLY)"
ON orders FOR
SELECT
    TO anon
USING
(deleted_at IS NULL);

CREATE POLICY "Allow anon to create orders (TESTING ONLY)"
ON orders FOR
INSERT
TO anon
WITH CHECK (
true);

CREATE POLICY "Allow anon to update orders (TESTING ONLY)"
ON orders FOR
UPDATE
TO anon
USING (true)
WITH CHECK
(true);

-- Also update warehouses table to allow reads
DROP POLICY
IF EXISTS "All staff can view warehouses" ON warehouses;
DROP POLICY
IF EXISTS "Only admins can insert warehouses" ON warehouses;
DROP POLICY
IF EXISTS "Public can view warehouses (TEMPORARY)" ON warehouses;

CREATE POLICY "Allow everyone to view warehouses (TEMPORARY)"
ON warehouses FOR
SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Allow authenticated to insert warehouses (TEMPORARY)"
ON warehouses FOR
INSERT
TO authenticated
WITH CHECK (
true);

CREATE POLICY "Allow anon to insert warehouses (TESTING ONLY)"
ON warehouses FOR
INSERT
TO anon
WITH CHECK (
true);

-- Verify the changes
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('orders', 'warehouses')
ORDER BY tablename, policyname;

SELECT '✅ Temporary policies applied! You can now create orders.' as message;
