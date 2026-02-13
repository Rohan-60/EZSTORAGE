-- EZSTORAGE - Sample Data for Testing
-- This file populates the database with demo data

-- ============================================
-- DEMO CUSTOMERS
-- ============================================

INSERT INTO customers (first_name, last_name, email, phone, address_line1, address_line2, city, postal_code, company_name, is_active) VALUES
('John', 'Tan', 'john.tan@email.com', '+65 9123 4567', '123 Orchard Road', '#10-45', 'Singapore', '238858', NULL, true),
('Mary', 'Lim', 'mary.lim@bizco.sg', '+65 9234 5678', '456 Marina Boulevard', 'Unit 5-6', 'Singapore', '018980', 'BizCo Pte Ltd', true),
('David', 'Wong', 'david.w@techstart.io', '+65 9345 6789', '789 Raffles Place', NULL, 'Singapore', '048619', 'TechStart Solutions', true),
('Sarah', 'Ng', 'sarah.ng@email.com', '+65 9456 7890', '321 Bukit Timah Road', '#03-12', 'Singapore', '259720', NULL, true),
('Michael', 'Chen', 'michael@trading.sg', '+65 9567 8901', '654 Tanjong Pagar Road', NULL, 'Singapore', '088540', 'Chen Trading Co', true);

-- ============================================
-- DEMO WAREHOUSES
-- ============================================

INSERT INTO warehouses (warehouse_code, name, address_line1, city, postal_code, latitude, longitude, total_units, contact_phone, is_active) VALUES
('WH-001', 'Tuas Mega Storage', '10 Tuas Avenue 20', 'Singapore', '638824', 1.3285, 103.6488, 100, '+65 6555 1001', true),
('WH-002', 'Changi Business Park', '5 Changi Business Park Central 1', 'Singapore', '486038', 1.3350, 103.9644, 75, '+65 6555 1002', true),
('WH-003', 'Woodlands Industrial', '20 Woodlands Industrial Park E1', 'Singapore', '757719', 1.4501, 103.7913, 50, '+65 6555 1003', true);

-- ============================================
-- DEMO STORAGE UNITS
-- ============================================

-- Warehouse 1 (Tuas) - 10 sample units
INSERT INTO storage_units (warehouse_id, unit_number, floor_number, section, size_label, length_cm, width_cm, height_cm, monthly_rate, status, climate_controlled) 
SELECT 
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001'),
  'A' || LPAD(generate_series::text, 3, '0'),
  CASE WHEN generate_series <= 5 THEN 1 ELSE 2 END,
  CASE WHEN generate_series <= 5 THEN 'A' ELSE 'B' END,
  CASE WHEN generate_series % 3 = 0 THEN 'Large' WHEN generate_series % 3 = 1 THEN 'Medium' ELSE 'Small' END,
  CASE WHEN generate_series % 3 = 0 THEN 300 WHEN generate_series % 3 = 1 THEN 200 ELSE 150 END,
  CASE WHEN generate_series % 3 = 0 THEN 300 WHEN generate_series % 3 = 1 THEN 200 ELSE 150 END,
  250,
  CASE WHEN generate_series % 3 = 0 THEN 450.00 WHEN generate_series % 3 = 1 THEN 280.00 ELSE 180.00 END,
  CASE WHEN generate_series <= 3 THEN 'occupied'::storage_unit_status WHEN generate_series <= 7 THEN 'available'::storage_unit_status ELSE 'reserved'::storage_unit_status END,
  CASE WHEN generate_series % 2 = 0 THEN true ELSE false END
FROM generate_series(1, 10);

-- Warehouse 2 (Changi) - 8 sample units
INSERT INTO storage_units (warehouse_id, unit_number, floor_number, section, size_label, length_cm, width_cm, height_cm, monthly_rate, status) 
SELECT 
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-002'),
  'B' || LPAD(generate_series::text, 3, '0'),
  1,
  'C',
  CASE WHEN generate_series % 2 = 0 THEN 'Medium' ELSE 'Small' END,
  CASE WHEN generate_series % 2 = 0 THEN 200 ELSE 150 END,
  CASE WHEN generate_series % 2 = 0 THEN 200 ELSE 150 END,
  250,
  CASE WHEN generate_series % 2 = 0 THEN 280.00 ELSE 180.00 END,
  CASE WHEN generate_series <= 2 THEN 'occupied'::storage_unit_status ELSE 'available'::storage_unit_status END
FROM generate_series(1, 8);

-- ============================================
-- DEMO STAFF
-- ============================================

