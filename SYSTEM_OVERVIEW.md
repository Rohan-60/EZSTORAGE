# 🏢 EZSTORAGE System Overview

## What Is EZSTORAGE?

**EZSTORAGE** is a complete **Warehouse & Storage Operations Management System**. 

Think of it as software for running a business like:
- **Self-storage facilities** (like Extra Space Storage or Public Storage)
- **Moving & logistics companies** (pickup and delivery services)
- **Warehouse operations** (inventory tracking and management)

---

## 🎯 How It Works - Complete Flow

### Customer Journey:

1. **Customer signs up** → Creates account (stored in `customers` table)
2. **Customer requests service** → Creates an order for pickup/delivery (stored in `orders` table)
3. **Operations manager** → Assigns a driver and warehouse (updates `orders` table)
4. **Driver** → Picks up items from customer and delivers to warehouse
5. **Warehouse staff** → Receives items, assigns a storage unit (creates `inventory_items`)
6. **Items stored** → Customer pays monthly rental (tracked in `payments` table)
7. **Customer wants items back** → Creates delivery order
8. **Driver** → Picks up from warehouse and delivers to customer

---

## 👥 User Roles & What They Do

| Role | Dashboard | Permissions | Main Tasks |
|------|-----------|-------------|------------|
| **Admin** | `/dashboard/admin` | Everything | System management, view all data, reports |
| **Operations Manager** | `/dashboard/operations` | Manage orders, customers | Schedule jobs, assign drivers, customer service |
| **Warehouse Staff** | `/dashboard/warehouse` | Manage storage & inventory | Assign storage units, track items, manage warehouse |
| **Driver** | `/dashboard/driver` | View assigned jobs | View pickup/delivery tasks, update job status |
| **Accountant** | `/dashboard/accounts` | Manage payments | Process payments, generate invoices, refunds |

---

## 🗄️ DATABASE TABLES EXPLAINED

### 1️⃣ **CUSTOMERS** Table
**Purpose:** Store all customer information

**What it stores:**
- Customer code (e.g., CUST-0001)
- Personal info (name, email, phone)
- Address (for pickups/deliveries)
- Company info (for business customers)
- Notes about special requirements

**Used by:**
- Operations Manager: Creating orders
- All staff: Looking up customer details
- Accountant: Billing and invoicing

**Example record:**
```
CUST-0001
John Tan
john.tan@email.com
+65 9123 4567
123 Orchard Road, Singapore 238858
```

---

### 2️⃣ **WAREHOUSES** Table
**Purpose:** Store information about physical warehouse locations

**What it stores:**
- Warehouse code (e.g., WH-001)
- Name & address
- GPS coordinates (for driver navigation)
- Total units available
- Contact phone number

**Used by:**
- Admin: Managing warehouse locations
- Warehouse Staff: Checking capacity
- Operations: Assigning storage locations
- Drivers: Navigation to warehouse

**Example record:**
```
WH-001
Tuas Mega Storage
10 Tuas Avenue 20, Singapore 638824
100 total units, 45 occupied
+65 6555 1001
```

---

### 3️⃣ **STORAGE_UNITS** Table
**Purpose:** Track individual storage spaces within warehouses

**What it stores:**
- Unit number (e.g., A-001, B-102)
- Size (Small, Medium, Large)
- Dimensions (length × width × height in cm)
- Monthly rental rate
- Status (available, occupied, reserved, maintenance)
- Which customer is using it
- Climate control availability

**Used by:**
- Warehouse Staff: Assigning units to customers
- Operations: Checking availability
- Accountant: Calculating rental fees

**Example record:**
```
Unit: A-001
Warehouse: WH-001 (Tuas)
Size: Medium (200×200×250 cm)
Rate: $280/month
Status: Occupied by CUST-0001
Climate Controlled: Yes
```

---

### 4️⃣ **STAFF** Table
**Purpose:** Store employee information and roles

**What it stores:**
- Staff code (e.g., STF-0001)
- Personal info (name, email, phone)
- Role (admin, operations_manager, warehouse_staff, driver, accountant)
- For drivers: license number, vehicle info
- Authentication link (connects to login system)

**Used by:**
- Admin: Managing employees
- Operations: Assigning drivers to orders
- System: Checking permissions (who can do what)

**Example records:**
```
STF-0001 - Admin User (admin)
STF-0002 - Operations Manager (operations_manager)
STF-0003 - Warehouse Lead (warehouse_staff)
STF-0004 - Driver One (driver) - Vehicle: SGX1234A
STF-0005 - Finance Staff (accountant)
```

---

### 5️⃣ **ORDERS** Table
**Purpose:** Track all pickup/delivery jobs

**What it stores:**
- Order number (e.g., ORD-2026-0001)
- Customer ID (who ordered)
- Job type (pickup, delivery, or both)
- Status (pending → confirmed → scheduled → in_transit → completed)
- Scheduled date/time
- Pickup address (where to collect items)
- Delivery address (where to drop off)
- Assigned driver
- Assigned warehouse/storage unit
- Service fee
- Notes (special instructions)
- Proof of delivery (photos, signatures)

**Used by:**
- Operations: Creating and managing jobs
- Drivers: Viewing assigned tasks
- Warehouse Staff: Preparing items for delivery
- Admin: Monitoring all operations

**Example order:**
```
ORD-2026-0001
Customer: CUST-0001 (John Tan)
Job Type: Pickup
Status: Scheduled
Date: 2026-02-15 @ 2:00 PM
Pickup: 123 Orchard Road
Deliver to: WH-001 (Tuas)
Assigned Driver: STF-0004
Service Fee: $150.00
Notes: "Heavy furniture, need 2 helpers"
```

---

### 6️⃣ **INVENTORY_ITEMS** Table
**Purpose:** Track every item stored in the warehouse

