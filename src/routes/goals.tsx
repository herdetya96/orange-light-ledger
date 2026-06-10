import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { fetchGoals, type Goal } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { GoalDialog } from "@/components/goals/GoalDialog";
import { PrimaryButton } from "@/components/PrimaryButton";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — Ledger" },
      { name: "description", content: "Track your savings goals." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const { data: goals = [], isLoading } = useQuery({ queryKey: ["goals"], queryFn: fetchGoals });

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto w-full">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Goals</h1>
          <p className="mt-1 text-[13px] text-slate">What you're saving for, and how far you've come.</p>
        </div>
        <PrimaryButton
          onClick={() => { setEditing(null); setOpen(true); }}
          icon={<Plus className="size-3" strokeWidth={2.6} />}
        >
          New goal
        </PrimaryButton>
      </div>

      {isLoading ? (
        <p className="mt-10 text-[13px] text-slate">Loading…</p>
      ) : goals.length === 0 ? (
        <div className="mt-10 rounded-[14px] bg-card ring-1 ring-border p-10 text-center">
          <h3 className="text-[15px] font-semibold tracking-tight">No goals yet</h3>
          <p className="mt-1 text-[13px] text-slate">Create your first savings goal to see your progress.</p>
          <button
            onClick={() => { setEditing(null); setOpen(true); }}
            className="mt-4 h-9 px-3.5 rounded-md bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-foreground/90"
          >
            <Plus className="size-4" /> New goal
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const target = Number(g.target_amount);
            const saved = Number(g.saved_amount);
            const pct = Math.max(0, Math.min(100, (saved / target) * 100));
            return (
              <article key={g.id} className="rounded-[14px] bg-card ring-1 ring-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[16px] font-semibold tracking-tight">{g.name}</h2>
                    <p className="mt-0.5 text-[12px] text-slate">Target {formatIDR(target)}</p>
                  </div>
                  <button
                    onClick={() => { setEditing(g); setOpen(true); }}
                    className="size-8 grid place-items-center rounded-md text-slate hover:bg-active-fog"
                  >
                    <Pencil className="size-4" />
                  </button>
                </div>
                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <div className="text-[24px] font-semibold tracking-tight tabular-nums">{pct.toFixed(0)}%</div>
                    <div className="text-[12px] text-slate tabular-nums">{formatIDR(saved)} / {formatIDR(target)}</div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-active-fog overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <GoalDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }} goal={editing} />
    </div>
  );
}
