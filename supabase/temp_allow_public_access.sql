-- ============================================
-- TEMPORARY FIX: Allow Public Access to Test Data
-- ============================================
-- ⚠️ WARNING: This removes authentication requirements temporarily
-- ⚠️ Use this ONLY for development/testing
-- ⚠️ Remove these policies before going to production!
--
-- This script creates permissive policies that allow viewing data
-- without authentication. Use this to test if your app works,
-- then properly set up authentication.
--
-- Run this in: Supabase SQL Editor
-- ============================================

-- Drop existing restrictive policies for customers
DROP POLICY IF EXISTS "Admin and operations can view all customers" ON customers;
DROP POLICY IF EXISTS "Admin and operations can insert customers" ON customers;
DROP POLICY IF EXISTS "Admin and operations can update customers" ON customers;
DROP POLICY IF EXISTS "Only admins can delete customers" ON customers;

-- Create temporary public access policies
CREATE POLICY "Public can view customers (TEMPORARY)"
ON customers FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Public can insert customers (TEMPORARY)"
ON customers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update customers (TEMPORARY)"
ON customers FOR UPDATE
USING (true)
WITH CHECK (true);

-- Also update staff policies to allow viewing
DROP POLICY IF EXISTS "Admins can view all staff" ON staff;

CREATE POLICY "Public can view staff (TEMPORARY)"
ON staff FOR SELECT
USING (deleted_at IS NULL);

-- Also update orders, warehouses, etc for full functionality
DROP POLICY IF EXISTS "Staff can view orders based on role" ON orders;

CREATE POLICY "Public can view orders (TEMPORARY)"
ON orders FOR SELECT
USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Operations can create orders" ON orders;

CREATE POLICY "Public can create orders (TEMPORARY)"
ON orders FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can update orders based on role" ON orders;

CREATE POLICY "Public can update orders (TEMPORARY)"
ON orders FOR UPDATE
USING (true)
WITH CHECK (true);

-- Warehouses
DROP POLICY IF EXISTS "All staff can view warehouses" ON warehouses;

CREATE POLICY "Public can view warehouses (TEMPORARY)"
ON warehouses FOR SELECT
USING (deleted_at IS NULL);

-- Storage units
DROP POLICY IF EXISTS "Staff can view storage units" ON storage_units;

CREATE POLICY "Public can view storage units (TEMPORARY)"
ON storage_units FOR SELECT
USING (deleted_at IS NULL);

-- Payments  
DROP POLICY IF EXISTS "Finance staff can view payments" ON payments;

CREATE POLICY "Public can view payments (TEMPORARY)"
ON payments FOR SELECT
USING (deleted_at IS NULL);

-- Inventory
DROP POLICY IF EXISTS "Staff can view inventory" ON inventory_items;

CREATE POLICY "Public can view inventory (TEMPORARY)"
ON inventory_items FOR SELECT
USING (deleted_at IS NULL);

-- Verify the changes
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('customers', 'orders', 'staff', 'warehouses')
ORDER BY tablename, policyname;
