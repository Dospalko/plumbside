"use client";

import { useAuth } from "@/lib/auth-context";
import { LogOut, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, isAuthenticated, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoaded, isAuthenticated, router]);

  if (!isLoaded || !isAuthenticated) return null;

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 font-sans text-slate-900 pb-safe">
      <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-4 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">PlumbSide</span>
        </div>
        <button 
          onClick={logout}
          className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Odhlásiť sa"
        >
          <LogOut className="w-5 h-5 text-slate-300" />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative pt-4 px-4 bg-transparent pb-10">
        {children}
      </main>
    </div>
  );
}
