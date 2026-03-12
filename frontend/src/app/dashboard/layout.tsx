"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900 relative">
      <RoleGuard />
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden w-full lg:w-auto">
        <TopNav onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
