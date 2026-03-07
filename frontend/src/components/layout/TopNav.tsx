import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-6 lg:px-10 z-20 sticky top-0">
      <div className="flex items-center gap-4">
        {/* We can place contextual page titles or breadcrumbs here in the future if desired */}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white"></span>
          <span className="sr-only">Nové notifikácie</span>
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-slate-200">
          <AvatarFallback className="bg-blue-50 text-blue-700 font-medium text-xs">RS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
