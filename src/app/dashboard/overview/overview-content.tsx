'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/user-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight,
  Wallet,
  PiggyBank
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getOverviewData, getRecentTransactions, getAccounts } from './overview-content-actions'
import type { OverviewData, Transaction, Account } from './overview-content-actions'
import { AccountSetupDialog } from './components/account-setup-dialog'

function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function OverviewContent() {
  const { user, isLoading: userLoading } = useUser()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [overviewData, setOverviewData] = useState<OverviewData>({
    balance: 0,
    income: 0,
    expenses: 0,
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    async function loadData() {
      try {
        const [accountsData, overview, recent] = await Promise.all([
          getAccounts(user.id),
          getOverviewData(user.id),
          getRecentTransactions(user.id)
        ])
        setAccounts(accountsData)
        setOverviewData(overview)
        setTransactions(recent)
      } catch (e) {
        setError('Failed to load dashboard data')
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  if (userLoading || isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!accounts.length) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">
            Let's get started by setting up your first account
          </p>
        </div>
        {user && (
          <AccountSetupDialog
            userId={user.id}
            onAccountCreated={() => {
              if (user) {
                getAccounts(user.id).then(setAccounts)
              }
            }}
          />
        )}
      </>
    )
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.initial_balance, 0)


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      </div>

      {/* Account Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>

        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {account.name}
              </CardTitle>
              {account.type === 'checking' ? (
                <Wallet className="h-4 w-4 text-muted-foreground" />
              ) : (
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(account.initial_balance, account.currency)}
              </div>
              <p className="text-xs text-muted-foreground capitalize">
                {account.type} Account
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Income
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(overviewData.income)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month&#39;s total income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(overviewData.expenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's total expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Net Income
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overviewData.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatCurrency(overviewData.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's net income
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell className={transaction.amount > 0 ? 'text-emerald-500' : 'text-red-500'}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}