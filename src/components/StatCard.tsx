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
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-steel">
          {label}
        </div>
        {hasDelta && (
          <span
            className={[
              "inline-flex items-center gap-0.5 rounded-full px-1.5 h-5 text-[11px] font-medium tabular-nums",
              good
                ? "bg-[#EEFFF3] text-success"
                : "bg-[#FFECEC] text-destructive",
            ].join(" ")}
          >
            {positive ? <ArrowUp className="size-3" strokeWidth={2.4} /> : <ArrowDown className="size-3" strokeWidth={2.4} />}
            {positive ? "+" : "-"}{Math.abs(delta!).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-4 text-[24px] font-semibold tracking-[-0.02em] leading-[28px] text-foreground tabular-nums">
        {value}
      </div>
      {deltaLabel && <div className="mt-2 text-[11.5px] text-slate">{deltaLabel}</div>}
    </div>
  );
}
