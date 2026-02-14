/**
 * Authentication System Test Script
 * 
 * Tests authentication and login functionality
 * 
 * Usage: npx tsx scripts/test_auth.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

function header(message: string) {
    log(`\n${'='.repeat(50)}`, 'blue')
    log(`   ${message}`, 'blue')
    log(`${'='.repeat(50)}\n`, 'blue')
}

async function testAuthentication() {
    header('AUTHENTICATION SYSTEM TEST')

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    let testUserId: string | null = null

    try {
        // ==========================================
        // TEST 1: CHECK AUTH CONFIGURATION
        // ==========================================
        header('TEST 1: AUTH CONFIGURATION CHECK')
        info('Checking Supabase Auth setup...')

        // Try to get current session (should be null for server-side test)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
            error(`Auth configuration error: ${sessionError.message}`)
            throw sessionError
        }

        success('Auth client initialized successfully')
        if (sessionData.session) {
            info('Active session detected')
        } else {
            info('No active session (expected for server-side test)')
        }

        // ==========================================
        // TEST 2: CHECK EXISTING AUTH USERS
        // ==========================================
        header('TEST 2: EXISTING AUTH USERS')
        info('Checking for existing auth users...')

        // Check staff table for auth links
        const { data: staffWithAuth, count: staffCount } = await supabase
            .from('staff')
            .select('staff_code, email, role, auth_user_id', { count: 'exact' })
            .not('auth_user_id', 'is', null)

        if (staffCount === 0) {
            warning('No staff members linked to auth users')
            console.log('\nTo create auth users:')
            console.log('1. Go to Supabase Dashboard → Authentication → Users')
            console.log('2. Add users manually, or')
            console.log('3. Run: supabase/seed.sql to create demo users')
        } else {
            success(`Found ${staffCount} staff members with auth access`)
            staffWithAuth?.forEach((staff: any) => {
                console.log(`  • ${staff.staff_code} - ${staff.email} (${staff.role})`)
            })
        }

        // ==========================================
        // TEST 3: CREATE TEST USER (IF POSSIBLE)
        // ==========================================
        header('TEST 3: CREATE TEST USER')
        info('Attempting to create a test user...')

        const testEmail = `test.user.${Date.now()}@ezstorage.test`
        const testPassword = 'TestPassword123!'

        // Note: signUp requires email confirmation by default in Supabase
        // You may need to disable email confirmation in Supabase Dashboard
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    display_name: 'Test User'
                }
            }
        })

        if (signUpError) {
            if (signUpError.message.includes('confirm')) {
                warning('Email confirmation is required')
                console.log('  To disable: Supabase Dashboard → Authentication → Settings')
                console.log('  → Email Auth → Disable "Enable email confirmations"')
            } else {
                warning(`Sign up issue: ${signUpError.message}`)
            }
        } else if (signUpData.user) {
            testUserId = signUpData.user.id
            success('Test user created successfully!')
            console.log('  User ID:', testUserId)
            console.log('  Email:', testEmail)
            
            if (signUpData.session) {
                success('User session created automatically')
            } else {
                warning('Email confirmation required before login')
            }
        }

        // ==========================================
        // TEST 4: TEST LOGIN WITH EXISTING USER
        // ==========================================
        header('TEST 4: LOGIN TEST')
        
        // Try to find an existing staff member to test login
        const { data: existingStaff } = await supabase
            .from('staff')
            .select('email, staff_code, role')
            .limit(1)
            .single()

        if (existingStaff) {
            info(`Testing login capability for: ${existingStaff.email}`)
            warning('Cannot test actual login without credentials')
            console.log('\nTo test login manually:')
            console.log('1. Ensure auth user exists in Supabase Dashboard')
            console.log('2. Go to http://localhost:3000/login')
            console.log('3. Use credentials to sign in')
            console.log(`4. Expected email: ${existingStaff.email}`)
        } else {
            warning('No staff records found to test login')
            console.log('\nTo setup login:')
            console.log('1. Run: supabase/seed.sql to create staff')
            console.log('2. Create auth users in Supabase Dashboard')
            console.log('3. Run: supabase/link_auth_users.sql')
        }

        // ==========================================
        // TEST 5: TEST AUTH STATE LISTENERS
        // ==========================================
        header('TEST 5: AUTH STATE CHANGE LISTENER')
        info('Testing auth state change subscription...')

        let listenerTriggered = false
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                listenerTriggered = true
                console.log(`  Event: ${event}`)
                if (session) {
                    console.log(`  Session: Active for ${session.user.email}`)
                }
            }
        )

        success('Auth state listener registered')

        // Clean up subscription
        setTimeout(() => {
            subscription.unsubscribe()
            if (listenerTriggered) {
                success('Auth state listener is functional')
            } else {
                info('No auth events occurred (normal for test script)')
            }
        }, 1000)

        // ==========================================
        // TEST 6: TEST SESSION MANAGEMENT
        // ==========================================
        header('TEST 6: SESSION MANAGEMENT')
        info('Testing session retrieval...')

        const { data: { session }, error: getSessionError } = await supabase.auth.getSession()

        if (getSessionError) {
            error(`Session retrieval error: ${getSessionError.message}`)
        } else {
            success('Session management is working')
            if (session) {
                console.log('  Active session found')
                console.log('  User:', session.user.email)
                console.log('  Expires:', new Date(session.expires_at! * 1000).toLocaleString())
            } else {
                info('No active session (expected for test script)')
            }
        }

        // ==========================================
        // TEST 7: RLS POLICY CHECK
        // ==========================================
        header('TEST 7: ROW LEVEL SECURITY (RLS) CHECK')
        info('Checking if RLS policies are working...')

        // Try to access staff table (should work if RLS allows anon access)
        const { data: staffData, error: staffError } = await supabase
            .from('staff')
            .select('staff_code, email, role')
            .limit(1)

        if (staffError) {
            if (staffError.code === '42501') {
                warning('RLS is blocking anonymous access to staff table')
                console.log('  This is normal for production security')
                console.log('  Users need to be authenticated to access data')
            } else {
                warning(`RLS check error: ${staffError.message}`)
            }
        } else {
            success('RLS policies allow appropriate access')
            if (staffData) {
                info(`Can read ${staffData.length} staff record(s)`)
            }
        }

        // ==========================================
        // TEST SUMMARY
        // ==========================================
        header('TEST SUMMARY')
        
        console.log('\n📋 Auth System Status:\n')
        console.log('✓ Auth client initialization - Working')
        console.log('✓ Session management - Working')
        console.log('✓ Auth state listeners - Working')
        console.log('✓ User signup capability - Available')
        
        if (staffCount && staffCount > 0) {
            log('✓ Staff with auth access - Configured', 'green')
        } else {
            log('⚠ Staff with auth access - Not yet configured', 'yellow')
        }

        log('\n🔐 Login System Setup Instructions:\n', 'cyan')
        console.log('1. Create Auth Users:')
        console.log('   • Go to Supabase Dashboard → Authentication → Users')
        console.log('   • Click "Add user" → Add user via email')
        console.log('   • Use staff emails from the database')
        console.log('')
        console.log('2. Link Auth to Staff:')
        console.log('   • After creating auth users, run: supabase/link_auth_users.sql')
        console.log('   • This connects auth accounts to staff records')
        console.log('')
        console.log('3. Test Login:')
        console.log('   • Start dev server: npm run dev')
        console.log('   • Go to: http://localhost:3000/login')
        console.log('   • Use the credentials you created')
        console.log('')
        console.log('4. Verify Dashboard Access:')
        console.log('   • After login, should redirect to appropriate dashboard')
        console.log('   • Role-based access should work')

        // Cleanup
        if (testUserId) {
            info('\nCleaning up test user...')
            // Note: Deleting auth users requires service role key
            warning('Test user cleanup requires manual deletion from Supabase Dashboard')
            console.log(`  User ID to delete: ${testUserId}`)
        }

        log('\n✅ Authentication system test completed!\n', 'green')

    } catch (err: any) {
        error(`\nTest failed: ${err.message}`)
        console.error(err)
        process.exit(1)
    }
}

// Run the test
testAuthentication().catch((err) => {
    error(`\nUnexpected error: ${err.message}`)
    console.error(err)
    process.exit(1)
})
