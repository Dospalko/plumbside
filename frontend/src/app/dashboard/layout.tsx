import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      <RoleGuard />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
