-- ============================================
-- PRODUCTION MODE: Strict RLS Policies
-- ============================================
-- Use this for production deployment
-- Role-based access control with proper restrictions
--
-- Run this in: Supabase SQL Editor (BEFORE PRODUCTION)
-- ============================================

-- ⚠️ IMPORTANT: Only run this when:
-- 1. All staff records are created
-- 2. All auth users are linked to staff
-- 3. You're ready to enforce strict security

-- ============================================
-- DROP ALL DEVELOPMENT POLICIES
-- ============================================

-- Customers
DROP POLICY IF EXISTS "dev_customers_select" ON customers;
DROP POLICY IF EXISTS "dev_customers_insert" ON customers;
DROP POLICY IF EXISTS "dev_customers_update" ON customers;
DROP POLICY IF EXISTS "dev_customers_delete" ON customers;

-- Warehouses
DROP POLICY IF EXISTS "dev_warehouses_select" ON warehouses;
DROP POLICY IF EXISTS "dev_warehouses_insert" ON warehouses;
DROP POLICY IF EXISTS "dev_warehouses_update" ON warehouses;
DROP POLICY IF EXISTS "dev_warehouses_delete" ON warehouses;

-- Storage Units
DROP POLICY IF EXISTS "dev_storage_units_select" ON storage_units;
DROP POLICY IF EXISTS "dev_storage_units_insert" ON storage_units;
DROP POLICY IF EXISTS "dev_storage_units_update" ON storage_units;
DROP POLICY IF EXISTS "dev_storage_units_delete" ON storage_units;

-- Staff
DROP POLICY IF EXISTS "dev_staff_select" ON staff;
DROP POLICY IF EXISTS "dev_staff_insert" ON staff;
DROP POLICY IF EXISTS "dev_staff_update" ON staff;
DROP POLICY IF EXISTS "dev_staff_delete" ON staff;

-- Orders
DROP POLICY IF EXISTS "dev_orders_select" ON orders;
DROP POLICY IF EXISTS "dev_orders_insert" ON orders;
DROP POLICY IF EXISTS "dev_orders_update" ON orders;
DROP POLICY IF EXISTS "dev_orders_delete" ON orders;

-- Inventory
DROP POLICY IF EXISTS "dev_inventory_select" ON inventory_items;
DROP POLICY IF EXISTS "dev_inventory_insert" ON inventory_items;
DROP POLICY IF EXISTS "dev_inventory_update" ON inventory_items;
DROP POLICY IF EXISTS "dev_inventory_delete" ON inventory_items;

-- Payments
DROP POLICY IF EXISTS "dev_payments_select" ON payments;
DROP POLICY IF EXISTS "dev_payments_insert" ON payments;
DROP POLICY IF EXISTS "dev_payments_update" ON payments;
DROP POLICY IF EXISTS "dev_payments_delete" ON payments;

-- Audit Logs
DROP POLICY IF EXISTS "dev_audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "dev_audit_logs_insert" ON audit_logs;

-- ============================================
-- PRODUCTION POLICIES: CUSTOMERS
-- ============================================

CREATE POLICY "prod_customers_view"
ON customers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager', 'accountant')
    AND is_active = true
  )
  AND deleted_at IS NULL
);

CREATE POLICY "prod_customers_insert"
ON customers FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager')
    AND is_active = true
  )
);

CREATE POLICY "prod_customers_update"
ON customers FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager')
    AND is_active = true
  )
);

CREATE POLICY "prod_customers_delete"
ON customers FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
    AND is_active = true
  )
);

-- ============================================
-- PRODUCTION POLICIES: WAREHOUSES
-- ============================================

CREATE POLICY "prod_warehouses_view"
ON warehouses FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

CREATE POLICY "prod_warehouses_insert"
ON warehouses FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
    AND is_active = true
  )
);

CREATE POLICY "prod_warehouses_update"
ON warehouses FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'warehouse_staff')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'warehouse_staff')
    AND is_active = true
  )
);

-- ============================================
-- PRODUCTION POLICIES: STORAGE UNITS
-- ============================================

CREATE POLICY "prod_storage_units_view"
ON storage_units FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

CREATE POLICY "prod_storage_units_manage"
ON storage_units FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager', 'warehouse_staff')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager', 'warehouse_staff')
    AND is_active = true
  )
);

-- ============================================
-- PRODUCTION POLICIES: STAFF
-- ============================================

CREATE POLICY "prod_staff_view_all"
ON staff FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager')
    AND is_active = true
  )
  AND deleted_at IS NULL
);

CREATE POLICY "prod_staff_view_self"
ON staff FOR SELECT
TO authenticated
USING (
  auth_user_id = auth.uid()
  AND deleted_at IS NULL
);

CREATE POLICY "prod_staff_manage"
ON staff FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
    AND is_active = true
  )
);

-- ============================================
-- PRODUCTION POLICIES: ORDERS
-- ============================================

CREATE POLICY "prod_orders_view"
ON orders FOR SELECT
TO authenticated
USING (
  (
    -- Admins and operations see all
    EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'operations_manager')
      AND is_active = true
    )
  ) OR (
    -- Drivers see their assigned orders
    EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
      AND role = 'driver'
      AND is_active = true
      AND id = orders.assigned_driver_id
    )
  )
  AND deleted_at IS NULL
);

CREATE POLICY "prod_orders_create"
ON orders FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager')
    AND is_active = true
  )
);

CREATE POLICY "prod_orders_update"
ON orders FOR UPDATE
TO authenticated
USING (
  (
    -- Admins and operations can update all
    EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'operations_manager')
      AND is_active = true
    )
  ) OR (
    -- Drivers can update their assigned orders
    EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
      AND role = 'driver'
      AND is_active = true
      AND id = orders.assigned_driver_id
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager', 'driver')
    AND is_active = true
  )
);

CREATE POLICY "prod_orders_delete"
ON orders FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
    AND is_active = true
  )
);

-- ============================================
-- PRODUCTION POLICIES: INVENTORY ITEMS
-- ============================================

CREATE POLICY "prod_inventory_view"
ON inventory_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND is_active = true
  )
  AND deleted_at IS NULL
);

CREATE POLICY "prod_inventory_manage"
ON inventory_items FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager', 'warehouse_staff')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager', 'warehouse_staff')
    AND is_active = true
  )
);

-- ============================================
-- PRODUCTION POLICIES: PAYMENTS
-- ============================================

CREATE POLICY "prod_payments_view"
ON payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'operations_manager', 'accountant')
    AND is_active = true
  )
  AND deleted_at IS NULL
);

CREATE POLICY "prod_payments_manage"
ON payments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'accountant')
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role IN ('admin', 'accountant')
    AND is_active = true
  )
);

-- ============================================
-- PRODUCTION POLICIES: AUDIT LOGS
-- ============================================

CREATE POLICY "prod_audit_logs_view"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
    AND is_active = true
  )
);

CREATE POLICY "prod_audit_logs_insert"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname LIKE 'prod_%'
GROUP BY tablename
ORDER BY tablename;

SELECT '✅ Production policies applied! Role-based security is enforced.' as message;
SELECT '🔒 Users must be authenticated to access data.' as security_status;
