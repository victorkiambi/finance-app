'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  List, 
  PieChart, 
  Settings,
  LucideIcon
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: string
}

interface DashboardNavProps {
  items: NavItem[]
}

const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "list": List,
  "pie-chart": PieChart,
  "settings": Settings,
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-1 px-2 py-4">
      {items.map((item) => {
        const Icon = iconMap[item.icon]
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900",
              pathname === item.href
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700"
            )}
          >
            {Icon && <Icon className="mr-3 h-5 w-5" />}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
} 