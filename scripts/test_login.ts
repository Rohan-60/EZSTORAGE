import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local file
config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
    console.log('===========================================')
    console.log('   LOGIN FUNCTIONALITY TEST')
    console.log('===========================================\n')

    const testUsers = [
        { email: 'admin@test.com', password: 'Admin123!', role: 'admin' },
        { email: 'ops@test.com', password: 'Ops123!', role: 'operations_manager' },
    ]

    for (const testUser of testUsers) {
        console.log(`\n📧 Testing: ${testUser.email}`)
        console.log('─'.repeat(50))

        try {
            // Try to sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email: testUser.email,
                password: testUser.password,
            })

            if (error) {
                console.error(`❌ Login failed: ${error.message}`)
                continue
            }

            if (!data.session) {
                console.error('❌ No session returned')
                continue
            }

            console.log('✅ Authentication successful')
            console.log(`   User ID: ${data.user.id}`)
            console.log(`   Email: ${data.user.email}`)

            // Try to fetch staff info
            const { data: staff, error: staffError } = await supabase
                .from('staff')
                .select('id, role, staff_code, first_name, last_name')
                .eq('auth_user_id', data.user.id)
                .single()

            if (staffError) {
                console.error(`❌ Failed to fetch staff info: ${staffError.message}`)
            } else if (staff) {
                console.log('✅ Staff info fetched:')
                console.log(`   Name: ${staff.first_name} ${staff.last_name}`)
                console.log(`   Code: ${staff.staff_code}`)
                console.log(`   Role: ${staff.role}`)
            } else {
                console.error('❌ No staff record found')
            }

            // Sign out for next test
            await supabase.auth.signOut()
            console.log('✅ Signed out successfully')

        } catch (err) {
            console.error(`❌ Unexpected error: ${err}`)
        }
    }

    console.log('\n===========================================')
    console.log('   TEST COMPLETE')
    console.log('===========================================')
}

testLogin()
