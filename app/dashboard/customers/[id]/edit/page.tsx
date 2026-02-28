'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomers, useUpdateCustomer } from '@/lib/hooks/useSupabase'
import toast from 'react-hot-toast'

export default function EditCustomerPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const updateCustomer = useUpdateCustomer()
    const { data: customers, isLoading } = useCustomers()

    const customer = customers?.find((c: any) => c.id === id)

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        address_line1: '',
        city: '',
        postal_code: '',
        notes: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (customer) {
            setForm({
                first_name: customer.first_name || '',
                last_name: customer.last_name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                address_line1: customer.address_line1 || '',
                city: customer.city || '',
                postal_code: customer.postal_code || '',
                notes: customer.notes || '',
            })
        }
    }, [customer])

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.first_name.trim()) e.first_name = 'First name is required'
        if (!form.last_name.trim()) e.last_name = 'Last name is required'
        if (!form.phone.trim()) e.phone = 'Phone number is required'
        return e
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        try {
            await updateCustomer.mutateAsync({
                id,
                updates: {
                    first_name: form.first_name.trim(),
                    last_name: form.last_name.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim(),
                    address_line1: form.address_line1.trim(),
                    city: form.city.trim(),
                    postal_code: form.postal_code.trim(),
                    notes: form.notes.trim() || null,
                },
            })
            toast.success('Customer updated!')
            router.push(`/dashboard/customers/${id}`)
        } catch (err: any) {
            toast.error(err.message || 'Failed to update customer')
        }
    }

    const set = (field: string, value: string) => {
        setForm(f => ({ ...f, [field]: value }))
        setErrors(e => { const n = { ...e }; delete n[field]; return n })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="text-center py-24">
                <p className="text-secondary-500 text-lg">Customer not found.</p>
                <Link href="/dashboard/customers" className="text-primary-600 hover:underline mt-2 inline-block">← Back</Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/customers/${id}`} className="p-2 rounded-lg hover:bg-secondary-100">
                    <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Edit Customer</h2>
                    <p className="text-secondary-500 text-sm">{customer.first_name} {customer.last_name}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                        <input type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)} className={`input ${errors.first_name ? 'input-error' : ''}`} />
                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
                        <input type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)} className={`input ${errors.last_name ? 'input-error' : ''}`} />
                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                        <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={`input ${errors.phone ? 'input-error' : ''}`} />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={`input ${errors.email ? 'input-error' : ''}`} required />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">Address <span className="text-red-500">*</span></label>
                    <input type="text" value={form.address_line1} onChange={e => set('address_line1', e.target.value)} className={`input ${errors.address_line1 ? 'input-error' : ''}`} />
                    {errors.address_line1 && <p className="text-red-500 text-xs mt-1">{errors.address_line1}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">City <span className="text-red-500">*</span></label>
                        <input type="text" value={form.city} onChange={e => set('city', e.target.value)} className={`input ${errors.city ? 'input-error' : ''}`} />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1.5">Postal Code <span className="text-red-500">*</span></label>
                        <input type="text" value={form.postal_code} onChange={e => set('postal_code', e.target.value)} className={`input ${errors.postal_code ? 'input-error' : ''}`} />
                        {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1.5">Notes</label>
                    <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="input resize-none" rows={3} />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={updateCustomer.isPending} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                        {updateCustomer.isPending ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                        ) : 'Save Changes'}
                    </button>
                    <Link href={`/dashboard/customers/${id}`} className="btn btn-secondary flex-1 text-center flex items-center justify-center">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    )
}
