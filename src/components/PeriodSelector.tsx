import type { Period } from "@/lib/period";
import { PERIODS } from "@/lib/period";

interface Props {
  value: Period;
  onChange: (p: Period) => void;
}

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-fog ring-1 ring-border">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={[
            "h-6 px-2.5 rounded-full text-[11px] font-medium tabular-nums transition-colors",
            value === p
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-slate hover:text-foreground",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
