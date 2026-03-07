import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar />
      <div className="flex flex-1 flex-col p-2 pl-0 sm:pl-2">
        <div className="flex flex-col flex-1 bg-white rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative z-10 h-full">
          <TopNav />
          <main className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto bg-white/40 relative">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