-- Note: auth_user_id should be populated after creating users in Supabase Auth
INSERT INTO staff (staff_code, first_name, last_name, email, phone, role, hire_date, is_active) VALUES
('STF-0001', 'Admin', 'User', 'admin@ezstorage.sg', '+65 9000 0001', 'admin', '2024-01-01', true),
('STF-0002', 'Operations', 'Manager', 'ops@ezstorage.sg', '+65 9000 0002', 'operations_manager', '2024-01-15', true),
('STF-0003', 'Warehouse', 'Lead', 'warehouse1@ezstorage.sg', '+65 9000 0003', 'warehouse_staff', '2024-02-01', true),
('STF-0004', 'Driver', 'One', 'driver1@ezstorage.sg', '+65 9000 0004', 'driver', '2024-02-15', true),
('STF-0005', 'Driver', 'Two', 'driver2@ezstorage.sg', '+65 9000 0005', 'driver', '2024-03-01', true),
('STF-0006', 'Finance', 'Staff', 'accounts@ezstorage.sg', '+65 9000 0006', 'accountant', '2024-03-15', true);

-- Update warehouse assignment for warehouse staff
UPDATE staff SET warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001')
WHERE staff_code = 'STF-0003';

-- Update driver details
UPDATE staff SET 
  license_number = 'S1234567A',
  vehicle_number = 'SGX1234A',
  vehicle_type = 'Lorry 10ft'
WHERE staff_code = 'STF-0004';

UPDATE staff SET 
  license_number = 'S7654321B',
  vehicle_number = 'SGX5678B',
  vehicle_type = 'Van'
WHERE staff_code = 'STF-0005';

-- ============================================
-- DEMO ORDERS
-- ============================================

INSERT INTO orders (
  customer_id, 
  assigned_driver_id,
  warehouse_id,
  job_type,
  status,
  scheduled_date,
  scheduled_time_start,
  pickup_address_line1,
  pickup_city,
  pickup_postal_code,
  service_fee,
  priority
) VALUES
-- Order 1: Pending pickup
(
  (SELECT id FROM customers WHERE email = 'john.tan@email.com'),
  NULL,
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001'),
  'pickup',
  'pending',
  CURRENT_DATE + INTERVAL '2 days',
  '10:00:00',
  '123 Orchard Road #10-45',
  'Singapore',
  '238858',
  120.00,
  1
),
-- Order 2: Scheduled pickup (assigned to driver)
(
  (SELECT id FROM customers WHERE email = 'mary.lim@bizco.sg'),
  (SELECT id FROM staff WHERE staff_code = 'STF-0004'),
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001'),
  'pickup',
  'scheduled',
  CURRENT_DATE + INTERVAL '1 day',
  '14:00:00',
  '456 Marina Boulevard Unit 5-6',
  'Singapore',
  '018980',
  180.00,
  2
),
-- Order 3: In transit
(
  (SELECT id FROM customers WHERE email = 'david.w@techstart.io'),
  (SELECT id FROM staff WHERE staff_code = 'STF-0005'),
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-002'),
  'delivery',
  'in_transit',
  CURRENT_DATE,
  '09:00:00',
  '789 Raffles Place',
  'Singapore',
  '048619',
  150.00,
  3
),
-- Order 4: Completed
(
  (SELECT id FROM customers WHERE email = 'sarah.ng@email.com'),
  (SELECT id FROM staff WHERE staff_code = 'STF-0004'),
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001'),
  'pickup',
  'completed',
  CURRENT_DATE - INTERVAL '3 days',
  '11:00:00',
  '321 Bukit Timah Road #03-12',
  'Singapore',
  '259720',
  120.00,
  0
),
-- Order 5: Both pickup and delivery
(
  (SELECT id FROM customers WHERE email = 'michael@trading.sg'),
  (SELECT id FROM staff WHERE staff_code = 'STF-0005'),
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-003'),
  'both',
  'confirmed',
  CURRENT_DATE + INTERVAL '3 days',
  '15:00:00',
  '654 Tanjong Pagar Road',
  'Singapore',
  '088540',
  250.00,
  1
);

-- ============================================
-- ASSIGN STORAGE UNITS TO CUSTOMERS
-- ============================================

UPDATE storage_units SET 
  current_customer_id = (SELECT id FROM customers WHERE email = 'john.tan@email.com'),
  occupied_since = CURRENT_DATE - INTERVAL '30 days'
WHERE unit_number = 'A001' AND warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001');

