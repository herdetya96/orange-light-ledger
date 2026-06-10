import { Bell, PanelLeft, Search, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/components/sidebar-context";

export function TopBar() {
  const { toggle, collapsed } = useSidebar();
  return (
    <header className="sticky top-0 z-20 h-14 bg-background border-b border-border flex items-center px-5 gap-4">
      <button
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="size-9 grid place-items-center rounded-md text-slate hover:bg-fog transition-colors"
      >
        <PanelLeft className="size-[18px]" strokeWidth={1.8} />
      </button>
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-[15px] text-steel" strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Search transactions, goals…"
            className="w-full h-9 pl-9 pr-14 rounded-md bg-fog text-[13px] text-foreground placeholder:text-steel border border-transparent focus:bg-background focus:border-border focus:outline-none transition-colors"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] text-steel border border-border rounded px-1.5 py-0.5 font-medium">
            ⌘K
          </kbd>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="size-9 grid place-items-center rounded-md text-slate hover:bg-fog transition-colors">
          <Sun className="size-[18px]" strokeWidth={1.8} />
        </button>
        <button className="size-9 grid place-items-center rounded-md text-slate hover:bg-fog transition-colors relative">
          <Bell className="size-[18px]" strokeWidth={1.8} />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
        </button>
        <Avatar className="size-8 ml-1">
          <AvatarFallback className="bg-foreground text-background text-[11px] font-semibold">H</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
