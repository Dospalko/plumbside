"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, Users, Calendar, Settings, LogOut, LayoutDashboard } from "lucide-react";
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
    <div className="flex h-full w-64 shrink-0 flex-col bg-slate-900 text-slate-100 px-4 py-8 shadow-xl relative z-20">
      
      <div className="mb-10 px-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md">
          <Wrench className="h-5 w-5 text-white stroke-[2.5]" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
          Rýchly <br/> Servis
        </h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Hlavné Menu
        </p>
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.disabled ? "#" : item.href} className="w-full">
              <button
                className={cn(
                  "w-full flex items-center justify-start gap-3 h-11 px-3 rounded-lg font-medium text-sm transition-all duration-200",
                  isActive 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  item.disabled && "text-slate-500 hover:text-slate-500 hover:bg-transparent cursor-not-allowed opacity-60"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                {item.label}
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1.5 pt-6 border-t border-slate-800">
        <Link href="/dashboard/settings" className="w-full">
          <button
            className={cn(
              "w-full flex items-center justify-start gap-3 h-11 px-3 rounded-lg font-medium text-sm transition-all duration-200",
              pathname === "/dashboard/settings" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Settings className={cn("h-5 w-5", pathname === "/dashboard/settings" ? "text-white" : "text-slate-400")} />
            Nastavenia
          </button>
        </Link>
        <button
          className="w-full flex items-center justify-start gap-3 h-11 px-3 rounded-lg font-medium text-sm transition-all duration-200 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-400" />
          Odhlásiť sa
        </button>
      </div>
    </div>
  );
}
