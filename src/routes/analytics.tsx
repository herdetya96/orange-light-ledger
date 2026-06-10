import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Ledger" },
      { name: "description", content: "Deeper insight into your spending patterns." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-[13px] text-slate">Deeper charts and breakdowns.</p>
      </div>
      <div className="mt-10 rounded-[14px] bg-card ring-1 ring-border p-12 text-center">
        <div className="mx-auto size-10 rounded-full bg-fog grid place-items-center">
          <BarChart3 className="size-5 text-slate" strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 text-[15px] font-semibold tracking-tight">Analytics is on the way</h2>
        <p className="mt-1 text-[13px] text-slate max-w-md mx-auto">
          Spending by category, income vs expenses, cash flow over time, and saving rate trends will live here.
        </p>
      </div>
    </div>
  );
}
