'use server'
import {createClient} from "@/lib/supabase/server";

export type OverviewData = {
    balance: number
    income: number
    expenses: number
    // pending: number
}

export type Transaction = {
    id: number
    description: string
    amount: number
    date: string
    category: string
}

export async function getOverviewData(userId: string): Promise<OverviewData> {
    const supabase = await createClient()

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())

    if (error) {
        throw new Error('Failed to fetch overview data')
    }

    const income = transactions
        ?.filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0) ?? 0

    const expenses = transactions
        ?.filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) ?? 0

    return {
        balance: income - expenses,
        income,
        expenses,
    }
}

export async function getRecentTransactions(userId: string): Promise<Transaction[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5)

    if (error) {
        throw new Error('Failed to fetch transactions')
    }

    return data as Transaction[]
}

export async function getAccountsForUser(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);

    console.log('accounts', data)

    if (error) {
        console.error('Error fetching accounts:', error)
        throw new Error('Failed to fetch accounts')
    }

    return data;
}