import { UserProvider } from '@/contexts/user-context'
import { DashboardNav } from "./components/nav"
import { Navbar } from "./components/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dashboardNavItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: "layout-dashboard"
    },
    {
      title: "Transactions",
      href: "/dashboard/transactions",
      icon: "list"
    },
    {
      title: "Budget",
      href: "/dashboard/budget",
      icon: "pie-chart"
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings"
    }
  ]

  return (
    <UserProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="hidden border-r bg-gray-100/40 lg:block lg:w-64">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
              <span className="font-semibold">Personal Finance Manager</span>
            </div>
            <DashboardNav items={dashboardNavItems} />
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </UserProvider>
  )
} 