-- EZSTORAGE - Row Level Security Policies
-- This file defines role-based access control using Supabase RLS

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's staff role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS staff_role AS $$
  SELECT role FROM staff WHERE auth_user_id = auth.uid() AND is_active = true LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is operations manager
CREATE OR REPLACE FUNCTION is_operations_manager()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
      AND role IN ('admin', 'operations_manager') 
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current staff ID
CREATE OR REPLACE FUNCTION get_current_staff_id()
RETURNS UUID AS $$
  SELECT id FROM staff WHERE auth_user_id = auth.uid() AND is_active = true LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- CUSTOMERS TABLE POLICIES
-- ============================================

-- Admins and operations managers can view all customers
CREATE POLICY "Admin and operations can view all customers"
ON customers FOR SELECT
TO authenticated
USING (
  is_operations_manager() = true
  AND deleted_at IS NULL
);

-- Admins and operations can insert customers
CREATE POLICY "Admin and operations can insert customers"
ON customers FOR INSERT
TO authenticated
WITH CHECK (
  is_operations_manager() = true
);

-- Admins and operations can update customers
CREATE POLICY "Admin and operations can update customers"
ON customers FOR UPDATE
TO authenticated
USING (is_operations_manager() = true)
WITH CHECK (is_operations_manager() = true);

-- Only admins can delete customers (soft delete)
CREATE POLICY "Only admins can delete customers"
ON customers FOR DELETE
TO authenticated
USING (is_admin() = true);

-- ============================================
-- WAREHOUSES TABLE POLICIES
-- ============================================

-- All authenticated users can view active warehouses
CREATE POLICY "All staff can view warehouses"
ON warehouses FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

-- Only admins can manage warehouses
CREATE POLICY "Only admins can insert warehouses"
ON warehouses FOR INSERT
TO authenticated
WITH CHECK (is_admin() = true);

CREATE POLICY "Only admins can update warehouses"
ON warehouses FOR UPDATE
TO authenticated
USING (is_admin() = true)
WITH CHECK (is_admin() = true);

CREATE POLICY "Only admins can delete warehouses"
ON warehouses FOR DELETE
TO authenticated
USING (is_admin() = true);

-- ============================================
-- STORAGE UNITS TABLE POLICIES
-- ============================================

-- Warehouse staff and above can view units in their warehouse
CREATE POLICY "Staff can view storage units"
ON storage_units FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND (
    is_operations_manager() = true
    OR EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
        AND warehouse_id = storage_units.warehouse_id
        AND role IN ('warehouse_staff')
    )
  )
);

-- Warehouse staff and ops managers can update units
CREATE POLICY "Warehouse staff can manage units"
ON storage_units FOR ALL
TO authenticated
USING (
  is_operations_manager() = true
  OR EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
      AND warehouse_id = storage_units.warehouse_id
      AND role IN ('warehouse_staff')
  )
);

-- ============================================
-- STAFF TABLE POLICIES
-- ============================================

-- Admins can view all staff
CREATE POLICY "Admins can view all staff"
ON staff FOR SELECT
TO authenticated
USING (
  (is_admin() = true AND deleted_at IS NULL)
  OR auth_user_id = auth.uid()  -- Users can view their own record
);

-- Only admins can manage staff
CREATE POLICY "Only admins can insert staff"
ON staff FOR INSERT
TO authenticated
WITH CHECK (is_admin() = true);

CREATE POLICY "Only admins can update staff"
ON staff FOR UPDATE
TO authenticated
USING (is_admin() = true OR auth_user_id = auth.uid())  -- Users can update their own profile
WITH CHECK (is_admin() = true OR auth_user_id = auth.uid());

CREATE POLICY "Only admins can delete staff"
ON staff FOR DELETE
TO authenticated
USING (is_admin() = true);

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Drivers can view their assigned orders
-- Operations staff can view all orders
CREATE POLICY "Staff can view orders based on role"
ON orders FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND (
    is_operations_manager() = true
    OR assigned_driver_id = get_current_staff_id()
    OR EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
        AND role = 'accountant'
    )
  )
);

-- Operations managers can create orders
CREATE POLICY "Operations can create orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (is_operations_manager() = true);

-- Drivers can update their assigned orders (status, notes, proof)
-- Operations can update all orders
CREATE POLICY "Staff can update orders based on role"
ON orders FOR UPDATE
TO authenticated
USING (
  is_operations_manager() = true
  OR (
    assigned_driver_id = get_current_staff_id()
    AND status IN ('scheduled', 'in_transit')
  )
)
WITH CHECK (
  is_operations_manager() = true
  OR assigned_driver_id = get_current_staff_id()
);

-- Only operations managers can delete orders
CREATE POLICY "Only operations can delete orders"
ON orders FOR DELETE
TO authenticated
USING (is_operations_manager() = true);

-- ============================================
-- INVENTORY ITEMS TABLE POLICIES
-- ============================================

-- Warehouse staff and operations can view inventory
CREATE POLICY "Staff can view inventory"
ON inventory_items FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND (
    is_operations_manager() = true
    OR EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
        AND warehouse_id = inventory_items.warehouse_id
        AND role IN ('warehouse_staff')
    )
  )
);

-- Warehouse staff and operations can manage inventory
CREATE POLICY "Staff can manage inventory"
ON inventory_items FOR ALL
TO authenticated
USING (
  is_operations_manager() = true
  OR EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
      AND warehouse_id = inventory_items.warehouse_id
      AND role IN ('warehouse_staff')
  )
);

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================

-- Accountants and admins can view all payments
CREATE POLICY "Finance staff can view payments"
ON payments FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND (
    is_admin() = true
    OR EXISTS (
      SELECT 1 FROM staff 
      WHERE auth_user_id = auth.uid() 
        AND role IN ('accountant', 'operations_manager')
    )
  )
);

-- Accountants and admins can manage payments
CREATE POLICY "Finance staff can manage payments"
ON payments FOR ALL
TO authenticated
USING (
  is_admin() = true
  OR EXISTS (
    SELECT 1 FROM staff 
    WHERE auth_user_id = auth.uid() 
      AND role IN ('accountant')
  )
);

-- ============================================
-- AUDIT LOGS TABLE POLICIES
-- ============================================

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin() = true);

-- System can insert audit logs (via trigger)
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);  -- Controlled by trigger with SECURITY DEFINER

-- No one can update or delete audit logs
-- (No policies needed - defaults to deny)

-- ============================================
-- STORAGE BUCKET POLICIES (for file uploads)
-- ============================================

-- Create storage buckets (run these in Supabase Storage UI or via API)
-- Bucket: proof-images (for delivery/pickup proofs)
-- Bucket: invoices (for payment invoices)
-- Bucket: customer-documents

-- Proof images: Drivers and ops can upload
-- INSERT INTO storage.buckets (id, name, public) VALUES ('proof-images', 'proof-images', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('customer-documents', 'customer-documents', false);

-- Storage policies will be added when configuring Supabase Storage
