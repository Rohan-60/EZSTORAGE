-- ============================================
-- Role-Based RLS Policies for Production
-- ============================================
-- This replaces the permissive policies with proper role-based access
-- Run this AFTER setting up auth users

BEGIN;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow all to view customers" ON customers;
DROP POLICY IF EXISTS "Allow all to insert customers" ON customers;
DROP POLICY IF EXISTS "Allow all to update customers" ON customers;

-- Admin and Operations can view customers
CREATE POLICY "Admin and operations view customers"
ON customers FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role IN ('admin', 'operations_manager')
      AND staff.is_active = true
  )
);

-- Admin and Operations can insert
CREATE POLICY "Admin and operations insert customers"
ON customers FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role IN ('admin', 'operations_manager')
      AND staff.is_active = true
  )
);

-- Admin and Operations can update
CREATE POLICY "Admin and operations update customers"
ON customers FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role IN ('admin', 'operations_manager')
      AND staff.is_active = true
  )
);

-- ============================================
-- STAFF TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow all to view staff" ON staff;

-- Admins can view all staff
CREATE POLICY "Admin view all staff"
ON staff FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND (
    -- Admins see everyone
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
        AND s.role = 'admin'
        AND s.is_active = true
    )
    -- Others see only themselves
    OR auth_user_id = auth.uid()
  )
);

-- ============================================
-- ORDERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow all to view orders" ON orders;
DROP POLICY IF EXISTS "Allow all to create orders" ON orders;
DROP POLICY IF EXISTS "Allow all to update orders" ON orders;

-- View orders based on role
CREATE POLICY "Role-based view orders"
ON orders FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND (
    -- Admin and Operations see all
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.auth_user_id = auth.uid()
        AND staff.role IN ('admin', 'operations_manager')
        AND staff.is_active = true
    )
    -- Drivers see only their assigned orders
    OR EXISTS (
      SELECT 1 FROM staff
      WHERE staff.auth_user_id = auth.uid()
        AND staff.id = orders.assigned_driver_id
        AND staff.role = 'driver'
        AND staff.is_active = true
    )
    -- Accountants see all (for payment tracking)
    OR EXISTS (
      SELECT 1 FROM staff
      WHERE staff.auth_user_id = auth.uid()
        AND staff.role = 'accountant'
        AND staff.is_active = true
    )
  )
);

-- Create orders (Admin and Operations only)
CREATE POLICY "Admin and ops create orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role IN ('admin', 'operations_manager')
      AND staff.is_active = true
  )
);

-- Update orders (Admin, Ops, and assigned drivers)
CREATE POLICY "Role-based update orders"
ON orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.is_active = true
      AND (
        -- Admin and Operations
        staff.role IN ('admin', 'operations_manager')
        -- Or driver updating their own order
        OR (staff.role = 'driver' AND staff.id = orders.assigned_driver_id)
      )
  )
);

-- ============================================
-- WAREHOUSES TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow all to view warehouses" ON warehouses;

-- All authenticated users can view warehouses
CREATE POLICY "Authenticated view warehouses"
ON warehouses FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

-- Only admin can modify
CREATE POLICY "Admin modify warehouses"
ON warehouses FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role = 'admin'
      AND staff.is_active = true
  )
);

-- ============================================
-- STORAGE UNITS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow all to view storage units" ON storage_units;

-- Warehouse staff and admin can view
CREATE POLICY "Warehouse and admin view units"
ON storage_units FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role IN ('admin', 'operations_manager', 'warehouse_staff')
      AND staff.is_active = true
  )
);

-- Warehouse staff and admin can modify
CREATE POLICY "Warehouse and admin modify units"
ON storage_units FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role IN ('admin', 'warehouse_staff')
      AND staff.is_active = true
  )
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow all to view payments" ON payments;

-- Admin and Accountant can view
CREATE POLICY "Admin and accountant view payments"
ON payments FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role IN ('admin', 'accountant', 'operations_manager')
      AND staff.is_active = true
  )
);

-- Admin and Accountant can modify
CREATE POLICY "Admin and accountant modify payments"
ON payments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role IN ('admin', 'accountant')
      AND staff.is_active = true
  )
);

-- ============================================
-- INVENTORY ITEMS TABLE
-- ============================================
DROP POLICY IF EXISTS "Allow all to view inventory" ON inventory_items;

-- Warehouse staff and admin can view
CREATE POLICY "Warehouse and admin view inventory"
ON inventory_items FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role IN ('admin', 'warehouse_staff', 'operations_manager')
      AND staff.is_active = true
  )
);

-- Warehouse staff and admin can modify
CREATE POLICY "Warehouse and admin modify inventory"
ON inventory_items FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.role IN ('admin', 'warehouse_staff')
      AND staff.is_active = true
  )
);

COMMIT;

-- ============================================
-- Verify Policies
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN policyname LIKE '%Role%' OR policyname LIKE '%role%' THEN '✅ Role-based'
    WHEN policyname LIKE '%all%' OR policyname LIKE '%Allow%' THEN '⚠️ Permissive'
    ELSE '✓ Custom'
  END as policy_type
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('customers', 'orders', 'staff', 'warehouses', 'storage_units', 'payments', 'inventory_items')
ORDER BY tablename, policyname;
