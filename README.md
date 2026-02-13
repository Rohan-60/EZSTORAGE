# EZSTORAGE - Operations Management System

![EZSTORAGE](https://img.shields.io/badge/EZSTORAGE-OMS-FDB913?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)

A professional, enterprise-grade **Operations Management System** for logistics and storage companies. Built with modern web technologies and designed for scalability.

## ✨ Features

### 🎯 Core Modules

- **Customer Management**: Complete customer profiles with contact info and order history
- **Order Management**: Pickup and delivery job scheduling with real-time status tracking
- **Warehouse Management**: Visual storage unit allocation with capacity monitoring
- **Inventory Tracking**: Item-level tracking with barcodes and storage location
- **Driver Management**: Mobile-optimized interface for field operations
- **Payment Processing**: Invoice generation, payment tracking, and refund management
- **Audit Logging**: Complete activity trail for security and compliance

### 🔐 Security & Authentication

- **Row Level Security (RLS)**: Database-level access control
- **Role-Based Access Control**: Admin, Operations Manager, Warehouse Staff, Driver, Accountant
- **Secure API**: Supabase authentication with JWT tokens
- **Data Isolation**: Customers only see their own data

### 🎨 Professional UI/UX

- **Yellow & White Theme**: Clean, professional design inspired by EZSTORAGE branding
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dashboard Analytics**: Real-time KPI tracking and visualization
- **Mobile-First Driver View**: Optimized for field operations
- **Accessible**: WCAG compliant interface design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- npm or yarn

### Installation

```bash
# Clone or navigate to project
cd "D:\react project\EZSTORAGE"

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**📖 For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## 📊 Database Schema

The system uses PostgreSQL (via Supabase) with 8 core tables:

- `customers` - Customer accounts and profiles
- `warehouses` - Physical warehouse locations
- `storage_units` - Individual storage units
- `staff` - Employees with role-based access
- `orders` - Pickup/delivery jobs
- `inventory_items` - Stored items tracking
- `payments` - Financial transactions
- `audit_logs` - System activity logging

**See `supabase/schema.sql` for complete schema**

## 🎨 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, Custom Components |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **State Management** | Zustand, React Query |
| **Charts** | Recharts |
| **Deployment** | Vercel (Frontend), Supabase (Backend) |

## 📱 Dashboard Panels

### 1. Admin Dashboard
- Revenue metrics and trends
- Warehouse utilization overview
- Order status breakdown
- Staff performance tracking

### 2. Operations Panel
- Create and manage orders
- Assign drivers to jobs
- Schedule pickups/deliveries
- Real-time status updates

### 3. Warehouse Panel  
- Visual storage unit grid
- Occupancy tracking
- Inventory management
- Unit allocation

### 4. Driver Mobile View
- Today's assigned jobs
- Navigation integration
- Status update buttons
- Proof of delivery upload
- Call customer functionality

### 5. Accounts Panel
- Payment tracking dashboard
- Invoice generation
- Overdue payment alerts
- Refund management
- Financial reports

## 🔑 Default User Roles

After running seed data, you can create these users in Supabase Auth:

| Email | Role | Access |
|-------|------|--------|
| admin@ezstorage.sg | Admin | Full system access |
| ops@ezstorage.sg | Operations Manager | Orders, customers, warehouses |
| warehouse1@ezstorage.sg | Warehouse Staff | Storage units, inventory |
| driver1@ezstorage.sg | Driver | Assigned jobs only |
| accounts@ezstorage.sg | Accountant | Payments, invoices |

## 📂 Project Structure

```
EZSTORAGE/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── operations/    # Operations manager panel
│   │   ├── warehouse/     # Warehouse management
│   │   ├── driver/        # Driver mobile view
│   │   └── accounts/      # Finance & payments
│   ├── globals.css        # Global styles + theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client config
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript definitions
│   └── database.ts       # DB type definitions
├── supabase/             # Database files
│   ├── schema.sql        # Complete DB schema
│   ├── rls_policies.sql  # Security policies
│   └── seed.sql          # Demo data
├── tailwind.config.ts    # Theme configuration
└── package.json          # Dependencies
```

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Database schema design
- [x] UI/UX layouts for all dashboards
- [x] Authentication framework
- [x] Role-based access control
- [ ] Data fetching with React Query

### Phase 2: Enhancement
- [ ] Real-time updates via Supabase Realtime
- [ ] File upload (proof images, invoices)
- [ ] PDF invoice generation
- [ ] Email notifications
- [ ] Advanced search and filters

### Phase 3: Advanced Features
- [ ] Route optimization for drivers
- [ ] Customer self-service portal
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Analytics and reporting dashboard

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Database (Supabase)
- Schema: Execute `supabase/schema.sql` in SQL Editor
- Policies: Execute `supabase/rls_policies.sql`
- Demo Data: Execute `supabase/seed.sql` (optional)

## 📄 License

This project is for demonstration purposes. Freely use and modify for your needs.

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## 📧 Support

For questions or issues:
- Check the [SETUP.md](./SETUP.md) guide
- Review Supabase documentation
- Open an issue on the repository

---

**EZSTORAGE OMS** - Built with Next.js, Supabase & ❤️
