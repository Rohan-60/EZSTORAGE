-- Add Test Customers for EZSTORAGE
-- Run this in Supabase SQL Editor to add 3 test customers

-- Customer 1: John Smith
INSERT INTO customers (
    customer_code,
    first_name,
    last_name,
    email,
    phone,
    address_line1,
    city,
    postal_code
) VALUES (
    'CUST-001',
    'John',
    'Smith',
    'john.smith@example.com',
    '+65 9123 4567',
    '123 Orchard Road',
    'Singapore',
    '238888'
);

-- Customer 2: Sarah Johnson (Business)
INSERT INTO customers (
    customer_code,
    first_name,
    last_name,
    email,
    phone,
    address_line1,
    city,
    postal_code,
    company_name
) VALUES (
    'CUST-002',
    'Sarah',
    'Johnson',
    'sarah.j@company.com',
    '+65 9234 5678',
    '456 Business Park',
    'Singapore',
    '123456',
    'ABC Trading Pte Ltd'
);

-- Customer 3: Mike Chen
INSERT INTO customers (
    customer_code,
    first_name,
    last_name,
    email,
    phone,
    address_line1,
    city,
    postal_code
) VALUES (
    'CUST-003',
    'Mike',
    'Chen',
    'mike.chen@email.com',
    '+65 9345 6789',
    '789 Marine Parade',
    'Singapore',
    '449654'
);

-- Verify customers were added
SELECT 
    customer_code,
    first_name,
    last_name,
    email,
    company_name
FROM customers
ORDER BY created_at DESC;
