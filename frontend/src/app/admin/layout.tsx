"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/api";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, isLoaded, isAuthenticated } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated || !token) {
      router.replace("/login");
      return;
    }
    getUser(token).then((user) => {
      if (!user.is_super_admin) {
        router.replace("/dashboard");
      } else {
        setAuthorized(true);
      }
    }).catch(() => router.replace("/login"));
  }, [token, isLoaded, isAuthenticated, router]);

  if (!isLoaded || !isAuthenticated || !authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-slate-500 font-medium">Overujem prístup...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
