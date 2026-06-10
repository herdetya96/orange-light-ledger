import * as Icons from "lucide-react";
import { HelpCircle, type LucideIcon } from "lucide-react";

interface Props {
  name?: string | null;
  className?: string;
}

export function CategoryIcon({ name, className }: Props) {
  const Lib = Icons as unknown as Record<string, LucideIcon>;
  const Icon = (name && Lib[name]) || HelpCircle;
  return <Icon className={className} strokeWidth={1.8} />;
}
