-- ============================================
-- EZSTORAGE - Complete Database Setup Script
-- ============================================
-- This script sets up the entire database in the correct order
-- It's safe to run multiple times (idempotent where possible)
-- 
-- Run this in: Supabase SQL Editor
-- Direct link: https://supabase.com/dashboard/project/xoptdmugsgcmrhemsxed/sql

-- ============================================
-- STEP 1: ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- STEP 2: CREATE ENUMS (only if they don't exist)
-- ============================================

DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('pickup', 'delivery', 'both');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'scheduled', 'in_transit',
    'completed', 'cancelled', 'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending', 'processing', 'completed',
    'failed', 'refunded', 'partially_refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM (
    'admin', 'operations_manager', 'warehouse_staff',
    'driver', 'accountant'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE storage_unit_status AS ENUM (
    'available', 'occupied', 'reserved',
    'maintenance', 'inactive'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM (
    'cash', 'card', 'bank_transfer', 'online', 'wallet'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 3: VERIFICATION QUERY
-- ============================================
-- Check what already exists
SELECT 
  'Current Status' as info,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customers') as customers_table_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'staff') as staff_table_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') as orders_table_exists;

-- ============================================
-- NOTE TO USER
-- ============================================
-- If the verification query above shows tables already exist (value = 1),
-- you can skip to the RLS policies section or auth user setup.
-- 
-- If tables DON'T exist yet (value = 0), continue with the next steps:
-- 1. Run the full schema.sql file
-- 2. Then run rls_policies.sql
-- 3. Then run seed.sql (optional, for demo data)
-- 4. Then run link_auth_users.sql (to connect auth to staff)

-- ============================================
-- QUICK STATUS CHECK QUERIES
-- ============================================

-- Check if tables exist
SELECT 
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'customers', 'warehouses', 'storage_units', 'staff',
    'orders', 'inventory_items', 'payments', 'audit_logs'
  )
ORDER BY table_name;

-- If tables exist, check row counts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    RAISE NOTICE '📊 TABLE ROW COUNTS:';
    RAISE NOTICE 'Customers: %', (SELECT COUNT(*) FROM customers);
    RAISE NOTICE 'Warehouses: %', (SELECT COUNT(*) FROM warehouses);
    RAISE NOTICE 'Storage Units: %', (SELECT COUNT(*) FROM storage_units);
    RAISE NOTICE 'Staff: %', (SELECT COUNT(*) FROM staff);
    RAISE NOTICE 'Orders: %', (SELECT COUNT(*) FROM orders);
    RAISE NOTICE 'Inventory Items: %', (SELECT COUNT(*) FROM inventory_items);
    RAISE NOTICE 'Payments: %', (SELECT COUNT(*) FROM payments);
    RAISE NOTICE 'Audit Logs: %', (SELECT COUNT(*) FROM audit_logs);
  ELSE
    RAISE NOTICE '⚠️  Tables not created yet. Run schema.sql first.';
  END IF;
END $$;

-- Check RLS status
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'customers', 'warehouses', 'storage_units', 'staff',
    'orders', 'inventory_items', 'payments', 'audit_logs'
  )
ORDER BY tablename;

-- Check auth user linking
SELECT 
  s.staff_code,
  s.email,
  s.role,
  CASE 
    WHEN s.auth_user_id IS NOT NULL THEN '✅ Linked'
    ELSE '❌ Not Linked'
  END as auth_status
FROM staff s
ORDER BY s.role;
