-- ============================================================
-- EZSTORAGE Phase 1 — Sample Data Seed
-- Run in Supabase SQL Editor to populate test data
-- ============================================================

-- ============================================================
-- SAMPLE CUSTOMERS
-- ============================================================
INSERT INTO customers (customer_code, first_name, last_name, phone, email, address_line1, city, postal_code, notes, is_active)
VALUES
  ('CUST-0001', 'Rohan',   'Mehta',    '+65 9111 2233', 'rohan@example.com',   '12 Orchard Road #05-10',     'Singapore', '238801', 'VIP client',           true),
  ('CUST-0002', 'Priya',   'Sharma',   '+65 9222 3344', 'priya@example.com',   '45 Bukit Timah Road #02-05', 'Singapore', '229853', NULL,                   true),
  ('CUST-0003', 'Jason',   'Tan',      '+65 9333 4455', 'jason@example.com',   '88 Clementi Ave 3 #12-01',   'Singapore', '129853', 'Needs weekend slots',  true),
  ('CUST-0004', 'Mei Lin', 'Lim',      '+65 9444 5566', NULL,                  '3 Tampines Central #08-22',  'Singapore', '529540', NULL,                   true),
  ('CUST-0005', 'Arjun',   'Nair',     '+65 9555 6677', 'arjun@example.com',   '77 Pasir Ris Drive 6 #04-11','Singapore', '518786', 'Large storage needed', true)
ON CONFLICT (customer_code) DO NOTHING;

-- ============================================================
-- SAMPLE JOBS  (spread across all 5 kanban columns)
-- customer_id pulled by code so order of inserts doesn't matter
-- ============================================================
INSERT INTO jobs (job_number, customer_id, size_plan, job_type, pickup_address, pickup_timing, destination_address, destination_timing, stopover, storage_location, volume, assigned_vendor, kanban_column, internal_notes)
VALUES
  (
    'JOB-2026-0001',
    (SELECT id FROM customers WHERE customer_code = 'CUST-0001'),
    '3-Room HDB', 'Move',
    '12 Orchard Road #05-10, Singapore 238801',
    NOW() + INTERVAL '2 days',
    '45 Bukit Timah Road #02-05, Singapore 229853',
    NOW() + INTERVAL '2 days 4 hours',
    NULL, 'WH-A Unit 12', '45 cbm',
    'Jean', 'deals_closed',
    'Customer requested morning slot'
  ),
  (
    'JOB-2026-0002',
    (SELECT id FROM customers WHERE customer_code = 'CUST-0002'),
    '4-Room HDB', 'Move',
    '45 Bukit Timah Road #02-05, Singapore 229853',
    NOW() + INTERVAL '3 days',
    '88 Clementi Ave 3 #12-01, Singapore 129853',
    NOW() + INTERVAL '3 days 3 hours',
    'Petrol station at Dunearn Road', 'WH-B Unit 5', '60 cbm',
    'GSX', 'scheduled',
    NULL
  ),
  (
    'JOB-2026-0003',
    (SELECT id FROM customers WHERE customer_code = 'CUST-0003'),
    '5-Room HDB', 'Store',
    '88 Clementi Ave 3 #12-01, Singapore 129853',
    NOW() - INTERVAL '1 day',
    NULL, NULL,
    NULL, 'WH-A Unit 7', '80 cbm',
    'MoveMove', 'enroute',
    'Items going to storage only'
  ),
  (
    'JOB-2026-0004',
    (SELECT id FROM customers WHERE customer_code = 'CUST-0004'),
    'Studio', 'Dispose',
    '3 Tampines Central #08-22, Singapore 529540',
    NOW() - INTERVAL '2 days',
    'Recycling Centre, 30 Tuas South Ave 7',
    NOW() - INTERVAL '2 days' + INTERVAL '2 hours',
    NULL, NULL, '10 cbm',
    'Jean', 'inbound',
    'Bulky items — coordinate with driver'
  ),
  (
    'JOB-2026-0005',
    (SELECT id FROM customers WHERE customer_code = 'CUST-0005'),
    '3-Room HDB', 'Move',
    '77 Pasir Ris Drive 6 #04-11, Singapore 518786',
    NOW() - INTERVAL '5 days',
    '12 Orchard Road #10-01, Singapore 238801',
    NOW() - INTERVAL '5 days' + INTERVAL '3 hours',
    NULL, NULL, '50 cbm',
    'GSX', 'completed',
    'Completed without issues'
  ),
  (
    'JOB-2026-0006',
    (SELECT id FROM customers WHERE customer_code = 'CUST-0001'),
    '2-Room Flexi', 'Store',
    '12 Orchard Road #05-10, Singapore 238801',
    NOW() + INTERVAL '7 days',
    NULL, NULL,
    NULL, 'WH-C Unit 3', '20 cbm',
    'MoveMove', 'deals_closed',
    'Second job for same customer'
  )
ON CONFLICT (job_number) DO NOTHING;
