import { Bell, Menu } from "lucide-react";

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 lg:px-8 z-20 sticky top-0 shadow-sm">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors -ml-2"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
        {/* Placeholder for future page titles */}
      </div>
      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600"></span>
          <span className="sr-only">Nové notifikácie</span>
        </button>
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200 text-sm">
          RS
        </div>
      </div>
    </header>
  );
}
