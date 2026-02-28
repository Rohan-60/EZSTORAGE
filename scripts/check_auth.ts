import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env.local file
config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAuthUsers() {
    console.log('===========================================')
    console.log('   AUTH USERS DIAGNOSTIC')
    console.log('===========================================\n')

    try {
        // Check staff with auth_user_id
        const { data: staffData, error: staffError } = await supabase
            .from('staff')
            .select('email, auth_user_id, role')
            .not('auth_user_id', 'is', null)

        if (staffError) {
            console.error('❌ Error fetching staff:', staffError.message)
            return
        }

        console.log('📊 Staff records with auth_user_id:')
        console.log('─'.repeat(70))
        staffData?.forEach(staff => {
            console.log(`${staff.email.padEnd(25)} | ${staff.role.padEnd(20)} | ${staff.auth_user_id}`)
        })

        console.log('\n🔐 Attempting test logins...')
        console.log('─'.repeat(70))

        // Test with known passwords
        const passwords = ['Admin123!', 'admin123', 'Admin123', 'password']
        
        for (const staff of staffData || []) {
            console.log(`\n📧 ${staff.email}`)
            
            for (const password of passwords) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: staff.email,
                    password: password,
                })

                if (!error && data.session) {
                    console.log(`  ✅ SUCCESS with password: ${password}`)
                    await supabase.auth.signOut()
                    break
                }
            }
        }

        console.log('\n─'.repeat(70))
        console.log('\n💡 Next Steps:')
        console.log('1. If all logins failed, you need to CREATE auth users in Supabase Dashboard')
        console.log('2. Go to: https://bipwsfegdkkjrsinfcjz.supabase.co/project/bipwsfegdkkjrsinfcjz/auth/users')
        console.log('3. Click "Add user" and create each user with:')
        console.log('   - Email from the list above')
        console.log('   - Password: Admin123! (or your chosen password)')
        console.log('   - ✅ Check "Auto Confirm User"')
        console.log('4. After creating users, run: supabase/link_auth_users.sql')
        
    } catch (err) {
        console.error('❌ Unexpected error:', err)
    }

    console.log('\n===========================================\n')
}

checkAuthUsers()
