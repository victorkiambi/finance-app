'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/user-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight,
  AlertCircle
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
import { getOverviewData, getRecentTransactions } from './overview-content-actions'
import type { OverviewData, Transaction } from './overview-content-actions'


export function OverviewContent() {
  const { user, isLoading: userLoading } = useUser()
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
        const [overview, recent] = await Promise.all([
          getOverviewData(user.id),
          getRecentTransactions(user.id)
        ])
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

  if (overviewData.balance == 0 || transactions.length == 0) {
    return (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-muted-foreground">
            No data available
          </p>
        </div>
    )
  } else {


  }
}