-- ============================================================
-- EZSTORAGE Phase 1 — Complete New Database Setup
-- Run this ONCE in your new Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM (
    'admin',
    'operations_manager',
    'warehouse_staff',
    'driver',
    'accountant'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE phase1_job_type AS ENUM ('Move', 'Store', 'Dispose', 'Other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE kanban_column AS ENUM (
    'deals_closed','scheduled','enroute','inbound','completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_vendor AS ENUM ('Jean', 'GSX', 'MoveMove', 'Other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. SHARED: updated_at TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_code  VARCHAR(20) UNIQUE NOT NULL,   -- e.g. CUST-0001
  first_name     VARCHAR(100) NOT NULL,
  last_name      VARCHAR(100) NOT NULL,
  email          VARCHAR(255),
  phone          VARCHAR(20) NOT NULL,
  address_line1  VARCHAR(255),
  city           VARCHAR(100),
  postal_code    VARCHAR(20),
  country        VARCHAR(100) DEFAULT 'Singapore',
  is_active      BOOLEAN DEFAULT true,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);

-- Auto-generate customer_code
CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(customer_code FROM 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM customers
  WHERE customer_code LIKE 'CUST-%';

  NEW.customer_code := 'CUST-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_customer_code ON customers;
CREATE TRIGGER auto_customer_code
  BEFORE INSERT ON customers
  FOR EACH ROW
  WHEN (NEW.customer_code IS NULL OR NEW.customer_code = '')
  EXECUTE FUNCTION generate_customer_code();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_customers_deleted  ON customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_customers_name     ON customers(last_name, first_name);

-- ============================================================
-- 5. STAFF TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id        UUID UNIQUE,           -- Links to Supabase auth.users
  staff_code          VARCHAR(20) UNIQUE NOT NULL, -- e.g. STF-0001
  first_name          VARCHAR(100) NOT NULL,
  last_name           VARCHAR(100) NOT NULL,
  email               VARCHAR(255) UNIQUE NOT NULL,
  phone               VARCHAR(20) NOT NULL DEFAULT 'TBD',
  role                staff_role NOT NULL DEFAULT 'warehouse_staff',
  hire_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active           BOOLEAN DEFAULT true,
  address             TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

-- Auto-generate staff_code
CREATE OR REPLACE FUNCTION generate_staff_code()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(staff_code FROM 5) AS INTEGER)), 0) + 1
  INTO next_num
  FROM staff
  WHERE staff_code LIKE 'STF-%';

  NEW.staff_code := 'STF-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_staff_code ON staff;
CREATE TRIGGER auto_staff_code
  BEFORE INSERT ON staff
  FOR EACH ROW
  WHEN (NEW.staff_code IS NULL OR NEW.staff_code = '')
  EXECUTE FUNCTION generate_staff_code();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. JOBS TABLE (Phase 1)
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number          VARCHAR(30) UNIQUE,          -- e.g. JOB-2026-0001
  customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  size_plan           VARCHAR(255),
  job_type            phase1_job_type NOT NULL DEFAULT 'Move',
  pickup_address      TEXT,
  pickup_timing       TIMESTAMPTZ,
  destination_address TEXT,
  destination_timing  TIMESTAMPTZ,
  stopover            TEXT,
  storage_location    VARCHAR(255),
  volume              VARCHAR(100),
  assigned_vendor     job_vendor DEFAULT 'Other',
  kanban_column       kanban_column NOT NULL DEFAULT 'deals_closed',
  internal_notes      TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate job_number
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num  INTEGER;
  curr_year TEXT;
BEGIN
  curr_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

  SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 10) AS INTEGER)), 0) + 1
  INTO next_num
  FROM jobs
  WHERE job_number LIKE 'JOB-' || curr_year || '-%';

  NEW.job_number := 'JOB-' || curr_year || '-' || LPAD(next_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_job_number ON jobs;
CREATE TRIGGER auto_job_number
  BEFORE INSERT ON jobs
  FOR EACH ROW
  WHEN (NEW.job_number IS NULL)
  EXECUTE FUNCTION generate_job_number();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_jobs_customer      ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_kanban        ON jobs(kanban_column);
CREATE INDEX IF NOT EXISTS idx_jobs_vendor        ON jobs(assigned_vendor);
CREATE INDEX IF NOT EXISTS idx_jobs_pickup_timing ON jobs(pickup_timing);
CREATE INDEX IF NOT EXISTS idx_jobs_created       ON jobs(created_at DESC);

-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- CUSTOMERS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_customers" ON customers;
DROP POLICY IF EXISTS "auth_insert_customers" ON customers;
DROP POLICY IF EXISTS "auth_update_customers" ON customers;
DROP POLICY IF EXISTS "auth_delete_customers" ON customers;

CREATE POLICY "auth_select_customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_customers" ON customers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_customers" ON customers FOR DELETE TO authenticated USING (true);

-- STAFF
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_staff" ON staff;
DROP POLICY IF EXISTS "auth_insert_staff" ON staff;
DROP POLICY IF EXISTS "auth_update_staff" ON staff;
DROP POLICY IF EXISTS "auth_delete_staff" ON staff;

CREATE POLICY "auth_select_staff" ON staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_staff" ON staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_staff" ON staff FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_staff" ON staff FOR DELETE TO authenticated USING (true);

-- JOBS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_select_jobs" ON jobs;
DROP POLICY IF EXISTS "auth_insert_jobs" ON jobs;
DROP POLICY IF EXISTS "auth_update_jobs" ON jobs;
DROP POLICY IF EXISTS "auth_delete_jobs" ON jobs;

CREATE POLICY "auth_select_jobs" ON jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_jobs" ON jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_jobs" ON jobs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth_delete_jobs" ON jobs FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 8. FIRST ADMIN USER
-- ============================================================
-- After running this SQL:
-- 1. Go to Supabase Dashboard → Authentication → Users → "Add user"
-- 2. Create your admin account (e.g. admin@ezstorage.com)
-- 3. Then run the INSERT below, replacing the auth_user_id with
--    the UUID shown on the user row in Authentication → Users:
--
-- INSERT INTO staff (auth_user_id, staff_code, first_name, last_name, email, phone, role)
-- VALUES (
--   'PASTE-AUTH-USER-UUID-HERE',
--   'STF-0001',
--   'Admin',
--   'User',
--   'admin@ezstorage.com',
--   '+65 0000 0000',
--   'admin'
-- );

-- ============================================================
-- DONE — all tables, triggers, indexes, and RLS policies created
-- ============================================================
