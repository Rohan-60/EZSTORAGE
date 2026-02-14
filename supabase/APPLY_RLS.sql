-- ============================================
-- CLEAN SLATE: Remove all existing policies first
-- ============================================

BEGIN;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow all to view customers" ON customers;
DROP POLICY IF EXISTS "Allow all to insert customers" ON customers;
DROP POLICY IF EXISTS "Allow all to update customers" ON customers;
DROP POLICY IF EXISTS "Admin and operations view customers" ON customers;
DROP POLICY IF EXISTS "Admin and operations insert customers" ON customers;
DROP POLICY IF EXISTS "Admin and operations update customers" ON customers;

DROP POLICY IF EXISTS "Allow all to view staff" ON staff;
DROP POLICY IF EXISTS "Admin view all staff" ON staff;
DROP POLICY IF EXISTS "Authenticated view staff" ON staff;
DROP POLICY IF EXISTS "Admin modify staff" ON staff;

DROP POLICY IF EXISTS "Allow all to view orders" ON orders;
DROP POLICY IF EXISTS "Allow all to create orders" ON orders;
DROP POLICY IF EXISTS "Allow all to update orders" ON orders;
DROP POLICY IF EXISTS "Role-based view orders" ON orders;
DROP POLICY IF EXISTS "Admin and ops create orders" ON orders;
DROP POLICY IF EXISTS "Role-based update orders" ON orders;

DROP POLICY IF EXISTS "Allow all to view warehouses" ON warehouses;
DROP POLICY IF EXISTS "Authenticated view warehouses" ON warehouses;
DROP POLICY IF EXISTS "Admin modify warehouses" ON warehouses;

DROP POLICY IF EXISTS "Allow all to view storage units" ON storage_units;
DROP POLICY IF EXISTS "Warehouse and admin view units" ON storage_units;
DROP POLICY IF EXISTS "Warehouse and admin modify units" ON storage_units;

DROP POLICY IF EXISTS "Allow all to view payments" ON payments;
DROP POLICY IF EXISTS "Admin and accountant view payments" ON payments;
DROP POLICY IF EXISTS "Admin and accountant modify payments" ON payments;

DROP POLICY IF EXISTS "Allow all to view inventory" ON inventory_items;
DROP POLICY IF EXISTS "Warehouse and admin view inventory" ON inventory_items;
DROP POLICY IF EXISTS "Warehouse and admin modify inventory" ON inventory_items;

COMMIT;

-- ============================================
-- Now create fresh policies
-- ============================================

BEGIN;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================

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
-- STAFF TABLE - CRITICAL FIX
-- ============================================

-- Everyone can see all staff (needed for dropdowns and queries)
CREATE POLICY "Authenticated view staff"
ON staff FOR SELECT
TO authenticated
USING (deleted_at IS NULL AND is_active = true);

-- Only admins can modify
CREATE POLICY "Admin modify staff"
ON staff FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff s
    WHERE s.auth_user_id = auth.uid()
      AND s.role = 'admin'
      AND s.is_active = true
  )
);

-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE POLICY "Role-based view orders"
ON orders FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.auth_user_id = auth.uid()
        AND staff.role IN ('admin', 'operations_manager')
        AND staff.is_active = true
    )
    OR EXISTS (
      SELECT 1 FROM staff
      WHERE staff.auth_user_id = auth.uid()
        AND staff.id = orders.assigned_driver_id
        AND staff.role = 'driver'
        AND staff.is_active = true
    )
    OR EXISTS (
      SELECT 1 FROM staff
      WHERE staff.auth_user_id = auth.uid()
        AND staff.role = 'accountant'
        AND staff.is_active = true
    )
  )
);

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

CREATE POLICY "Role-based update orders"
ON orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff
    WHERE staff.auth_user_id = auth.uid()
      AND staff.is_active = true
      AND (
        staff.role IN ('admin', 'operations_manager')
        OR (staff.role = 'driver' AND staff.id = orders.assigned_driver_id)
      )
  )
);

-- ============================================
-- WAREHOUSES TABLE
-- ============================================

CREATE POLICY "Authenticated view warehouses"
ON warehouses FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

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

-- Success!
SELECT '✅ RLS Policies Applied Successfully!' as status;