**What it stores:**
- Item description (e.g., "Sofa", "Boxes of books")
- Barcode/SKU for scanning
- Category (furniture, electronics, documents, etc.)
- Customer who owns it
- Which storage unit it's in
- Which warehouse
- Quantity
- Estimated value (for insurance)
- Condition notes
- Photos

**Used by:**
- Warehouse Staff: Recording received items
- Operations: Checking what's stored
- Customers: Viewing their items (future feature)

**Example items:**
```
Item #1: Brown Leather Sofa
Customer: CUST-0001
Location: WH-001, Unit A-001
Quantity: 1
Value: $1,500
Condition: Good, minor wear

Item #2: Boxes of Books (Fiction)
Customer: CUST-0001
Location: WH-001, Unit A-001
Quantity: 15 boxes
Value: $300
```

---

### 7️⃣ **PAYMENTS** Table
**Purpose:** Track all financial transactions

**What it stores:**
- Payment reference number
- Customer ID
- Related order (if payment is for a service)
- Amount
- Payment status (pending → completed)
- Payment method (cash, card, bank transfer)
- Payment date
- Invoice details
- Refund information (if applicable)

**Used by:**
- Accountant: Processing payments and invoicing
- Operations: Checking payment status before service
- Admin: Financial reporting

**Example payment:**
```
PAY-2026-0001
Customer: CUST-0001
Order: ORD-2026-0001 (Pickup service)
Amount: $150.00
Method: Credit Card
Status: Completed
Date: 2026-02-14
```

---

### 8️⃣ **AUDIT_LOGS** Table
**Purpose:** Record all important system activities (for security/compliance)

**What it stores:**
- Who did something (staff member)
- What they did (created order, updated customer, deleted record)
- Which table was affected
- Which record was changed
- When it happened
- Old value vs new value (for updates)

**Used by:**
- Admin: Security monitoring
- Compliance: Audit trails
- Debugging: Finding what went wrong

**Example logs:**
```
2026-02-14 10:30:00 - STF-0002 created order ORD-2026-0001
2026-02-14 10:35:00 - STF-0002 assigned driver STF-0004 to ORD-2026-0001
2026-02-14 14:00:00 - STF-0004 updated order ORD-2026-0001 status to "in_transit"
2026-02-14 16:00:00 - STF-0003 created inventory item INV-0001 in unit A-001
```

---

## 🔄 How Tables Connect (Relationships)

```
CUSTOMERS (John Tan)
    ↓ creates
ORDERS (Pickup request)
    ↓ assigned to
STAFF (Driver)
    ↓ delivers to
WAREHOUSES (Tuas Warehouse)
    ↓ contains
STORAGE_UNITS (Unit A-001)
    ↓ stores
INVENTORY_ITEMS (John's furniture)
    ↓ billed via
PAYMENTS (Monthly rental fee)
```

---

## 📱 How Each Dashboard Uses The Tables

### **Admin Dashboard** (`/dashboard/admin`)
- Views: ALL tables
- Shows: Revenue (from payments), active orders, warehouse utilization
- Can: Manage everything

### **Operations Dashboard** (`/dashboard/operations`)  
- Views: customers, orders, staff, warehouses
- Main tasks:
  - Create new orders
  - Assign drivers to orders
  - Update order status
  - Manage customers

### **Warehouse Dashboard** (`/dashboard/warehouse`)
- Views: storage_units, inventory_items, warehouses
- Main tasks:
  - Assign storage units to customers
  - Add received items to inventory
  - Check unit availability
  - Mark units for maintenance

### **Driver Dashboard** (`/dashboard/driver`)
- Views: orders (only their assigned ones)
- Main tasks:
  - See today's pickup/delivery jobs
  - Update job status (started, completed)
  - Upload proof of delivery photos
  - Add delivery notes

### **Accounts Dashboard** (`/dashboard/accounts`)
- Views: payments, customers, orders
- Main tasks:
  - Process payments
  - Generate invoices
  - Issue refunds
  - View financial reports

---

## 🎨 Key Features

1. **Real-time Updates**: Changes appear immediately across all dashboards
2. **Role-Based Security**: Users only see what they're allowed to see
3. **Mobile Friendly**: Drivers can use it on phones in the field
4. **Search & Filter**: Find customers, orders, units quickly
5. **Automated Codes**: System generates customer codes, order numbers automatically
6. **Status Tracking**: Know exactly where each order is in the process

---

## 📊 Example Business Scenario

**Monday Morning:**
1. Customer calls → Operations creates order (pickup at 2 PM)
2. Operations assigns Driver #1 → Driver sees it on mobile app
3. Driver picks up items → Updates status to "in transit"
4. Driver arrives at warehouse → Warehouse staff receives items
5. Warehouse staff assigns Unit A-001 → Creates inventory records
6. System generates invoice → Accountant processes payment
7. Customer pays → Status updated to "completed"

**Every action is recorded, secure, and traceable!**

---

## 🔐 Security Features

- **Row Level Security (RLS)**: Database enforces "you can only see YOUR data"
- **Authentication**: Login required for all operations
- **Audit Trail**: Every change is logged with who/what/when
- **Role Permissions**: Drivers can't see payments, accountants can't assign drivers
- **Soft Deletes**: Records marked as deleted, not actually removed (for safety)

---

## 🚀 Technology

- **Frontend**: Next.js + React + TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS (yellow & white theme)
- **Real-time**: Supabase subscriptions
- **Hosting**: Can deploy on Vercel

---

**In summary:** EZSTORAGE is a complete business management system for storage and logistics companies. Every part of the business - from customer signup to item delivery to payment processing - is tracked in the database and managed through specialized dashboards for different user roles. 🎯
