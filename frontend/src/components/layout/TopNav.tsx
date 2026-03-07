import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
      <div className="w-full flex-1">
        {/* Search could go here */}
      </div>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive"></span>
        <span className="sr-only">Toggle notifications</span>
      </Button>
      <Avatar className="h-8 w-8 cursor-pointer">
        <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
      </Avatar>
    </header>
  );
}
