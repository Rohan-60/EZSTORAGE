-- ============================================
-- MINIMAL SEED DATA FOR TESTING
-- ============================================
-- This creates just 1 warehouse, 1 staff (admin), and a few storage units
-- Keep it SIMPLE for testing!

-- ============================================
-- 1 WAREHOUSE
-- ============================================
INSERT INTO warehouses (warehouse_code, name, address_line1, city, postal_code, total_units, is_active) 
VALUES ('WH-001', 'Test Warehouse', '10 Tuas Avenue 20', 'Singapore', '638824', 10, true);

-- ============================================
-- 1 ADMIN STAFF MEMBER
-- ============================================
-- Email: admin@test.com
-- This will be linked to your Supabase auth user
INSERT INTO staff (staff_code, first_name, last_name, email, phone, role, hire_date, is_active) 
VALUES ('STF-0001', 'Admin', 'User', 'admin@test.com', '+65 9000 0001', 'admin', CURRENT_DATE, true);

-- ============================================
-- 3 STORAGE UNITS (Simple!)
-- ============================================
INSERT INTO storage_units (
  warehouse_id, 
  unit_number, 
  floor_number, 
  size_label, 
  monthly_rate, 
  status
) 
SELECT 
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001'),
  'A' || LPAD(generate_series::text, 3, '0'),
  1,
  CASE WHEN generate_series = 1 THEN 'Small' WHEN generate_series = 2 THEN 'Medium' ELSE 'Large' END,
  CASE WHEN generate_series = 1 THEN 180.00 WHEN generate_series = 2 THEN 280.00 ELSE 450.00 END,
  'available'::storage_unit_status
FROM generate_series(1, 3);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Setup Complete!' as message;
SELECT 'Warehouses: ' || COUNT(*) as count FROM warehouses;
SELECT 'Staff: ' || COUNT(*) as count FROM staff;
SELECT 'Storage Units: ' || COUNT(*) as count FROM storage_units;

-- ============================================
-- NEXT STEP
-- ============================================
-- Now create an auth user in Supabase with email: admin@test.com
-- Then run: link_auth_users.sql
