import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  Target,
  PiggyBank,
} from "lucide-react";
import { useSidebar } from "@/components/sidebar-context";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "MAIN",
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
      { to: "/account", label: "Account", icon: Wallet },
      { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "PLAN",
    items: [
      { to: "/goals", label: "Goals", icon: Target },
      { to: "/budget", label: "Budget", icon: PiggyBank },
    ],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { collapsed } = useSidebar();

  return (
    <aside
      className={[
        "hidden md:flex shrink-0 flex-col bg-fog transition-[width] duration-200 ease-out",
        collapsed ? "w-[64px]" : "w-[240px]",
      ].join(" ")}
    >
      <div className={["h-14 flex items-center gap-2", collapsed ? "px-4 justify-center" : "px-5"].join(" ")}>
        <div
          className="size-6 rounded-full grid place-items-center text-white text-[12px] font-bold shrink-0"
          style={{ background: "linear-gradient(180deg, #FD901B 0%, #FE6A00 100%)" }}
        >
          L
        </div>
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-[-0.13px] text-foreground">Ledger</span>
        )}
      </div>
      <nav className={["flex flex-col gap-6 mt-2", collapsed ? "px-2" : "px-3"].join(" ")}>
        {groups.map((g) => (
          <div key={g.label}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-steel">
                {g.label}
              </div>
            )}
            <ul className="flex flex-col gap-0.5">
              {g.items.map((it) => {
                const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
                const Icon = it.icon;
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      title={collapsed ? it.label : undefined}
                      className={[
                        "flex items-center h-9 rounded-[10px] text-[13.5px]",
                        collapsed ? "justify-center px-0" : "gap-3 px-3",
                        active
                          ? "bg-active-fog text-foreground font-medium"
                          : "text-graphite hover:bg-active-fog/60",
                      ].join(" ")}
                    >
                      <Icon
                        className={["size-[18px] shrink-0", active ? "text-primary" : "text-slate"].join(" ")}
                        strokeWidth={1.8}
                      />
                      {!collapsed && <span>{it.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
