import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGoal, updateGoal, type Goal } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  goal?: Goal | null;
}

export function GoalDialog({ open, onOpenChange, goal }: Props) {
  const editing = !!goal;
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (open) {
      setName(goal?.name ?? "");
      setTarget(goal ? String(goal.target_amount) : "");
      setSaved(goal ? String(goal.saved_amount) : "0");
    }
  }, [open, goal]);

  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: async () => {
      const t = parseFloat(target);
      const s = parseFloat(saved || "0");
      if (!name.trim()) throw new Error("Name is required");
      if (!isFinite(t) || t <= 0) throw new Error("Target must be greater than 0");
      const payload = { name: name.trim(), target_amount: t, saved_amount: Math.max(0, s) };
      if (editing && goal) await updateGoal(goal.id, payload);
      else await createGoal(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast.success(editing ? "Goal updated" : "Goal created");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const valid = name.trim().length > 0 && parseFloat(target) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{editing ? "Edit goal" : "New goal"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="g-name">Name</Label>
            <Input id="g-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hajj, Home, Married" maxLength={80} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="g-target">Target amount (IDR)</Label>
            <Input id="g-target" type="number" min="0" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="g-saved">Already saved</Label>
            <Input id="g-saved" type="number" min="0" value={saved} onChange={(e) => setSaved(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => m.mutate()} disabled={!valid || m.isPending} className="bg-foreground text-background hover:bg-foreground/90">
            {m.isPending ? "Saving…" : editing ? "Save" : "Create goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
