import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = { collapsed: boolean; toggle: () => void; setCollapsed: (v: boolean) => void };
const SidebarCtx = createContext<Ctx | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      const v = localStorage.getItem("ledger:sidebar-collapsed");
      if (v === "1") setCollapsed(true);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("ledger:sidebar-collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);
  return (
    <SidebarCtx.Provider value={{ collapsed, toggle: () => setCollapsed((c) => !c), setCollapsed }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
