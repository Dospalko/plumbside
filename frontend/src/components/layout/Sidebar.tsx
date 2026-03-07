"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Users, Calendar, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/jobs", label: "Zákazky", icon: Wrench },
  { href: "/dashboard/customers", label: "Zákazníci", icon: Users },
  { href: "/dashboard/calendar", label: "Kalendár (čoskoro)", icon: Calendar, disabled: true },
];

export function Sidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 shrink-0 flex-col bg-transparent px-4 py-6 relative z-0">
      <div className="mb-10 px-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/20">
          <Wrench className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          PlumbSide
        </h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.disabled ? "#" : item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-[42px] px-4 rounded-xl transition-all duration-200 font-medium",
                pathname === item.href 
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200/60" 
                  : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900",
                item.disabled && "text-slate-400 hover:text-slate-400 hover:bg-transparent cursor-not-allowed opacity-60"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", pathname === item.href ? "text-blue-600" : "text-slate-400")} />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1.5 pt-6">
        <Link href="/dashboard/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-[42px] px-4 rounded-xl transition-all duration-200 font-medium",
              pathname === "/dashboard/settings" 
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/60" 
                : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
            )}
          >
            <Settings className={cn("h-[18px] w-[18px]", pathname === "/dashboard/settings" ? "text-blue-600" : "text-slate-400")} />
            Nastavenia
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-[42px] px-4 rounded-xl font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          onClick={logout}
        >
          <LogOut className="h-[18px] w-[18px] text-slate-400" />
          Odhlásiť sa
        </Button>
      </div>
    </div>
  );
}
