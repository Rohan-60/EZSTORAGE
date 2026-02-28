import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    try {
        // Verify shared secret (server-side only — never exposed to browser)
        const secret = req.headers.get('x-admin-secret')
        if (secret !== process.env.ADMIN_API_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const { email, role, firstName, lastName, phone, password } = await req.json()

        if (!email || !role || !firstName || !lastName || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Create the auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { first_name: firstName, last_name: lastName },
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        // Auto-generate staff_code (e.g. STF-0007) based on existing max
        const { data: lastStaff } = await supabaseAdmin
            .from('staff')
            .select('staff_code')
            .order('staff_code', { ascending: false })
            .limit(1)
            .single()

        let nextNum = 1
        if (lastStaff?.staff_code) {
            const match = lastStaff.staff_code.match(/(\d+)$/)
            if (match) nextNum = parseInt(match[1], 10) + 1
        }
        const staffCode = `STF-${String(nextNum).padStart(4, '0')}`

        // Create the staff record linked to the auth user
        // phone and hire_date are NOT NULL in the schema — use sensible defaults if not provided
        const { error: staffError } = await supabaseAdmin
            .from('staff')
            .insert({
                auth_user_id: authData.user.id,
                staff_code: staffCode,
                first_name: firstName,
                last_name: lastName,
                email,
                phone: phone?.trim() || 'TBD',
                role,
                hire_date: new Date().toISOString().split('T')[0],
                is_active: true,
            })

        if (staffError) {
            // Rollback the auth user if staff insert fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
            return NextResponse.json({ error: staffError.message }, { status: 400 })
        }

        // Send password reset email so user can set their own password
        await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email,
        })

        return NextResponse.json({ success: true, userId: authData.user.id })
    } catch (err: any) {
        const msg: string = err?.message || 'Internal server error'
        // Give a helpful message when the Supabase project is paused / unreachable
        if (msg === 'fetch failed' || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('socket hang up')) {
            return NextResponse.json(
                { error: 'Cannot reach Supabase. The project may be paused — go to supabase.com/dashboard and click "Restore project", then try again.' },
                { status: 503 }
            )
        }
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
