'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUsers, useUpdateUserRole } from '@/lib/hooks/useSupabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/utils'
import { supabaseAdmin } from '@/lib/supabase/admin'
import toast from 'react-hot-toast'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    admin: { label: 'Admin', color: 'bg-red-100 text-red-800' },
    operations_manager: { label: 'Manager', color: 'bg-purple-100 text-purple-800' },
    warehouse_staff: { label: 'Staff', color: 'bg-blue-100 text-blue-800' },
}

export default function SettingsPage() {
    const { data: users, isLoading } = useUsers()
    const updateRole = useUpdateUserRole()
    const { userRole, staff } = useAuth()
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteForm, setInviteForm] = useState({ email: '', role: 'warehouse_staff', firstName: '', lastName: '', phone: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [inviteError, setInviteError] = useState('')
    const [createdUser, setCreatedUser] = useState<{ name: string; email: string; role: string } | null>(null)
    const queryClient = useQueryClient()
    const [inviteLoading, setInviteLoading] = useState(false)

    if (userRole !== 'admin') {
        return (
            <div className="text-center py-24">
                <svg className="w-16 h-16 mx-auto mb-4 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xl font-semibold text-secondary-700">Admin Only</p>
                <p className="text-secondary-400 mt-1">You don't have permission to view this page.</p>
            </div>
        )
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (userId === staff?.id) { toast.error("You can't change your own role"); return }
        try {
            await updateRole.mutateAsync({ id: userId, role: newRole })
            toast.success('Role updated')
        } catch (e: any) {
            toast.error(e.message || 'Failed to update role')
        }
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setInviteError('')
        if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName || !inviteForm.password) {
            setInviteError('Please fill all required fields')
            return
        }
        if (inviteForm.password.length < 6) {
            setInviteError('Password must be at least 6 characters')
            return
        }
        setInviteLoading(true)
        try {
            // Create auth user directly from the browser using the admin client
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: inviteForm.email,
                password: inviteForm.password,
                email_confirm: true,
                user_metadata: { first_name: inviteForm.firstName, last_name: inviteForm.lastName },
            })
            if (authError) throw new Error(authError.message)

            // Auto-generate staff_code
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

            // Insert staff record
            const { error: staffError } = await supabaseAdmin.from('staff').insert({
                auth_user_id: authData.user.id,
                staff_code: staffCode,
                first_name: inviteForm.firstName,
                last_name: inviteForm.lastName,
                email: inviteForm.email,
                phone: inviteForm.phone?.trim() || 'TBD',
                role: inviteForm.role,
                hire_date: new Date().toISOString().split('T')[0],
                is_active: true,
            })
            if (staffError) {
                // Rollback auth user if staff insert fails
                await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
                throw new Error(staffError.message)
            }

            queryClient.invalidateQueries({ queryKey: ['users'] })
            setCreatedUser({ name: `${inviteForm.firstName} ${inviteForm.lastName}`, email: inviteForm.email, role: inviteForm.role })
            setInviteForm({ email: '', role: 'warehouse_staff', firstName: '', lastName: '', phone: '', password: '' })
            setShowPassword(false)
        } catch (err: any) {
            setInviteError(err.message)
        } finally {
            setInviteLoading(false)
        }
    }

    const handleCloseModal = () => {
        setShowInviteModal(false)
        setCreatedUser(null)
        setInviteError('')
        setInviteForm({ email: '', role: 'warehouse_staff', firstName: '', lastName: '', phone: '', password: '' })
        setShowPassword(false)
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Account Settings</h2>
                    <p className="text-secondary-500 mt-1">Manage your team members and roles</p>
                </div>
                <button onClick={() => setShowInviteModal(true)} className="btn btn-primary flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add User
                </button>
            </div>

            {/* Users Table */}
            <div className="card p-0 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr className="table-header">
                                    <th className="table-cell font-semibold text-secondary-700">Name</th>
                                    <th className="table-cell font-semibold text-secondary-700">Email</th>
                                    <th className="table-cell font-semibold text-secondary-700">Current Role</th>
                                    <th className="table-cell font-semibold text-secondary-700">Change Role</th>
                                    <th className="table-cell font-semibold text-secondary-700">Joined</th>
                                    <th className="table-cell font-semibold text-secondary-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(users || []).map((user: any) => {
                                    const roleInfo = ROLE_LABELS[user.role] || { label: user.role, color: 'bg-gray-100 text-gray-700' }
                                    const isSelf = user.id === staff?.id
                                    return (
                                        <tr key={user.id} className={`table-row ${isSelf ? 'bg-primary-50/50' : ''}`}>
                                            <td className="table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-primary-700 font-semibold text-xs">
                                                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-secondary-900 text-sm">
                                                            {user.first_name} {user.last_name}
                                                            {isSelf && <span className="ml-1.5 text-xs text-primary-500">(you)</span>}
                                                        </p>
                                                        <p className="text-xs text-secondary-400">{user.staff_code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell text-secondary-600 text-sm">{user.email}</td>
                                            <td className="table-cell">
                                                <span className={`badge text-xs ${roleInfo.color}`}>{roleInfo.label}</span>
                                            </td>
                                            <td className="table-cell">
                                                {isSelf ? (
                                                    <span className="text-xs text-secondary-400">—</span>
                                                ) : (
                                                    <select
                                                        value={user.role}
                                                        onChange={e => handleRoleChange(user.id, e.target.value)}
                                                        disabled={updateRole.isPending}
                                                        className="input text-sm py-1 w-auto"
                                                    >
                                                        <option value="admin">Admin</option>
                                                        <option value="operations_manager">Manager</option>
                                                        <option value="warehouse_staff">Staff</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td className="table-cell text-secondary-500 text-sm">{formatDate(user.created_at)}</td>
                                            <td className="table-cell">
                                                <span className={`badge ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-secondary-900">Add New User</h3>
                            <button onClick={() => setShowInviteModal(false)} className="p-1.5 hover:bg-secondary-100 rounded-lg">
                                <svg className="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {createdUser ? (
                            <div className="text-center py-4 space-y-4">
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-secondary-900 text-lg">User Created!</p>
                                    <p className="text-secondary-600 mt-1">{createdUser.name}</p>
                                    <p className="text-secondary-500 text-sm">{createdUser.email}</p>
                                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${createdUser.role === 'admin' ? 'bg-red-100 text-red-700' :
                                            createdUser.role === 'operations_manager' ? 'bg-purple-100 text-purple-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {createdUser.role === 'admin' ? 'Admin' : createdUser.role === 'operations_manager' ? 'Manager' : 'Staff'}
                                    </span>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setCreatedUser(null)} className="btn btn-secondary flex-1">Add Another</button>
                                    <button type="button" onClick={handleCloseModal} className="btn btn-primary flex-1">Done</button>
                                </div>
                            </div>
                        ) : (<form onSubmit={handleInvite} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={inviteForm.firstName} onChange={e => setInviteForm(f => ({ ...f, firstName: e.target.value }))} className="input" placeholder="John" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={inviteForm.lastName} onChange={e => setInviteForm(f => ({ ...f, lastName: e.target.value }))} className="input" placeholder="Tan" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                                <input type="email" value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} className="input" placeholder="john@ezstorage.com" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Phone</label>
                                <input type="tel" value={inviteForm.phone} onChange={e => setInviteForm(f => ({ ...f, phone: e.target.value }))} className="input" placeholder="+65 9000 0000" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={inviteForm.password}
                                        onChange={e => setInviteForm(f => ({ ...f, password: e.target.value }))}
                                        className="input pr-10"
                                        placeholder="Min. 6 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1.5">Role <span className="text-red-500">*</span></label>
                                <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))} className="input">
                                    <option value="admin">Admin</option>
                                    <option value="operations_manager">Manager</option>
                                    <option value="warehouse_staff">Staff</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button type="submit" disabled={inviteLoading} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                                    {inviteLoading ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                                    ) : 'Create User'}
                                </button>
                                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                            </div>
                            {inviteError && (
                                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {inviteError}
                                </div>
                            )}
                        </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
