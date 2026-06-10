import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  BarChart3,
  Target,
  PiggyBank,
} from "lucide-react";

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

  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col bg-fog">
      <div className="h-14 flex items-center px-5 gap-2">
        <div className="size-6 rounded-full grid place-items-center text-white text-[12px] font-bold" style={{ background: "linear-gradient(180deg, #FD901B 0%, #FE6A00 100%)" }}>
          L
        </div>
        <span className="text-[15px] font-semibold tracking-[-0.13px] text-foreground">Ledger</span>
      </div>
      <nav className="px-3 flex flex-col gap-6 mt-2">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-steel">
              {g.label}
            </div>
            <ul className="flex flex-col gap-0.5">
              {g.items.map((it) => {
                const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
                const Icon = it.icon;
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      className={[
                        "flex items-center gap-3 h-9 px-3 rounded-[10px] text-[13.5px]",
                        active
                          ? "bg-active-fog text-foreground font-medium"
                          : "text-graphite hover:bg-active-fog/60",
                      ].join(" ")}
                    >
                      <Icon
                        className={["size-[18px]", active ? "text-primary" : "text-slate"].join(" ")}
                        strokeWidth={1.8}
                      />
                      <span>{it.label}</span>
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
