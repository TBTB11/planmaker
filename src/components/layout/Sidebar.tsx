import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
    Users,
    Map,
    Settings,
    Home,
    PieChart
} from "lucide-react"

const sidebarItems = [
    { icon: Home, label: "ダッシュボード", href: "/" },
    { icon: Users, label: "生徒一覧", href: "/students" },
    { icon: Map, label: "一括計画", href: "/planning" },
    { icon: PieChart, label: "レポート", href: "/reports" },
    { icon: Settings, label: "設定", href: "/settings" },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight text-primary">
                    PlanMaker
                </h1>
            </div>
            <nav className="flex-1 space-y-1 px-4">
                {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t text-xs text-muted-foreground text-center">
                v0.1.0 Local Only
            </div>
        </div>
    )
}
