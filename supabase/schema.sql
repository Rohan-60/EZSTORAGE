-- EZSTORAGE Operations Management System - Database Schema
-- PostgreSQL Schema for Supabase
-- Version: 1.0.0

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- ENUMS
-- ============================================

-- Order/Job Types
CREATE TYPE job_type AS ENUM ('pickup', 'delivery', 'both');

-- Order Status
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'scheduled',
  'in_transit',
  'completed',
  'cancelled',
  'failed'
);

-- Payment Status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'partially_refunded'
);

-- Staff Roles
CREATE TYPE staff_role AS ENUM (
  'admin',
  'operations_manager',
  'warehouse_staff',
  'driver',
  'accountant'
);

-- Storage Unit Status
CREATE TYPE storage_unit_status AS ENUM (
  'available',
  'occupied',
  'reserved',
  'maintenance',
  'inactive'
);

-- Payment Methods
CREATE TYPE payment_method AS ENUM (
  'cash',
  'card',
  'bank_transfer',
  'online',
  'wallet'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- 1. CUSTOMERS TABLE
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., CUST-0001
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  
  -- Address
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'Singapore',
  
  -- Business Fields
  company_name VARCHAR(255),
  gst_number VARCHAR(50),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 2. WAREHOUSES TABLE
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., WH-001
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Address
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'Singapore',
  
  -- Location (for maps)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Capacity
  total_units INTEGER NOT NULL DEFAULT 0,
  occupied_units INTEGER DEFAULT 0,
  
  -- Contact
  manager_name VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3. STORAGE UNITS TABLE
CREATE TABLE storage_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  
  -- Unit Information
  unit_number VARCHAR(50) NOT NULL,
  floor_number INTEGER,
  section VARCHAR(50),
  
  -- Dimensions
  size_label VARCHAR(50), -- e.g., "Small", "Medium", "Large"
  length_cm DECIMAL(10, 2),
  width_cm DECIMAL(10, 2),
  height_cm DECIMAL(10, 2),
  volume_cubic_meters DECIMAL(10, 2),
  
  -- Pricing
  monthly_rate DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status storage_unit_status DEFAULT 'available',
  current_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  occupied_since TIMESTAMPTZ,
  
  -- Features
  climate_controlled BOOLEAN DEFAULT false,
  has_electricity BOOLEAN DEFAULT false,
  
  -- Metadata
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Unique constraint: unit number must be unique within warehouse
  UNIQUE(warehouse_id, unit_number)
);

