'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

// Fetch all customers
export function useCustomers() {
    return useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
    })
}

// Fetch all warehouses
export function useWarehouses() {
    return useQuery({
        queryKey: ['warehouses'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('warehouses')
                .select('*')
                .is('deleted_at', null)
                .order('name')

            if (error) throw error
            return data
        },
    })
}

// Fetch all storage units with warehouse info
export function useStorageUnits() {
    return useQuery({
        queryKey: ['storage_units'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('storage_units')
                .select(`
          *,
          warehouse:warehouses(id, name, warehouse_code),
          customer:customers(id, first_name, last_name, email)
        `)
                .is('deleted_at', null)
                .order('unit_number')

            if (error) throw error
            return data
        },
    })
}

// Fetch all orders with relations
export function useOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          customer:customers(id, first_name, last_name, email, phone),
          driver:staff!orders_assigned_driver_id_fkey(id, first_name, last_name, vehicle_number),
          warehouse:warehouses(id, name, warehouse_code)
        `)
                .is('deleted_at', null)
                .order('scheduled_date', { ascending: false })

            if (error) throw error
            return data
        },
    })
}

// Fetch all staff
export function useStaff() {
    return useQuery({
        queryKey: ['staff'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('staff')
                .select('*')
                .is('deleted_at', null)
                .order('first_name')

            if (error) throw error
            return data
        },
    })
}

// Fetch all payments
export function usePayments() {
    return useQuery({
        queryKey: ['payments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('payments')
                .select(`
          *,
          customer:customers(id, first_name, last_name, email)
        `)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
    })
}

// Fetch inventory items
export function useInventoryItems() {
    return useQuery({
        queryKey: ['inventory_items'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('inventory_items')
                .select(`
          *,
          customer:customers(first_name, last_name),
          storage_unit:storage_units(unit_number),
          warehouse:warehouses(name)
        `)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
    })
}

// Dashboard stats
export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboard_stats'],
        queryFn: async () => {
            // Get total revenue from completed payments
            const { data: revenueData } = await supabase
                .from('payments')
                .select('total_amount')
                .eq('status', 'completed')

            const totalRevenue = revenueData?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0

            // Get active orders count
            const { count: activeOrders } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .in('status', ['pending', 'confirmed', 'scheduled', 'in_transit'])
                .is('deleted_at', null)

            // Get warehouse utilization
            const { data: warehouses } = await supabase
                .from('warehouses')
                .select('total_units, occupied_units')
                .is('deleted_at', null)

            const totalUnits = warehouses?.reduce((sum, w) => sum + (w.total_units || 0), 0) || 0
            const occupiedUnits = warehouses?.reduce((sum, w) => sum + (w.occupied_units || 0), 0) || 0
            const warehouseUtilization = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0

            // Get active drivers
            const { count: activeDrivers } = await supabase
                .from('staff')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'driver')
                .eq('is_active', true)
                .is('deleted_at', null)

            return {
                totalRevenue,
                activeOrders: activeOrders || 0,
                warehouseUtilization,
                activeDrivers: activeDrivers || 0,
            }
        },
    })
}

// ===== MUTATION HOOKS =====

// Create a new order
export function useCreateOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (orderData: any) => {
            const { data, error } = await supabase
                .from('orders')
                .insert(orderData)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
        },
    })
}

// Update an existing order
export function useUpdateOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data, error } = await supabase
                .from('orders')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
        },
    })
}

// Assign driver to order
export function useAssignDriver() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ orderId, driverId }: { orderId: string; driverId: string }) => {
            const { data, error } = await supabase
                .from('orders')
                .update({ assigned_driver_id: driverId })
                .eq('id', orderId)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
        },
    })
}

// Update storage unit
export function useUpdateStorageUnit() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data, error } = await supabase
                .from('storage_units')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['storage_units'] })
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
    })
}

// Update payment
export function useUpdatePayment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data, error } = await supabase
                .from('payments')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
        },
    })
}

// Create a new customer
export function useCreateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (customerData: any) => {
            const { data, error } = await supabase
                .from('customers')
                .insert(customerData)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}

// Update an existing customer
export function useUpdateCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data, error } = await supabase
                .from('customers')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}

// Delete (soft-delete) a customer
export function useDeleteCustomer() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('customers')
                .update({ deleted_at: new Date().toISOString(), is_active: false })
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] })
        },
    })
}

// ===== PHASE 1 JOB HOOKS =====

// Fetch all jobs with customer info
export function useJobs() {
    return useQuery({
        queryKey: ['jobs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select(`
                    *,
                    customer:customers(id, first_name, last_name, phone, email)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
    })
}

// Fetch jobs by customer
export function useJobsByCustomer(customerId: string) {
    return useQuery({
        queryKey: ['jobs', 'customer', customerId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
        enabled: !!customerId,
    })
}

// Create a new job
export function useCreateJob() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (jobData: any) => {
            const { data, error } = await supabase
                .from('jobs')
                .insert(jobData)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
            queryClient.invalidateQueries({ queryKey: ['job_stats'] })
        },
    })
}

// Update an existing job
export function useUpdateJob() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const { data, error } = await supabase
                .from('jobs')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
            queryClient.invalidateQueries({ queryKey: ['job_stats'] })
        },
    })
}

// Delete a job
export function useDeleteJob() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
            queryClient.invalidateQueries({ queryKey: ['job_stats'] })
        },
    })
}

// Dashboard job stats
export function useJobStats() {
    return useQuery({
        queryKey: ['job_stats'],
        queryFn: async () => {
            // Outstanding jobs (all non-completed)
            const { count: outstanding } = await supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .neq('kanban_column', 'completed')

            // Get current week boundaries
            const now = new Date()
            const weekStart = new Date(now)
            weekStart.setDate(now.getDate() - now.getDay())
            weekStart.setHours(0, 0, 0, 0)

            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

            // Completed this week
            const { count: completedThisWeek } = await supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .eq('kanban_column', 'completed')
                .gte('updated_at', weekStart.toISOString())

            // Completed this month
            const { count: completedThisMonth } = await supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .eq('kanban_column', 'completed')
                .gte('updated_at', monthStart.toISOString())

            return {
                outstanding: outstanding || 0,
                completedThisWeek: completedThisWeek || 0,
                completedThisMonth: completedThisMonth || 0,
            }
        },
    })
}

// Fetch all staff users (for settings page)
export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('staff')
                .select('id, staff_code, first_name, last_name, email, phone, role, is_active, created_at')
                .is('deleted_at', null)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data
        },
    })
}

// Update staff member role
export function useUpdateUserRole() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, role }: { id: string; role: string }) => {
            const { data, error } = await supabase
                .from('staff')
                .update({ role })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}
