import { createFileRoute } from "@tanstack/react-router";
import { PiggyBank } from "lucide-react";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget — Ledger" },
      { name: "description", content: "Per-category monthly limits." },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Budget</h1>
        <p className="mt-1 text-[13px] text-slate">Per-category monthly limits.</p>
      </div>
      <div className="mt-10 rounded-[14px] bg-card ring-1 ring-border p-12 text-center">
        <div className="mx-auto size-10 rounded-full bg-fog grid place-items-center">
          <PiggyBank className="size-5 text-slate" strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 text-[15px] font-semibold tracking-tight">Budgets are coming soon</h2>
        <p className="mt-1 text-[13px] text-slate max-w-md mx-auto">
          Set a monthly cap per category and get a quiet warning before you go over.
        </p>
      </div>
    </div>
  );
}
