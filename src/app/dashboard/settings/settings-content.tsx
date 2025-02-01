'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SettingsContent() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add your settings content here */}
        </CardContent>
      </Card>
    </div>
  )
} 