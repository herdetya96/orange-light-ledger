import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryIcon } from "@/components/CategoryIcon";
import { TransactionDialog } from "./TransactionDialog";
import { deleteTransaction, type Transaction } from "@/lib/api";
import { formatDate, formatIDR } from "@/lib/format";

interface Props {
  txn: Transaction | null;
  onClose: () => void;
}

export function TransactionDetailSheet({ txn, onClose }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const qc = useQueryClient();
  const del = useMutation({
    mutationFn: async (id: string) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      toast.success("Transaction deleted");
      setConfirming(false);
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isIncome = txn?.type === "income";
  const amount = txn ? Number(txn.amount) : 0;

  return (
    <>
      <Sheet open={!!txn} onOpenChange={(o) => { if (!o) onClose(); }}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Transaction details</SheetTitle>
          </SheetHeader>
          {txn && (
            <div className="px-4 mt-2 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-fog grid place-items-center">
                  <CategoryIcon name={txn.category?.icon ?? (isIncome ? "Wallet" : "Circle")} className="size-[18px] text-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-slate">{txn.category?.name ?? (isIncome ? "Income" : "Uncategorized")}</div>
                  <div className="text-[13.5px] text-foreground truncate">{txn.note || "—"}</div>
                </div>
                <div className={["text-[18px] font-semibold tracking-tight tabular-nums", isIncome ? "text-success" : "text-foreground"].join(" ")}>
                  {isIncome ? `+${formatIDR(amount)}` : `-${formatIDR(amount)}`}
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-y-3 text-[13px]">
                <dt className="text-steel uppercase text-[10.5px] tracking-[0.12em] font-semibold">Type</dt>
                <dd className="text-foreground capitalize">{txn.type}</dd>
                <dt className="text-steel uppercase text-[10.5px] tracking-[0.12em] font-semibold">Date</dt>
                <dd className="text-foreground">{formatDate(txn.occurred_on)}</dd>
                <dt className="text-steel uppercase text-[10.5px] tracking-[0.12em] font-semibold">Logged</dt>
                <dd className="text-foreground">{formatDate(txn.created_at)}</dd>
              </dl>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="size-4" /> Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirming(true)}
                  className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <TransactionDialog
        open={editing}
        onOpenChange={(o) => { setEditing(o); if (!o) onClose(); }}
        txn={txn}
      />

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => txn && del.mutate(txn.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
