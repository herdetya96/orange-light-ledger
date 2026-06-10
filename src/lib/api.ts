// Local-only data layer backed by localStorage.
// All functions are async to keep the existing react-query call sites unchanged.

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

const KEYS = {
  categories: "ledger:categories",
  transactions: "ledger:transactions",
  goals: "ledger:goals",
  seeded: "ledger:seeded:v1",
} as const;

const hasStorage = () => typeof window !== "undefined" && !!window.localStorage;

function read<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { name: "Food", type: "expense", icon: "Utensils", color: "#f97316", is_archived: false },
  { name: "Groceries", type: "expense", icon: "ShoppingCart", color: "#525252", is_archived: false },
  { name: "Transport", type: "expense", icon: "Car", color: "#737373", is_archived: false },
  { name: "Shopping", type: "expense", icon: "ShoppingBag", color: "#a1a1a1", is_archived: false },
  { name: "Bills", type: "expense", icon: "Receipt", color: "#525252", is_archived: false },
  { name: "Entertainment", type: "expense", icon: "Film", color: "#737373", is_archived: false },
  { name: "Health", type: "expense", icon: "Heart", color: "#a1a1a1", is_archived: false },
  { name: "Salary", type: "income", icon: "Briefcase", color: "#16a34a", is_archived: false },
  { name: "Freelance", type: "income", icon: "Laptop", color: "#16a34a", is_archived: false },
  { name: "Other Income", type: "income", icon: "Wallet", color: "#16a34a", is_archived: false },
];

function ensureSeed() {
  if (!hasStorage()) return;
  if (window.localStorage.getItem(KEYS.seeded)) return;
  const cats: Category[] = DEFAULT_CATEGORIES.map((c) => ({ ...c, id: uid() }));
  write(KEYS.categories, cats);
  write(KEYS.transactions, [] as Transaction[]);
  write(KEYS.goals, [] as Goal[]);
  window.localStorage.setItem(KEYS.seeded, "1");
}

function getCategories(): Category[] {
  ensureSeed();
  return read<Category[]>(KEYS.categories, []);
}
function getTransactionsRaw(): Transaction[] {
  ensureSeed();
  return read<Transaction[]>(KEYS.transactions, []);
}
function getGoals(): Goal[] {
  ensureSeed();
  return read<Goal[]>(KEYS.goals, []);
}

export async function fetchCategories(): Promise<Category[]> {
  return getCategories()
    .filter((c) => !c.is_archived)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchTransactions(filters?: {
  from?: string;
  to?: string;
  type?: TxnType | "all";
  categoryId?: string | "all";
  search?: string;
}): Promise<Transaction[]> {
  const cats = getCategories();
  const catById = new Map(cats.map((c) => [c.id, c]));
  let list = getTransactionsRaw().map((t) => ({
    ...t,
    category: t.category_id ? catById.get(t.category_id) ?? null : null,
  }));
  if (filters?.from) list = list.filter((t) => t.occurred_on >= filters.from!);
  if (filters?.to) list = list.filter((t) => t.occurred_on <= filters.to!);
  if (filters?.type && filters.type !== "all") list = list.filter((t) => t.type === filters.type);
  if (filters?.categoryId && filters.categoryId !== "all")
    list = list.filter((t) => t.category_id === filters.categoryId);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter((t) => (t.note ?? "").toLowerCase().includes(q));
  }
  return list.sort((a, b) => {
    if (a.occurred_on !== b.occurred_on) return a.occurred_on < b.occurred_on ? 1 : -1;
    return a.created_at < b.created_at ? 1 : -1;
  });
}

export async function createTransaction(input: {
  type: TxnType;
  amount: number;
  category_id: string | null;
  occurred_on: string;
  note: string | null;
}) {
  const list = getTransactionsRaw();
  list.push({ ...input, id: uid(), created_at: new Date().toISOString() });
  write(KEYS.transactions, list);
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
  const list = getTransactionsRaw().map((t) => (t.id === id ? { ...t, ...input } : t));
  write(KEYS.transactions, list);
}

export async function deleteTransaction(id: string) {
  write(KEYS.transactions, getTransactionsRaw().filter((t) => t.id !== id));
}

export async function fetchGoals(): Promise<Goal[]> {
  return getGoals().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function createGoal(input: {
  name: string;
  target_amount: number;
  saved_amount: number;
}) {
  const list = getGoals();
  list.push({ ...input, id: uid(), created_at: new Date().toISOString() });
  write(KEYS.goals, list);
}

export async function updateGoal(
  id: string,
  input: Partial<{ name: string; target_amount: number; saved_amount: number }>,
) {
  write(KEYS.goals, getGoals().map((g) => (g.id === id ? { ...g, ...input } : g)));
}

export async function deleteGoal(id: string) {
  write(KEYS.goals, getGoals().filter((g) => g.id !== id));
}
