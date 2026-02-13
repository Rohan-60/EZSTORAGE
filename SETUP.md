# EZSTORAGE - Setup & Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git for version control

## Step 1: Supabase Setup

### Create a New Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: EZSTORAGE-OMS
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to Singapore
4. Wait for project creation (~2 minutes)

### Execute Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `supabase/schema.sql` and paste it
4. Click **Run** to execute
5. Repeat for `supabase/rls_policies.sql`
6. *(Optional)* Run `supabase/seed.sql` for demo data

### Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 2: Local Development Setup

### Install Dependencies

```powershell
cd "D:\react project\EZSTORAGE"
npm install
```

### Configure Environment Variables

1. Create `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace `your_project_url_here` with your Supabase URL
3. Replace `your_anon_key_here` with your anon key

### Run Development Server

```powershell
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application!

## Step 3: Create Staff Users in Supabase Auth

Since the app uses role-based access, you need to create users in Supabase Auth and link them to staff records.

### Method 1: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Create users with these emails (matching seed data):
   - `admin@ezstorage.sg` (Admin)
   - `ops@ezstorage.sg` (Operations Manager)
   - `driver1@ezstorage.sg` (Driver)
   - `warehouse1@ezstorage.sg` (Warehouse Staff)
   - `accounts@ezstorage.sg` (Accountant)

### Method 2: Link Auth Users to Staff

After creating auth users, update the `staff` table:

```sql
-- Run this in SQL Editor
UPDATE staff 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'admin@ezstorage.sg')
WHERE email = 'admin@ezstorage.sg';

-- Repeat for other users
```

## Step 4: Production Deployment (Vercel)

### Deploy to Vercel (Free Tier)

1. Install Vercel CLI:
   ```powershell
   npm i -g vercel
   ```

2. Login to Vercel:
   ```powershell
   vercel login
   ```

3. Deploy:
   ```powershell
   vercel
   ```

4. Follow prompts:
   - Link to existing project? **No**
   - Project name: `ezstorage-oms`
   - Directory: `./`
   - Auto-detected Next.js: **Yes**

5. Add environment variables:
   ```powershell
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

6. Deploy to production:
   ```powershell
   vercel --prod
   ```

Your app will be live at `https://ezstorage-oms.vercel.app` (or similar)!

## Step 5: Configure Supabase Storage (Optional)

For file uploads (proof images, invoices):

1. In Supabase, go to **Storage**
2. Create buckets:
   - `proof-images`
   - `invoices`
   - `customer-documents`
3. Set permissions for each bucket in **Policies**

## Testing the Application

### Login as Admin
- Email: `admin@ezstorage.sg`
- Password: (whatever you set in Supabase Auth)

### Access Different Dashboards
- **Admin**: View KPIs, revenue, warehouse utilization
- **Operations**: Create orders, assign drivers
- **Warehouse**: Manage storage units, inventory
- **Driver**: View assigned jobs (mobile-optimized)
- **Accounts**: Track payments, generate invoices

## Project Structure

```
EZSTORAGE/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard routes
│   │   ├── admin/          # Admin dashboard
│   │   ├── operations/     # Operations panel
│   │   ├── warehouse/      # Warehouse management
│   │   ├── driver/         # Driver mobile view
│   │   └── accounts/       # Accounts panel
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/              # (To be added as needed)
├── lib/                     # Utilities
│   ├── supabase/           # Supabase client
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript definitions
│   └── database.ts         # Database types
├── supabase/               # SQL files
│   ├── schema.sql          # Database schema
│   ├── rls_policies.sql    # Security policies
│   └── seed.sql            # Demo data
└── package.json            # Dependencies
```

## Troubleshooting

### "Invalid API key" error
- Check `.env.local` has correct Supabase credentials
- Restart dev server after changing env variables

### "Row Level Security" errors
- Ensure RLS policies are applied (`rls_policies.sql`)
- Check user is authenticated

### Styles not working
- Run `npm install` to ensure Tailwind is installed
- Check `tailwind.config.ts` is present

## Next Steps

1. **Implement React Query**: Add data fetching with real-time updates
2. **Add Authentication UI**: Create login/register pages
3. **Integrate Recharts**: Add revenue trend charts
4. **File Upload**: Implement proof of delivery uploads
5. **Mobile Optimization**: Further enhance driver view for mobile
6. **Email Notifications**: Set up Supabase email triggers
7. **PDF Generation**: Invoice and receipt generation
8. **Advanced Filters**: Add search and filter functionality

## Support

For issues or questions:
- Check Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
- Next.js docs: [https://nextjs.org/docs](https://nextjs.org/docs)
- Tailwind CSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)

---

**Built with ❤️ using Next.js 15, Supabase, and TypeScript**