-- 4. STAFF TABLE
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE, -- Links to Supabase auth.users
  staff_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., STF-0001
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  -- Role & Assignment
  role staff_role NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  
  -- Driver-specific fields
  license_number VARCHAR(50),
  vehicle_number VARCHAR(50),
  vehicle_type VARCHAR(100),
  
  -- Employment
  hire_date DATE NOT NULL,
  employment_status VARCHAR(50) DEFAULT 'active',
  
  -- Address
  address TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 5. ORDERS TABLE (Pickup/Delivery Jobs)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(30) UNIQUE NOT NULL, -- e.g., ORD-2026-0001
  
  -- Customer & Assignment
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  assigned_driver_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  storage_unit_id UUID REFERENCES storage_units(id) ON DELETE SET NULL,
  
  -- Order Type & Status
  job_type job_type NOT NULL,
  status order_status DEFAULT 'pending',
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  
  -- Pickup Address (if different from customer address)
  pickup_address_line1 VARCHAR(255),
  pickup_address_line2 VARCHAR(255),
  pickup_city VARCHAR(100),
  pickup_postal_code VARCHAR(20),
  pickup_latitude DECIMAL(10, 8),
  pickup_longitude DECIMAL(11, 8),
  
  -- Delivery Address
  delivery_address_line1 VARCHAR(255),
  delivery_address_line2 VARCHAR(255),
  delivery_city VARCHAR(100),
  delivery_postal_code VARCHAR(20),
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  
  -- Items & Pricing
  estimated_items_count INTEGER DEFAULT 0,
  actual_items_count INTEGER DEFAULT 0,
  service_fee DECIMAL(10, 2) DEFAULT 0,
  
  -- Proof & Notes
  proof_image_url TEXT,
  customer_signature_url TEXT,
  driver_notes TEXT,
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- Priority
  priority INTEGER DEFAULT 0, -- Higher = more urgent
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 6. INVENTORY ITEMS TABLE
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Ownership & Location
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  storage_unit_id UUID REFERENCES storage_units(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  
  -- Item Details
  item_code VARCHAR(50),
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  
  -- Quantity & Dimensions
  quantity INTEGER DEFAULT 1,
  weight_kg DECIMAL(10, 2),
  
  -- Tracking
  barcode VARCHAR(100),
  qr_code VARCHAR(255),
  
  -- Images
  image_url TEXT,
  
  -- Condition
  condition VARCHAR(50), -- e.g., "Good", "Fair", "Damaged"
  
  -- Dates
  received_date DATE,
  expected_retrieval_date DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 7. PAYMENTS TABLE
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number VARCHAR(30) UNIQUE NOT NULL, -- e.g., PAY-2026-0001
  
  -- Related Entities
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  storage_unit_id UUID REFERENCES storage_units(id) ON DELETE SET NULL,
  
  -- Payment Information
  payment_type VARCHAR(50) NOT NULL, -- e.g., "Order Fee", "Monthly Rental", "Deposit"
  amount DECIMAL(10, 2) NOT NULL,
  gst_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Status & Method
  status payment_status DEFAULT 'pending',
  payment_method payment_method,
  
  -- Dates
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  
  -- Transaction Details
  transaction_id VARCHAR(255),
  payment_reference VARCHAR(255),
  
  -- Refund Information
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  refund_date DATE,
  refund_reason TEXT,
  
  -- Invoice
  invoice_url TEXT,
  receipt_url TEXT,
  
  -- Metadata
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Who & What
  user_id UUID, -- Supabase auth.users id
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- e.g., "CREATE", "UPDATE", "DELETE", "STATUS_CHANGE"
  
  -- Target
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  
  -- Details
  old_values JSONB,
  new_values JSONB,
  changes JSONB, -- Specific fields that changed
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  description TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_active ON customers(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_code ON customers(customer_code);

-- Warehouses
CREATE INDEX idx_warehouses_active ON warehouses(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_warehouses_code ON warehouses(warehouse_code);

-- Storage Units
CREATE INDEX idx_storage_units_warehouse ON storage_units(warehouse_id);
CREATE INDEX idx_storage_units_customer ON storage_units(current_customer_id);
CREATE INDEX idx_storage_units_status ON storage_units(status);
CREATE INDEX idx_storage_units_active ON storage_units(warehouse_id, status) WHERE deleted_at IS NULL;

-- Staff
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_warehouse ON staff(warehouse_id);
CREATE INDEX idx_staff_active ON staff(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_staff_auth_user ON staff(auth_user_id);

-- Orders
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_driver ON orders(assigned_driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_scheduled_date ON orders(scheduled_date);
CREATE INDEX idx_orders_warehouse ON orders(warehouse_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_active ON orders(status, scheduled_date) WHERE deleted_at IS NULL;

-- Inventory Items
CREATE INDEX idx_inventory_customer ON inventory_items(customer_id);
CREATE INDEX idx_inventory_storage_unit ON inventory_items(storage_unit_id);
CREATE INDEX idx_inventory_warehouse ON inventory_items(warehouse_id);
CREATE INDEX idx_inventory_active ON inventory_items(is_active) WHERE deleted_at IS NULL;

-- Payments
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_number ON payments(payment_number);

-- Audit Logs
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_staff ON audit_logs(staff_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Text search indexes
CREATE INDEX idx_customers_name_trgm ON customers USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_inventory_name_trgm ON inventory_items USING gin (item_name gin_trgm_ops);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_units_updated_at BEFORE UPDATE ON storage_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate customer code
CREATE OR REPLACE FUNCTION generate_customer_code()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(customer_code FROM 6) AS INTEGER)), 0) + 1 
  INTO next_number 
  FROM customers;
  
  NEW.customer_code := 'CUST-' || LPAD(next_number::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_customer_code BEFORE INSERT ON customers
  FOR EACH ROW 
  WHEN (NEW.customer_code IS NULL)
  EXECUTE FUNCTION generate_customer_code();

-- Function to auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  current_year TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 10) AS INTEGER)), 0) + 1 
  INTO next_number 
  FROM orders 
  WHERE order_number LIKE 'ORD-' || current_year || '-%';
  
  NEW.order_number := 'ORD-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_order_number BEFORE INSERT ON orders
  FOR EACH ROW 
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Function to auto-generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  current_year TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 10) AS INTEGER)), 0) + 1 
  INTO next_number 
  FROM payments 
  WHERE payment_number LIKE 'PAY-' || current_year || '-%';
  
  NEW.payment_number := 'PAY-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_payment_number BEFORE INSERT ON payments
  FOR EACH ROW 
  WHEN (NEW.payment_number IS NULL)
  EXECUTE FUNCTION generate_payment_number();

