import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { PeriodSelector } from "@/components/PeriodSelector";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { fetchGoals, fetchTransactions, type Transaction } from "@/lib/api";
import { formatCompact, formatDate, formatDateShort, formatIDR } from "@/lib/format";
import { isoDate, periodStart, previousPeriodStart, type Period } from "@/lib/period";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Ledger" },
      { name: "description", content: "Your financial dashboard at a glance." },
    ],
  }),
  component: Overview,
});

function sumByType(txns: Transaction[], type: "income" | "expense") {
  return txns
    .filter((t) => t.type === type)
    .reduce((a, t) => a + Number(t.amount), 0);
}

function pctDelta(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return ((curr - prev) / prev) * 100;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

function Overview() {
  const [period, setPeriod] = useState<Period>("3M");
  const [addOpen, setAddOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  const start = periodStart(period, now);
  const prevStart = previousPeriodStart(period, now);

  const { data: current = [] } = useQuery({
    queryKey: ["transactions", { from: isoDate(start), to: isoDate(now) }],
    queryFn: () => fetchTransactions({ from: isoDate(start), to: isoDate(now) }),
  });
  const { data: previous = [] } = useQuery({
    queryKey: ["transactions", { from: isoDate(prevStart), to: isoDate(start) }],
    queryFn: () => fetchTransactions({ from: isoDate(prevStart), to: isoDate(start) }),
  });
  const { data: recent = [] } = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () => fetchTransactions(),
  });
  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: fetchGoals });

  const income = sumByType(current, "income");
  const expense = sumByType(current, "expense");
  const balance = income - expense;
  const saving = income > 0 ? ((income - expense) / income) * 100 : 0;

  const prevIncome = sumByType(previous, "income");
  const prevExpense = sumByType(previous, "expense");
  const prevBalance = prevIncome - prevExpense;
  const prevSaving = prevIncome > 0 ? ((prevIncome - prevExpense) / prevIncome) * 100 : 0;

  // Trend buckets
  const trend = useMemo(() => {
    const buckets: { label: string; amount: number }[] = [];
    const cursor = new Date(start);
    if (period === "1M") {
      // 4 weeks
      for (let i = 0; i < 4; i++) {
        const s = new Date(cursor);
        cursor.setDate(cursor.getDate() + 7);
        const e = new Date(cursor);
        const total = current
          .filter((t) => t.type === "expense" && t.occurred_on >= isoDate(s) && t.occurred_on < isoDate(e))
          .reduce((a, t) => a + Number(t.amount), 0);
        buckets.push({ label: `W${i + 1}`, amount: total });
      }
    } else {
      const months = period === "3M" ? 3 : period === "6M" ? 6 : 12;
      const c = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
      for (let i = 0; i < months; i++) {
        const s = new Date(c);
        const e = new Date(c.getFullYear(), c.getMonth() + 1, 1);
        const total = current
          .filter((t) => t.type === "expense" && t.occurred_on >= isoDate(s) && t.occurred_on < isoDate(e))
          .reduce((a, t) => a + Number(t.amount), 0);
        buckets.push({ label: s.toLocaleString("en-US", { month: "short" }), amount: total });
        c.setMonth(c.getMonth() + 1);
      }
    }
    return buckets;
  }, [current, period, start, now]);

  // Top categories (expenses)
  const topCategories = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; color: string }>();
    for (const t of current) {
      if (t.type !== "expense") continue;
      const key = t.category?.id ?? "uncat";
      const name = t.category?.name ?? "Uncategorized";
      const existing = map.get(key);
      const amount = (existing?.amount ?? 0) + Number(t.amount);
      map.set(key, { name, amount, color: existing?.color ?? "" });
    }
    const arr = Array.from(map.values()).sort((a, b) => b.amount - a.amount);
    return arr.slice(0, 4).map((c, i) => ({ ...c, color: CHART_COLORS[i] }));
  }, [current]);
  const topTotal = topCategories.reduce((a, c) => a + c.amount, 0);

  const periodLabel: Record<Period, string> = { "1M": "vs prev month", "3M": "vs prev 3M", "6M": "vs prev 6M", "1Y": "vs prev year" };

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-[13px] text-slate">{formatDate(now)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddOpen(true)}
            className="h-9 px-3.5 rounded-md bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-2 hover:bg-foreground/90 transition-colors"
          >
            <span className="grid place-items-center size-4 rounded-full bg-primary">
              <Plus className="size-3 text-primary-foreground" strokeWidth={2.6} />
            </span>
            Add Transaction
          </button>
        </div>
      </div>

      {/* Period selector under header? keep here for context */}

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total balance" value={formatIDR(balance)} delta={pctDelta(balance, prevBalance)} deltaLabel={periodLabel[period]} />
        <StatCard label="Income" value={formatIDR(income)} delta={pctDelta(income, prevIncome)} deltaLabel={periodLabel[period]} />
        <StatCard label="Expenses" value={formatIDR(expense)} delta={pctDelta(expense, prevExpense)} deltaLabel={periodLabel[period]} positiveIsGood={false} />
        <StatCard label="Saving rate" value={`${saving.toFixed(1)}%`} delta={saving - prevSaving} deltaLabel={periodLabel[period]} />
      </div>

      {/* Charts row */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <section className="rounded-[14px] bg-card ring-1 ring-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight">Spending Overview</h2>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
          <div className="mt-5 h-[240px]">
            <ResponsiveContainer>
              <BarChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--steel)" }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
                  formatter={(v: number) => [formatIDR(v), "Spent"]}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {(() => {
                    const max = Math.max(...trend.map((b) => b.amount), 0);
                    const threshold = max * 0.7;
                    return trend.map((b, i) => (
                      <Cell key={i} fill={b.amount >= threshold && b.amount > 0 ? "var(--primary)" : "var(--active-fog)"} />
                    ));
                  })()}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[14px] bg-card ring-1 ring-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight">Top Categories</h2>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
          {topCategories.length === 0 ? (
            <p className="mt-8 text-[13px] text-slate text-center">No expenses in this period yet.</p>
          ) : (
            <div className="mt-4 flex items-center gap-5">
              <div className="relative size-[160px] shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={topCategories} dataKey="amount" innerRadius={56} outerRadius={78} stroke="none" paddingAngle={2}>
                      {topCategories.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
                  <div>
                    <div className="text-[13px] font-semibold tracking-tight tabular-nums">{formatCompact(topCategories[0].amount)}</div>
                    <div className="text-[10.5px] text-slate mt-0.5">{topCategories[0].name}</div>
                  </div>
                </div>
              </div>
              <ul className="flex-1 flex flex-col gap-2.5 min-w-0">
                {topCategories.map((c) => (
                  <li key={c.name} className="min-w-0">
                    <div className="flex items-center gap-2 text-[12px] text-slate">
                      <span className="size-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="ml-3.5 text-[14px] font-semibold tabular-nums text-foreground">{formatIDR(c.amount)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>


      {/* Bottom row */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
        <section className="rounded-[14px] bg-card ring-1 ring-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight">Recent Transactions</h2>
            <Link to="/transactions" className="text-[12px] text-slate hover:text-foreground rounded-full ring-1 ring-border px-2.5 h-6 inline-flex items-center">View All</Link>
          </div>

          <ul className="mt-3 divide-y divide-border">
            {recent.slice(0, 6).map((t) => {
              const isIncome = t.type === "income";
              return (
                <li key={t.id} className="py-3 flex items-center gap-3">
                  <div className="size-9 rounded-full bg-fog grid place-items-center shrink-0">
                    <CategoryIcon name={t.category?.icon ?? (isIncome ? "Wallet" : "Circle")} className="size-[16px] text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] text-foreground truncate">{t.note || t.category?.name || "Transaction"}</div>
                    <div className="text-[11.5px] text-slate">{formatDateShort(t.occurred_on)} · {t.category?.name ?? (isIncome ? "Income" : "—")}</div>
                  </div>
                  <div className={["text-[13.5px] font-medium tabular-nums shrink-0", isIncome ? "text-success" : "text-foreground"].join(" ")}>
                    {isIncome ? "+" : "-"}{formatIDR(Number(t.amount))}
                  </div>
                </li>
              );
            })}
            {recent.length === 0 && (
              <li className="py-8 text-center text-[13px] text-slate">No transactions yet. Add your first one.</li>
            )}
          </ul>
        </section>

        <section className="rounded-[14px] bg-card ring-1 ring-border p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight">Goals</h2>
            <Link to="/goals" className="text-[12px] text-slate hover:text-foreground rounded-full ring-1 ring-border px-2.5 h-6 inline-flex items-center">View All</Link>
          </div>
          <ul className="mt-4 flex flex-col gap-5">
            {goals.slice(0, 3).map((g) => {
              const pct = Math.max(0, Math.min(100, (Number(g.saved_amount) / Number(g.target_amount)) * 100));
              return (
                <li key={g.id} className="rounded-[10px] ring-1 ring-border p-4">
                  <div className="text-[13px] text-slate">{g.name}</div>
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <div className="text-[24px] font-semibold tracking-tight tabular-nums leading-none">{formatIDR(Number(g.target_amount))}</div>
                    <div className="text-[11.5px] text-slate tabular-nums">{pct.toFixed(0)}% achieved</div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-active-fog overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );

            })}
            {goals.length === 0 && (
              <li className="py-8 text-center text-[13px] text-slate">No goals yet. <Link to="/goals" className="text-foreground underline">Create one</Link>.</li>
            )}
          </ul>
        </section>
      </div>

      <TransactionDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
