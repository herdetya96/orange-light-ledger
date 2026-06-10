import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTransaction,
  fetchCategories,
  updateTransaction,
  type Transaction,
  type TxnType,
} from "@/lib/api";
import { todayISO } from "@/lib/format";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  txn?: Transaction | null;
}

export function TransactionDialog({ open, onOpenChange, txn }: Props) {
  const editing = !!txn;
  const [type, setType] = useState<TxnType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [occurredOn, setOccurredOn] = useState<string>(todayISO());
  const [note, setNote] = useState<string>("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (open) {
      if (txn) {
        setType(txn.type);
        setAmount(String(txn.amount));
        setCategoryId(txn.category_id ?? "");
        setOccurredOn(txn.occurred_on);
        setNote(txn.note ?? "");
      } else {
        setType("expense");
        setAmount("");
        setCategoryId("");
        setOccurredOn(todayISO());
        setNote("");
      }
    }
  }, [open, txn]);

  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(amount);
      if (!isFinite(amt) || amt <= 0) throw new Error("Amount must be greater than 0");
      if (!note.trim()) throw new Error("Description is required");
      const payload = {
        type,
        amount: amt,
        category_id: type === "expense" ? (categoryId || null) : null,
        occurred_on: occurredOn,
        note: note.trim(),
      };
      if (editing && txn) await updateTransaction(txn.id, payload);
      else await createTransaction(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      toast.success(editing ? "Transaction updated" : "Transaction added");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const valid = parseFloat(amount) > 0 && note.trim().length > 0;
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="inline-flex rounded-md border border-border p-0.5">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={[
                "flex-1 h-8 text-[12.5px] font-medium rounded-[5px] transition-colors",
                type === "expense" ? "bg-foreground text-background" : "text-slate hover:text-foreground",
              ].join(" ")}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={[
                "flex-1 h-8 text-[12.5px] font-medium rounded-[5px] transition-colors",
                type === "income" ? "bg-foreground text-background" : "text-slate hover:text-foreground",
              ].join(" ")}
            >
              Income
            </button>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="amount">Amount (IDR)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          {type === "expense" && (
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={occurredOn}
              onChange={(e) => setOccurredOn(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="note">Description</Label>
            <Textarea
              id="note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was this for?"
              maxLength={280}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!valid || mutation.isPending}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {mutation.isPending ? "Saving…" : editing ? "Save" : "Add transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