UPDATE storage_units SET 
  current_customer_id = (SELECT id FROM customers WHERE email = 'mary.lim@bizco.sg'),
  occupied_since = CURRENT_DATE - INTERVAL '60 days'
WHERE unit_number = 'A002' AND warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001');

UPDATE storage_units SET 
  current_customer_id = (SELECT id FROM customers WHERE email = 'david.w@techstart.io'),
  occupied_since = CURRENT_DATE - INTERVAL '45 days'
WHERE unit_number = 'B001' AND warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-002');

-- ============================================
-- DEMO INVENTORY ITEMS
-- ============================================

INSERT INTO inventory_items (
  customer_id,
  storage_unit_id,
  warehouse_id,
  item_name,
  description,
  category,
  quantity,
  received_date,
  is_active
) VALUES
-- John Tan's items
(
  (SELECT id FROM customers WHERE email = 'john.tan@email.com'),
  (SELECT id FROM storage_units WHERE unit_number = 'A001' AND warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001')),
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001'),
  'Office Furniture Set',
  'Desk, chair, filing cabinet',
  'Furniture',
  3,
  CURRENT_DATE - INTERVAL '30 days',
  true
),
(
  (SELECT id FROM customers WHERE email = 'john.tan@email.com'),
  (SELECT id FROM storage_units WHERE unit_number = 'A001' AND warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001')),
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001'),
  'Archive Boxes',
  'Documents 2020-2023',
  'Documents',
  15,
  CURRENT_DATE - INTERVAL '30 days',
  true
),
-- Mary Lim's items
(
  (SELECT id FROM customers WHERE email = 'mary.lim@bizco.sg'),
  (SELECT id FROM storage_units WHERE unit_number = 'A002' AND warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001')),
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001'),
  'IT Equipment',
  'Servers and networking gear',
  'Electronics',
  8,
  CURRENT_DATE - INTERVAL '60 days',
  true
),
-- David Wong's items
(
  (SELECT id FROM customers WHERE email = 'david.w@techstart.io'),
  (SELECT id FROM storage_units WHERE unit_number = 'B001' AND warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-002')),
  (SELECT id FROM warehouses WHERE warehouse_code = 'WH-002'),
  'Marketing Materials',
  'Banners, brochures, promotional items',
  'Marketing',
  20,
  CURRENT_DATE - INTERVAL '45 days',
  true
);

-- ============================================
-- DEMO PAYMENTS
-- ============================================

INSERT INTO payments (
  customer_id,
  storage_unit_id,
  payment_type,
  amount,
  gst_amount,
  total_amount,
  status,
  payment_method,
  invoice_date,
  due_date,
  paid_date
) VALUES
-- Monthly rental - Paid
(
  (SELECT id FROM customers WHERE email = 'john.tan@email.com'),
  (SELECT id FROM storage_units WHERE unit_number = 'A001' AND warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001')),
  'Monthly Rental',
  180.00,
  14.40,
  194.40,
  'completed',
  'online',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '10 days',
  CURRENT_DATE - INTERVAL '3 days'
),
-- Monthly rental - Pending
(
  (SELECT id FROM customers WHERE email = 'mary.lim@bizco.sg'),
  (SELECT id FROM storage_units WHERE unit_number = 'A002' AND warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001')),
  'Monthly Rental',
  280.00,
  22.40,
  302.40,
  'pending',
  NULL,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '15 days',
  NULL
),
-- Order fee - Completed
(
  (SELECT id FROM customers WHERE email = 'sarah.ng@email.com'),
  NULL,
  'Order Fee',
  120.00,
  9.60,
  129.60,
  'completed',
  'card',
  CURRENT_DATE - INTERVAL '3 days',
  CURRENT_DATE - INTERVAL '3 days',
  CURRENT_DATE - INTERVAL '3 days'
),
-- Deposit - Completed
(
  (SELECT id FROM customers WHERE email = 'john.tan@email.com'),
  (SELECT id FROM storage_units WHERE unit_number = 'A001' AND warehouse_id = (SELECT id FROM warehouses WHERE warehouse_code = 'WH-001')),
  'Deposit',
  500.00,
  40.00,
  540.00,
  'completed',
  'bank_transfer',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '30 days'
);

-- Link payments to orders where applicable
UPDATE payments SET order_id = (SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE email = 'sarah.ng@email.com') LIMIT 1)
WHERE payment_type = 'Order Fee';

-- ============================================
-- SUMMARY
-- ============================================

-- Query to verify data
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
SELECT 'Payments', COUNT(*) FROM payments;
