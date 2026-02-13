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
