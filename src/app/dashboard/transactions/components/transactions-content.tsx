'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TransactionsContent() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add your transactions content here */}
        </CardContent>
      </Card>
    </div>
  )
} 