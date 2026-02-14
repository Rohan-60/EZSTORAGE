-- ============================================
-- DEVELOPMENT MODE: Permissive RLS Policies
-- ============================================
-- This keeps RLS enabled but allows full access for testing
-- ⚠️ Use this for development/testing ONLY
-- ⚠️ Replace with strict policies before production
--
-- Run this in: Supabase SQL Editor
-- ============================================

-- RLS remains ENABLED on all tables (good practice)
-- We just make the policies permissive for development

-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================

-- Customers
DROP POLICY IF EXISTS "Admin and operations can view all customers" ON customers;
DROP POLICY IF EXISTS "Admin and operations can insert customers" ON customers;
DROP POLICY IF EXISTS "Admin and operations can update customers" ON customers;
DROP POLICY IF EXISTS "Only admins can delete customers" ON customers;
DROP POLICY IF EXISTS "Public can view customers (TEMPORARY)" ON customers;
DROP POLICY IF EXISTS "Public can insert customers (TEMPORARY)" ON customers;
DROP POLICY IF EXISTS "Public can update customers (TEMPORARY)" ON customers;

-- Warehouses
DROP POLICY IF EXISTS "All staff can view warehouses" ON warehouses;
DROP POLICY IF EXISTS "Only admins can insert warehouses" ON warehouses;
DROP POLICY IF EXISTS "Only admins can update warehouses" ON warehouses;
DROP POLICY IF EXISTS "Only admins can delete warehouses" ON warehouses;
DROP POLICY IF EXISTS "Public can view warehouses (TEMPORARY)" ON warehouses;
DROP POLICY IF EXISTS "Allow everyone to view warehouses (TEMPORARY)" ON warehouses;
DROP POLICY IF EXISTS "Allow authenticated to insert warehouses (TEMPORARY)" ON warehouses;
DROP POLICY IF EXISTS "Allow anon to insert warehouses (TESTING ONLY)" ON warehouses;

-- Storage Units
DROP POLICY IF EXISTS "Staff can view storage units" ON storage_units;
DROP POLICY IF EXISTS "Operations can manage storage units" ON storage_units;
DROP POLICY IF EXISTS "Public can view storage units (TEMPORARY)" ON storage_units;

-- Staff
DROP POLICY IF EXISTS "Admins can view all staff" ON staff;
DROP POLICY IF EXISTS "Staff can view their own record" ON staff;
DROP POLICY IF EXISTS "Only admins can manage staff" ON staff;
DROP POLICY IF EXISTS "Public can view staff (TEMPORARY)" ON staff;

-- Orders
DROP POLICY IF EXISTS "Staff can view orders based on role" ON orders;
DROP POLICY IF EXISTS "Operations can create orders" ON orders;
DROP POLICY IF EXISTS "Staff can update orders based on role" ON orders;
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
DROP POLICY IF EXISTS "Public can view orders (TEMPORARY)" ON orders;
DROP POLICY IF EXISTS "Public can create orders (TEMPORARY)" ON orders;
DROP POLICY IF EXISTS "Public can update orders (TEMPORARY)" ON orders;
DROP POLICY IF EXISTS "Allow authenticated to view orders (TEMPORARY)" ON orders;
DROP POLICY IF EXISTS "Allow authenticated to create orders (TEMPORARY)" ON orders;
DROP POLICY IF EXISTS "Allow authenticated to update orders (TEMPORARY)" ON orders;
DROP POLICY IF EXISTS "Allow authenticated to delete orders (TEMPORARY)" ON orders;
DROP POLICY IF EXISTS "Allow anon to view orders (TESTING ONLY)" ON orders;
DROP POLICY IF EXISTS "Allow anon to create orders (TESTING ONLY)" ON orders;
DROP POLICY IF EXISTS "Allow anon to update orders (TESTING ONLY)" ON orders;

-- Inventory Items
DROP POLICY IF EXISTS "Staff can view inventory" ON inventory_items;
DROP POLICY IF EXISTS "Warehouse staff can manage inventory" ON inventory_items;
DROP POLICY IF EXISTS "Public can view inventory (TEMPORARY)" ON inventory_items;

-- Payments
DROP POLICY IF EXISTS "Finance staff can view payments" ON payments;
DROP POLICY IF EXISTS "Finance and admin can manage payments" ON payments;
DROP POLICY IF EXISTS "Public can view payments (TEMPORARY)" ON payments;

-- Audit Logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- ============================================
-- CREATE PERMISSIVE POLICIES FOR DEVELOPMENT
-- ============================================

-- CUSTOMERS: Full access for authenticated and anon users
CREATE POLICY "dev_customers_select" ON customers FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "dev_customers_insert" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "dev_customers_update" ON customers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "dev_customers_delete" ON customers FOR DELETE USING (true);

-- WAREHOUSES: Full access
CREATE POLICY "dev_warehouses_select" ON warehouses FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "dev_warehouses_insert" ON warehouses FOR INSERT WITH CHECK (true);
CREATE POLICY "dev_warehouses_update" ON warehouses FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "dev_warehouses_delete" ON warehouses FOR DELETE USING (true);

-- STORAGE UNITS: Full access
CREATE POLICY "dev_storage_units_select" ON storage_units FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "dev_storage_units_insert" ON storage_units FOR INSERT WITH CHECK (true);
CREATE POLICY "dev_storage_units_update" ON storage_units FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "dev_storage_units_delete" ON storage_units FOR DELETE USING (true);

-- STAFF: Full access
CREATE POLICY "dev_staff_select" ON staff FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "dev_staff_insert" ON staff FOR INSERT WITH CHECK (true);
CREATE POLICY "dev_staff_update" ON staff FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "dev_staff_delete" ON staff FOR DELETE USING (true);

-- ORDERS: Full access
CREATE POLICY "dev_orders_select" ON orders FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "dev_orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "dev_orders_update" ON orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "dev_orders_delete" ON orders FOR DELETE USING (true);

-- INVENTORY ITEMS: Full access
CREATE POLICY "dev_inventory_select" ON inventory_items FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "dev_inventory_insert" ON inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "dev_inventory_update" ON inventory_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "dev_inventory_delete" ON inventory_items FOR DELETE USING (true);

-- PAYMENTS: Full access
CREATE POLICY "dev_payments_select" ON payments FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "dev_payments_insert" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "dev_payments_update" ON payments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "dev_payments_delete" ON payments FOR DELETE USING (true);

-- AUDIT LOGS: View and insert
CREATE POLICY "dev_audit_logs_select" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "dev_audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

SELECT '✅ Development policies applied! RLS is enabled but permissive.' as message;
SELECT '⚠️  Remember to switch to production policies before going live!' as warning;
