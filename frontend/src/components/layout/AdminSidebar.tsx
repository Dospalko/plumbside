"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LogOut, LayoutDashboard, Building2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Prehľad Platformy", icon: LayoutDashboard },
  { href: "/admin/tenants", label: "Spravovať Firmy", icon: Building2 },
];

export function AdminSidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 shrink-0 flex-col bg-slate-950 text-slate-100 px-4 py-8 shadow-xl relative z-20 border-r border-red-900/30">
      
      <div className="mb-10 px-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-md">
          <ShieldCheck className="h-5 w-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
            Super Admin
          </h1>
          <p className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest leading-none mt-1">Plumbside Core</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Administrácia
        </p>
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="w-full">
              <button
                className={cn(
                  "w-full flex items-center justify-start gap-3 h-11 px-3 rounded-lg font-medium text-sm transition-all duration-200",
                  isActive 
                    ? "bg-red-600 text-white shadow-sm" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
        <Link href="/dashboard" className="w-full mb-2">
          <button
            className="w-full flex items-center justify-start gap-3 h-11 px-3 rounded-lg font-medium text-sm transition-all duration-200 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
            Naspäť do Klientskej Zóny
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
