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
    <div className="flex h-screen w-64 flex-col border-r bg-muted/40 px-3 py-4">
      <div className="mb-8 px-4">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Wrench className="h-6 w-6 text-primary" />
          <span>PlumbSide</span>
        </h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.disabled ? "#" : item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                pathname === item.href && "bg-accent text-accent-foreground",
                item.disabled && "text-muted-foreground cursor-not-allowed"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <Link href="/dashboard/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3",
              pathname === "/dashboard/settings" && "bg-accent text-accent-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Nastavenia
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Odhlásiť sa
        </Button>
      </div>
    </div>
  );
}
