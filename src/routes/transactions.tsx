import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionDialog } from "@/components/transactions/TransactionDialog";
import { TransactionDetailSheet } from "@/components/transactions/TransactionDetailSheet";
import { fetchCategories, fetchTransactions, type Transaction } from "@/lib/api";
import { formatDateShort, formatIDR } from "@/lib/format";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Ledger" },
      { name: "description", content: "Your full ledger of income and expenses." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [range, setRange] = useState<"all" | "30d" | "90d" | "365d">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const filters = useMemo(() => {
    const from =
      range === "all"
        ? undefined
        : (() => {
            const d = new Date();
            d.setDate(d.getDate() - (range === "30d" ? 30 : range === "90d" ? 90 : 365));
            return d.toISOString().slice(0, 10);
          })();
    return { from, type, categoryId, search: search.trim() || undefined };
  }, [range, type, categoryId, search]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
  });

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto w-full">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-[13px] text-slate">Every entry, sorted newest first.</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="h-9 px-3.5 rounded-md bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-foreground/90 transition-colors"
        >
          <Plus className="size-4" strokeWidth={2} /> Add Transaction
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-[15px] text-steel" strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Search descriptions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md bg-background text-[13px] border border-border focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as "all" | "income" | "expense")}>
          <SelectTrigger className="h-9 w-[120px] text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-9 w-[160px] text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
          <SelectTrigger className="h-9 w-[140px] text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="365d">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 rounded-[14px] bg-card ring-1 ring-border overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_180px_40px] px-5 py-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-steel border-b border-border">
          <div>Description</div>
          <div>Category</div>
          <div>Date</div>
          <div className="text-right">Amount</div>
          <div />
        </div>
        {isLoading && (
          <div className="px-5 py-12 text-center text-[13px] text-slate">Loading…</div>
        )}
        {!isLoading && rows.length === 0 && (
          <div className="px-5 py-16 text-center text-[13px] text-slate">
            No transactions match these filters.
          </div>
        )}
        <ul>
          {rows.map((t) => {
            const isIncome = t.type === "income";
            return (
              <li
                key={t.id}
                className="grid grid-cols-[1.4fr_1fr_1fr_180px_40px] items-center px-5 py-3.5 text-[13.5px] hover:bg-fog/80 cursor-pointer transition-colors border-b border-border last:border-b-0"
                onClick={() => setSelected(t)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-full bg-fog grid place-items-center shrink-0">
                    <CategoryIcon name={t.category?.icon ?? (isIncome ? "Wallet" : "Circle")} className="size-[16px] text-foreground" />
                  </div>
                  <span className="truncate text-foreground">{t.note || "—"}</span>
                </div>
                <div className="text-slate truncate">{t.category?.name ?? (isIncome ? "Income" : "—")}</div>
                <div className="text-slate">{formatDateShort(t.occurred_on)}</div>
                <div className={["text-right tabular-nums font-medium", isIncome ? "text-success" : "text-foreground"].join(" ")}>
                  {isIncome ? "+" : "-"}{formatIDR(Number(t.amount))}
                </div>
                <button
                  className="justify-self-end size-8 grid place-items-center rounded-md text-slate hover:bg-active-fog"
                  onClick={(e) => { e.stopPropagation(); setSelected(t); }}
                  aria-label="More"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <TransactionDialog open={addOpen} onOpenChange={setAddOpen} />
      <TransactionDetailSheet txn={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