-- Function to update warehouse occupied units count
CREATE OR REPLACE FUNCTION update_warehouse_occupancy()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE warehouses 
    SET occupied_units = (
      SELECT COUNT(*) 
      FROM storage_units 
      WHERE warehouse_id = NEW.warehouse_id 
        AND status = 'occupied'
        AND deleted_at IS NULL
    )
    WHERE id = NEW.warehouse_id;
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE warehouses 
    SET occupied_units = (
      SELECT COUNT(*) 
      FROM storage_units 
      WHERE warehouse_id = OLD.warehouse_id 
        AND status = 'occupied'
        AND deleted_at IS NULL
    )
    WHERE id = OLD.warehouse_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_warehouse_occupancy_trigger
AFTER INSERT OR UPDATE OR DELETE ON storage_units
FOR EACH ROW EXECUTE FUNCTION update_warehouse_occupancy();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  staff_id_val UUID;
BEGIN
  -- Get current user ID from Supabase auth
  user_id_val := auth.uid();
  
  -- Try to get staff_id if exists
  SELECT id INTO staff_id_val FROM staff WHERE auth_user_id = user_id_val;
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      user_id, staff_id, action, table_name, record_id, 
      old_values, description
    ) VALUES (
      user_id_val, staff_id_val, 'DELETE', TG_TABLE_NAME, OLD.id,
      row_to_json(OLD), 'Record deleted'
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      user_id, staff_id, action, table_name, record_id,
      old_values, new_values, description
    ) VALUES (
      user_id_val, staff_id_val, 'UPDATE', TG_TABLE_NAME, NEW.id,
      row_to_json(OLD), row_to_json(NEW), 'Record updated'
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      user_id, staff_id, action, table_name, record_id,
      new_values, description
    ) VALUES (
      user_id_val, staff_id_val, 'CREATE', TG_TABLE_NAME, NEW.id,
      row_to_json(NEW), 'Record created'
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to critical tables
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_storage_units AFTER INSERT OR UPDATE OR DELETE ON storage_units
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE customers IS 'Customer accounts and contact information';
COMMENT ON TABLE warehouses IS 'Physical warehouse locations';
COMMENT ON TABLE storage_units IS 'Individual storage units within warehouses';
COMMENT ON TABLE staff IS 'Staff members including drivers, warehouse staff, and admins';
COMMENT ON TABLE orders IS 'Pickup and delivery job orders';
COMMENT ON TABLE inventory_items IS 'Items stored in units';
COMMENT ON TABLE payments IS 'Payment transactions and invoices';
COMMENT ON TABLE audit_logs IS 'System audit trail for security and compliance';
