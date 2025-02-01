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

export type Account = {
    id: number
    user_id: string
    name: string
    type: 'checking' | 'savings'
    initial_balance: number
    currency: string
    created_at: string
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

export async function getAccounts(userId: string): Promise<Account[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        throw new Error('Failed to fetch accounts')
    }

    console.log(`accounts: ${data?.forEach(account => console.log(account))}`)
    return data || [];
}

export async function createAccount(
    userId: string, 
    name: string, 
    type: 'checking' | 'savings',
    initialBalance: number,
    currency: string
): Promise<Account> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('accounts')
        .insert([
            {
                user_id: userId,
                name,
                type,
                initial_balance: initialBalance,
                current_balance: initialBalance,
                currency,
            }
        ])
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create account: ${error.message}`)
    }

    return data;
}