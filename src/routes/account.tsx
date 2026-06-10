import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fetchTransactions } from "@/lib/api";
import { formatIDR } from "@/lib/format";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — Ledger" },
      { name: "description", content: "Profile, balances and connected sources." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { data: txns = [] } = useQuery({ queryKey: ["transactions"], queryFn: () => fetchTransactions() });
  const income = txns.filter((t) => t.type === "income").reduce((a, t) => a + Number(t.amount), 0);
  const expense = txns.filter((t) => t.type === "expense").reduce((a, t) => a + Number(t.amount), 0);

  return (
    <div className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto w-full">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-[13px] text-slate">Your profile and balances.</p>
      </div>

      <section className="mt-6 rounded-[14px] bg-card ring-1 ring-border p-6 flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-foreground text-background text-[18px] font-semibold">H</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-[16px] font-semibold tracking-tight">Herdetya</div>
          <div className="text-[12.5px] text-slate">Base currency: IDR · Single local user</div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[14px] bg-card ring-1 ring-border p-5">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-steel">Net balance</div>
          <div className="mt-3 text-[24px] font-semibold tracking-tight">{formatIDR(income - expense)}</div>
        </div>
        <div className="rounded-[14px] bg-card ring-1 ring-border p-5">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-steel">All-time income</div>
          <div className="mt-3 text-[24px] font-semibold tracking-tight text-success">{formatIDR(income)}</div>
        </div>
        <div className="rounded-[14px] bg-card ring-1 ring-border p-5">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-steel">All-time expenses</div>
          <div className="mt-3 text-[24px] font-semibold tracking-tight">{formatIDR(expense)}</div>
        </div>
      </div>

      <section className="mt-4 rounded-[14px] bg-card ring-1 ring-border p-6">
        <h2 className="text-[15px] font-semibold tracking-tight">Connected sources</h2>
        <p className="mt-1 text-[13px] text-slate">Bank syncing is not part of this version.</p>
      </section>
    </div>
  );
}
