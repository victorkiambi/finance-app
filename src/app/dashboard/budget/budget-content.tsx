'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BudgetContent() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Budget</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add your budget content here */}
        </CardContent>
      </Card>
    </div>
  )
} 