import type { Period } from "@/lib/period";
import { PERIODS } from "@/lib/period";

interface Props {
  value: Period;
  onChange: (p: Period) => void;
}

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-background">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={[
            "h-7 px-2.5 rounded text-[12px] font-medium transition-colors",
            value === p
              ? "bg-foreground text-background"
              : "text-slate hover:text-foreground",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
