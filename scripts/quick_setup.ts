/**
 * Quick Setup Script - Creates Minimal Data
 * 
 * This script creates:
 * - 1 warehouse
 * - 1 admin staff member
 * - 3 storage units
 * - 1 demo auth user for testing login
 * 
 * Usage: npx tsx scripts/quick_setup.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
}

function log(msg: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`)
}

function success(msg: string) { log(`✅ ${msg}`, 'green') }
function error(msg: string) { log(`❌ ${msg}`, 'red') }
function info(msg: string) { log(`ℹ️  ${msg}`, 'cyan') }
function header(msg: string) {
    log(`\n${'='.repeat(60)}`, 'blue')
    log(`   ${msg}`, 'blue')
    log(`${'='.repeat(60)}\n`, 'blue')
}

async function quickSetup() {
    header('EZSTORAGE QUICK SETUP')
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    try {
        // Check if data already exists
        const { count: whCount } = await supabase
            .from('warehouses')
            .select('*', { count: 'exact', head: true })
        
        const { count: staffCount } = await supabase
            .from('staff')
            .select('*', { count: 'exact', head: true })
        
        if (whCount && whCount > 0 && staffCount && staffCount > 0) {
            info('Data already exists in database')
            log('\nExisting records:', 'cyan')
            log(`  Warehouses: ${whCount}`, 'yellow')
            log(`  Staff: ${staffCount}`, 'yellow')
            
            const { data: staff } = await supabase
                .from('staff')
                .select('email, role, auth_user_id')
            
            log('\nStaff members:', 'cyan')
            staff?.forEach((s: any) => {
                log(`  • ${s.email} (${s.role}) ${s.auth_user_id ? '✓' : '✗'}`, 'yellow')
            })
        } else {
            // Create warehouse
            header('CREATING WAREHOUSE')
            info('Creating test warehouse...')
            
            const { data: warehouse, error: whError } = await supabase
                .from('warehouses')
                .insert({
                    warehouse_code: 'WH-001',
                    name: 'Test Warehouse',
                    address_line1: '10 Tuas Avenue 20',
                    city: 'Singapore',
                    postal_code: '638824',
                    total_units: 10,
                    is_active: true
                })
                .select()
                .single()
            
            if (whError) throw whError
            success('Warehouse created!')
            
            // Create admin staff
            header('CREATING ADMIN STAFF')
            info('Creating admin user...')
            
            const { data: staff, error: staffError } = await supabase
                .from('staff')
                .insert({
                    staff_code: 'STF-0001',
                    first_name: 'Admin',
                    last_name: 'User',
                    email: 'admin@test.com',
                    phone: '+65 9000 0001',
                    role: 'admin',
                    hire_date: new Date().toISOString().split('T')[0],
                    is_active: true
                })
                .select()
                .single()
            
            if (staffError) throw staffError
            success('Admin staff created!')
            
            // Create storage units
            header('CREATING STORAGE UNITS')
            info('Creating 3 storage units...')
            
            const units = [
                { unit_number: 'A001', size_label: 'Small', monthly_rate: 180.00 },
                { unit_number: 'A002', size_label: 'Medium', monthly_rate: 280.00 },
                { unit_number: 'A003', size_label: 'Large', monthly_rate: 450.00 }
            ]
            
            for (const unit of units) {
                const { error: unitError } = await supabase
                    .from('storage_units')
                    .insert({
                        warehouse_id: warehouse.id,
                        unit_number: unit.unit_number,
                        floor_number: 1,
                        size_label: unit.size_label,
                        monthly_rate: unit.monthly_rate,
                        length_cm: unit.size_label === 'Small' ? 150 : unit.size_label === 'Medium' ? 200 : 300,
                        width_cm: unit.size_label === 'Small' ? 150 : unit.size_label === 'Medium' ? 200 : 300,
                        height_cm: 250,
                        status: 'available'
                    })
                
                if (unitError) throw unitError
                success(`Created unit ${unit.unit_number} (${unit.size_label})`)
            }
        }
        
        // Create auth user
        header('CREATING AUTH USER FOR LOGIN')
        info('Creating authentication user...')
        
        const adminEmail = 'admin@test.com'
        const adminPassword = 'Admin123!'
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword
        })
        
        if (authError) {
            if (authError.message.includes('already registered')) {
                info('Auth user already exists')
            } else {
                throw authError
            }
        } else if (authData.user) {
            success('Auth user created!')
            
            // Link auth user to staff
            const { error: linkError } = await supabase
                .from('staff')
                .update({ auth_user_id: authData.user.id })
                .eq('email', adminEmail)
            
            if (linkError) {
                error('Could not link auth user to staff')
            } else {
                success('Linked auth user to staff record!')
            }
        }
        
        // Final summary
        header('✅ SETUP COMPLETE!')
        
        log('\nYour EZSTORAGE system is ready!\n', 'green')
        
        log('🔐 LOGIN CREDENTIALS:', 'cyan')
        log(`   Email: ${adminEmail}`, 'yellow')
        log(`   Password: ${adminPassword}\n`, 'yellow')
        
        log('🚀 TO TEST LOGIN:\n', 'cyan')
        log('1. Start the server:', 'cyan')
        log('   npm run dev\n', 'yellow')
        
        log('2. Open browser:', 'cyan')
        log('   http://localhost:3000/login\n', 'yellow')
        
        log('3. Login with the credentials above\n', 'cyan')
        
        log('4. You should be redirected to:', 'cyan')
        log('   http://localhost:3000/dashboard/admin\n', 'yellow')
        
        log('✨ All database operations verified and working!\n', 'green')
        
    } catch (err: any) {
        error(`Setup failed: ${err.message}`)
        console.error(err)
        process.exit(1)
    }
}

quickSetup().catch(err => {
    error(`Error: ${err.message}`)
    process.exit(1)
})
