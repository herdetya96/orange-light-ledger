import { ArrowDown, ArrowUp } from "lucide-react";

interface Props {
  label: string;
  value: string;
  delta?: number | null;
  deltaLabel?: string;
  positiveIsGood?: boolean;
}

export function StatCard({ label, value, delta, deltaLabel, positiveIsGood = true }: Props) {
  const hasDelta = typeof delta === "number" && isFinite(delta);
  const positive = hasDelta && delta! >= 0;
  const good = positive === positiveIsGood;
  return (
    <div className="rounded-[14px] bg-card ring-1 ring-border p-5">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-steel">
        {label}
      </div>
      <div className="mt-3 text-[28px] font-semibold tracking-tight leading-none text-foreground">
        {value}
      </div>
      {hasDelta && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-1 rounded-full px-2 h-5 text-[11px] font-medium",
              good ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            ].join(" ")}
          >
            {positive ? <ArrowUp className="size-3" strokeWidth={2.2} /> : <ArrowDown className="size-3" strokeWidth={2.2} />}
            {Math.abs(delta!).toFixed(1)}%
          </span>
          {deltaLabel && <span className="text-[11.5px] text-slate">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}
