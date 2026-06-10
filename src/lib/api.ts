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
  seeded: "ledger:seeded:v2",
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

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function ensureSeed() {
  if (!hasStorage()) return;
  if (window.localStorage.getItem(KEYS.seeded)) return;
  const cats: Category[] = DEFAULT_CATEGORIES.map((c) => ({ ...c, id: uid() }));
  const byName = (n: string) => cats.find((c) => c.name === n)!.id;

  // Six months of expenses + monthly salary, weighted so recent weeks read as the highlighted peak.
  const txns: Transaction[] = [];
  const push = (
    type: TxnType,
    amount: number,
    category: string,
    daysAgo: number,
    note: string,
  ) => {
    txns.push({
      id: uid(),
      type,
      amount,
      category_id: byName(category),
      occurred_on: isoDaysAgo(daysAgo),
      note,
      created_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    });
  };

  // Six monthly salary deposits
  for (let i = 0; i < 6; i++) push("income", 65_000_000, "Salary", i * 30 + 2, "Monthly salary");
  push("income", 8_400_000, "Freelance", 12, "Logo project");
  push("income", 1_250_000, "Other Income", 38, "Cashback");

  // Recent week — heavy spend (drives the orange peak)
  push("expense", 245_000, "Food", 1, "Lunch with team");
  push("expense", 68_000, "Transport", 1, "Uber rides");
  push("expense", 1_200_000, "Shopping", 2, "New sneakers");
  push("expense", 1_200_000, "Shopping", 3, "New backpack");
  push("expense", 540_000, "Groceries", 3, "Weekly groceries");
  push("expense", 185_000, "Entertainment", 4, "Cinema");
  push("expense", 95_000, "Food", 5, "Brunch");
  push("expense", 320_000, "Bills", 6, "Internet bill");

  // Last 30 days — moderate
  for (let d = 7; d < 30; d += 2) {
    push("expense", 60_000 + Math.round(Math.random() * 120_000), "Food", d, "Meal");
    if (d % 4 === 0) push("expense", 220_000, "Groceries", d, "Groceries");
    if (d % 6 === 0) push("expense", 45_000, "Transport", d, "Taxi");
  }

  // 30–180 days — lighter baseline so recent bars dominate
  for (let d = 30; d < 180; d += 4) {
    push("expense", 80_000 + Math.round(Math.random() * 90_000), "Food", d, "Meal");
    if (d % 12 === 0) push("expense", 180_000, "Health", d, "Pharmacy");
    if (d % 16 === 0) push("expense", 650_000, "Bills", d, "Utilities");
    if (d % 20 === 0) push("expense", 900_000, "Shopping", d, "Clothes");
  }

  const goals: Goal[] = [
    { id: uid(), name: "Hajj", target_amount: 90_000_000, saved_amount: 40_500_000, created_at: new Date().toISOString() },
    { id: uid(), name: "Home down payment", target_amount: 250_000_000, saved_amount: 62_500_000, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: uid(), name: "Wedding", target_amount: 80_000_000, saved_amount: 64_000_000, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: uid(), name: "Emergency fund", target_amount: 30_000_000, saved_amount: 18_000_000, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  ];

  write(KEYS.categories, cats);
  write(KEYS.transactions, txns);
  write(KEYS.goals, goals);
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
