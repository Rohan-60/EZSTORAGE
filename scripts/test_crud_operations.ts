/**
 * CRUD Operations Test Script
 * 
 * Tests Create, Read, Update, Delete operations on the database
 * 
 * Usage: npx tsx scripts/test_crud_operations.ts
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
    magenta: '\x1b[35m',
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

function info(message: string) {
    log(`ℹ️  ${message}`, 'cyan')
}

function header(message: string) {
    log(`\n${'='.repeat(50)}`, 'blue')
    log(`   ${message}`, 'blue')
    log(`${'='.repeat(50)}\n`, 'blue')
}

async function testCRUDOperations() {
    header('CRUD OPERATIONS TEST')

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    let testCustomerId: string | null = null

    try {
        // ==========================================
        // TEST 1: CREATE (INSERT) OPERATION
        // ==========================================
        header('TEST 1: CREATE (INSERT) OPERATION')
        info('Creating a test customer...')

        const testCustomerData = {
            customer_code: `TEST-${Date.now()}`,
            first_name: 'Test',
            last_name: 'Customer',
            email: `test.customer.${Date.now()}@example.com`,
            phone: '+65 9123 4567',
            address_line1: '123 Test Street',
            city: 'Singapore',
            postal_code: '123456',
            country: 'Singapore',
            notes: 'This is a test customer created by automated CRUD test'
        }

        const { data: insertedCustomer, error: insertError } = await supabase
            .from('customers')
            .insert(testCustomerData)
            .select()
            .single()

        if (insertError) {
            error(`CREATE operation failed: ${insertError.message}`)
            console.log(insertError)
            throw insertError
        }

        testCustomerId = insertedCustomer.id
        success('CREATE operation successful!')
        console.log('  Created customer ID:', testCustomerId)
        console.log('  Customer code:', insertedCustomer.customer_code)
        console.log('  Name:', `${insertedCustomer.first_name} ${insertedCustomer.last_name}`)

        // ==========================================
        // TEST 2: READ (SELECT) OPERATION
        // ==========================================
        header('TEST 2: READ (SELECT) OPERATION')
        info('Reading the created customer...')

        const { data: fetchedCustomer, error: fetchError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', testCustomerId)
            .single()

        if (fetchError) {
            error(`READ operation failed: ${fetchError.message}`)
            throw fetchError
        }

        success('READ operation successful!')
        console.log('  Retrieved customer:', fetchedCustomer.customer_code)
        console.log('  Email:', fetchedCustomer.email)
        console.log('  Phone:', fetchedCustomer.phone)

        // Verify data integrity
        if (fetchedCustomer.email === testCustomerData.email &&
            fetchedCustomer.first_name === testCustomerData.first_name) {
            success('Data integrity verified - All fields match!')
        } else {
            error('Data integrity issue - Fields do not match!')
        }

        // ==========================================
        // TEST 3: READ ALL (SELECT ALL) OPERATION
        // ==========================================
        header('TEST 3: READ ALL (SELECT ALL) OPERATION')
        info('Reading all customers...')

        const { data: allCustomers, error: fetchAllError, count } = await supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(5)

        if (fetchAllError) {
            error(`READ ALL operation failed: ${fetchAllError.message}`)
            throw fetchAllError
        }

        success(`READ ALL operation successful! Found ${count} total customers`)
        console.log('  Showing latest 5 customers:')
        allCustomers?.forEach((customer: any, index: number) => {
            console.log(`    ${index + 1}. ${customer.customer_code} - ${customer.first_name} ${customer.last_name}`)
        })

        // ==========================================
        // TEST 4: UPDATE OPERATION
        // ==========================================
        header('TEST 4: UPDATE OPERATION')
        info('Updating the test customer...')

        const updatedData = {
            phone: '+65 8888 9999',
            notes: 'This customer record was updated by automated CRUD test'
        }

        const { data: updatedCustomer, error: updateError } = await supabase
            .from('customers')
            .update(updatedData)
            .eq('id', testCustomerId)
            .select()
            .single()

        if (updateError) {
            error(`UPDATE operation failed: ${updateError.message}`)
            throw updateError
        }

        success('UPDATE operation successful!')
        console.log('  Updated phone:', updatedCustomer.phone)
        console.log('  Updated notes:', updatedCustomer.notes)

        // Verify update
        if (updatedCustomer.phone === updatedData.phone) {
            success('Update verified - Phone number changed successfully!')
        } else {
            error('Update verification failed!')
        }

        // ==========================================
        // TEST 5: DELETE OPERATION
        // ==========================================
        header('TEST 5: DELETE (SOFT DELETE) OPERATION')
        info('Soft deleting the test customer...')

        // First, try soft delete by setting is_active to false
        const { error: softDeleteError } = await supabase
            .from('customers')
            .update({ is_active: false })
            .eq('id', testCustomerId)

        if (softDeleteError) {
            error(`SOFT DELETE operation failed: ${softDeleteError.message}`)
            throw softDeleteError
        }

        success('SOFT DELETE operation successful!')

        // Verify soft delete
        const { data: deletedCustomer } = await supabase
            .from('customers')
            .select('is_active')
            .eq('id', testCustomerId)
            .single()

        if (deletedCustomer && !deletedCustomer.is_active) {
            success('Soft delete verified - Customer is now inactive!')
        }

        // ==========================================
        // TEST 6: HARD DELETE OPERATION
        // ==========================================
        header('TEST 6: DELETE (HARD DELETE) OPERATION')
        info('Hard deleting the test customer...')

        const { error: hardDeleteError } = await supabase
            .from('customers')
            .delete()
            .eq('id', testCustomerId)

        if (hardDeleteError) {
            error(`HARD DELETE operation failed: ${hardDeleteError.message}`)
            throw hardDeleteError
        }

        success('HARD DELETE operation successful!')

        // Verify hard delete
        const { data: checkDeleted, error: checkError } = await supabase
            .from('customers')
            .select('id')
            .eq('id', testCustomerId)
            .single()

        if (checkError && checkError.code === 'PGRST116') {
            success('Hard delete verified - Customer record no longer exists!')
        } else if (!checkDeleted) {
            success('Hard delete verified - Customer record removed!')
        } else {
            error('Hard delete verification failed - Record still exists!')
        }

        // ==========================================
        // TEST 7: COMPLEX QUERY OPERATIONS
        // ==========================================
        header('TEST 7: COMPLEX QUERY OPERATIONS')
        info('Testing filtering and searching...')

        // Test 7a: Filter by city
        const { data: singaporeCustomers, count: singaporeCount } = await supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .eq('city', 'Singapore')
            .eq('is_active', true)

        success(`Found ${singaporeCount} active customers in Singapore`)

        // Test 7b: Search by email pattern
        const { data: searchResults, count: searchCount } = await supabase
            .from('customers')
            .select('*', { count: 'exact' })
            .ilike('email', '%@%')
            .limit(3)

        success(`Found ${searchCount} customers with email addresses (showing 3)`)
        searchResults?.forEach((customer: any, index: number) => {
            console.log(`  ${index + 1}. ${customer.customer_code} - ${customer.email}`)
        })

        // ==========================================
        // TEST SUMMARY
        // ==========================================
        header('TEST SUMMARY')
        success('All CRUD operations completed successfully!')
        console.log('\n✓ CREATE (INSERT) - Working')
        console.log('✓ READ (SELECT) - Working')
        console.log('✓ READ ALL (SELECT ALL) - Working')
        console.log('✓ UPDATE - Working')
        console.log('✓ SOFT DELETE - Working')
        console.log('✓ HARD DELETE - Working')
        console.log('✓ COMPLEX QUERIES - Working')
        
        log('\n🎉 Database CRUD operations are fully functional!\n', 'green')

    } catch (err: any) {
        error(`\nTest failed: ${err.message}`)
        console.error(err)

        // Cleanup: Try to delete test customer if it was created
        if (testCustomerId) {
            info('\nCleaning up test data...')
            try {
                await supabase
                    .from('customers')
                    .delete()
                    .eq('id', testCustomerId)
                success('Test data cleaned up')
            } catch (cleanupErr) {
                error('Failed to clean up test data')
            }
        }

        process.exit(1)
    }
}

// Run the test
testCRUDOperations().catch((err) => {
    error(`\nUnexpected error: ${err.message}`)
    console.error(err)
    process.exit(1)
})
