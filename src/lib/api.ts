import { supabase } from "@/integrations/supabase/client";

export type TxnType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: TxnType;
  icon: string | null;
  color: string | null;
  is_archived: boolean;
}

export interface Transaction {
  id: string;
  type: TxnType;
  amount: number;
  category_id: string | null;
  occurred_on: string;
  note: string | null;
  created_at: string;
  category?: Category | null;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  created_at: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_archived", false)
    .order("name");
  if (error) throw error;
  return (data as Category[]) ?? [];
}

export async function fetchTransactions(filters?: {
  from?: string;
  to?: string;
  type?: TxnType | "all";
  categoryId?: string | "all";
  search?: string;
}): Promise<Transaction[]> {
  let q = supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (filters?.from) q = q.gte("occurred_on", filters.from);
  if (filters?.to) q = q.lte("occurred_on", filters.to);
  if (filters?.type && filters.type !== "all") q = q.eq("type", filters.type);
  if (filters?.categoryId && filters.categoryId !== "all")
    q = q.eq("category_id", filters.categoryId);
  if (filters?.search) q = q.ilike("note", `%${filters.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data as unknown as Transaction[]) ?? [];
}

export async function createTransaction(input: {
  type: TxnType;
  amount: number;
  category_id: string | null;
  occurred_on: string;
  note: string | null;
}) {
  const { error } = await supabase.from("transactions").insert(input);
  if (error) throw error;
}

export async function updateTransaction(
  id: string,
  input: Partial<{
    type: TxnType;
    amount: number;
    category_id: string | null;
    occurred_on: string;
    note: string | null;
  }>,
) {
  const { error } = await supabase.from("transactions").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Goal[]) ?? [];
}

export async function createGoal(input: {
  name: string;
  target_amount: number;
  saved_amount: number;
}) {
  const { error } = await supabase.from("goals").insert(input);
  if (error) throw error;
}

export async function updateGoal(
  id: string,
  input: Partial<{ name: string; target_amount: number; saved_amount: number }>,
) {
  const { error } = await supabase.from("goals").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}
