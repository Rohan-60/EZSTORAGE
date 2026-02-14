/**
 * Supabase Connection Test Script
 * 
 * This script tests the Supabase connection and verifies database setup
 * 
 * Usage: npx tsx scripts/test_connection.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message: string) {
    log(`✅ ${message}`, 'green')
}

function error(message: string) {
    log(`❌ ${message}`, 'red')
}

function warning(message: string) {
    log(`⚠️  ${message}`, 'yellow')
}

function info(message: string) {
    log(`ℹ️  ${message}`, 'cyan')
}

async function testConnection() {
    log('\n===========================================', 'blue')
    log('   SUPABASE CONNECTION TEST', 'blue')
    log('===========================================\n', 'blue')

    // Step 1: Check environment variables
    info('Step 1: Checking environment variables...')

    if (!supabaseUrl || !supabaseAnonKey) {
        error('Missing Supabase credentials in .env.local')
        console.log('\nExpected variables:')
        console.log('  NEXT_PUBLIC_SUPABASE_URL')
        console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY')
        process.exit(1)
    }

    success('Environment variables loaded')
    console.log(`  URL: ${supabaseUrl}`)
    console.log(`  Key: ${supabaseAnonKey.substring(0, 20)}...`)

    // Step 2: Create Supabase client
    info('\nStep 2: Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    success('Supabase client created')

    // Step 3: Test basic connection
    info('\nStep 3: Testing database connection...')
    try {
        const { data, error: dbError } = await supabase
            .from('customers')
            .select('count', { count: 'exact', head: true })

        if (dbError) {
            if (dbError.code === '42P01') {
                error('Table "customers" does not exist')
                warning('You need to run schema.sql in Supabase SQL Editor')
                console.log('\nTo fix this:')
                console.log('1. Go to Supabase SQL Editor')
                console.log('2. Copy contents from: supabase/schema.sql')
                console.log('3. Run the query')
                process.exit(1)
            } else {
                throw dbError
            }
        }

        success('Database connection successful')
    } catch (err: any) {
        error(`Connection failed: ${err.message}`)
        process.exit(1)
    }

    // Step 4: Check all tables exist
    info('\nStep 4: Verifying database tables...')
    const tables = [
        'customers',
        'warehouses',
        'storage_units',
        'staff',
        'orders',
        'inventory_items',
        'payments',
        'audit_logs'
    ]

    let allTablesExist = true
    for (const table of tables) {
        try {
            const { count, error: tableError } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true })

            if (tableError) {
                error(`Table "${table}" - NOT FOUND`)
                allTablesExist = false
            } else {
                success(`Table "${table}" - ${count || 0} rows`)
            }
        } catch (err: any) {
            error(`Table "${table}" - ERROR: ${err.message}`)
            allTablesExist = false
        }
    }

    if (!allTablesExist) {
        warning('\nSome tables are missing. Run schema.sql in Supabase.')
    }

    // Step 5: Check staff records and auth linking
    info('\nStep 5: Checking staff records and authentication...')
    try {
        const { data: staff, error: staffError } = await supabase
            .from('staff')
            .select('staff_code, email, role, auth_user_id')
            .order('role')

        if (staffError) {
            error(`Failed to fetch staff: ${staffError.message}`)
        } else if (!staff || staff.length === 0) {
            warning('No staff records found')
            console.log('  Run seed.sql to create demo staff, or add staff manually')
        } else {
            success(`Found ${staff.length} staff members:`)
            console.log('\n  Staff Code | Email                    | Role                | Auth Status')
            console.log('  -----------|--------------------------|---------------------|-------------')
            staff.forEach((s: any) => {
                const authStatus = s.auth_user_id ? '✅ Linked' : '❌ Not Linked'
                console.log(`  ${s.staff_code} | ${s.email.padEnd(24)} | ${s.role.padEnd(19)} | ${authStatus}`)
            })

            const unlinkedCount = staff.filter((s: any) => !s.auth_user_id).length
            if (unlinkedCount > 0) {
                warning(`\n${unlinkedCount} staff member(s) not linked to auth users`)
                console.log('  To fix this:')
                console.log('  1. Create auth users in Supabase Authentication')
                console.log('  2. Run: supabase/link_auth_users.sql')
            }
        }
    } catch (err: any) {
        error(`Staff check failed: ${err.message}`)
    }

    // Step 6: Check for sample data
    info('\nStep 6: Checking for seed data...')
    try {
        const { count: customerCount } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })

        const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })

        if (customerCount === 0 && orderCount === 0) {
            warning('No data found in database')
            console.log('  To add demo data, run: supabase/seed.sql')
        } else {
            success('Database contains data')
            console.log(`  Customers: ${customerCount}`)
            console.log(`  Orders: ${orderCount}`)
        }
    } catch (err: any) {
        warning(`Could not check data: ${err.message}`)
    }

    // Final summary
    log('\n===========================================', 'blue')
    log('   TEST SUMMARY', 'blue')
    log('===========================================\n', 'blue')

    success('Connection test completed!')
    console.log('\nNext steps:')
    console.log('1. If tables are missing → Run supabase/schema.sql')
    console.log('2. If RLS errors occur → Run supabase/rls_policies.sql')
    console.log('3. If no data exists → Run supabase/seed.sql (optional)')
    console.log('4. If auth not linked → Create users + run supabase/link_auth_users.sql')
    console.log('\nDev server: http://localhost:3000')
    console.log('Supabase Dashboard:', supabaseUrl.replace('supabase.co', 'supabase.com/dashboard/project'))
    console.log('')
}

// Run the test
testConnection().catch((err) => {
    error(`\nUnexpected error: ${err.message}`)
    console.error(err)
    process.exit(1)
})
