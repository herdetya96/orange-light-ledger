
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text,
  base_currency text DEFAULT 'IDR',
  date_format text DEFAULT 'DD/MM/YYYY',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income','expense')),
  icon text,
  color text,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income','expense')),
  amount numeric(14,2) NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  occurred_on date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX transactions_occurred_on_idx ON public.transactions (occurred_on DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO anon, authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_amount numeric(14,2) NOT NULL,
  saved_amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO anon, authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.profiles (display_name) VALUES ('Herdetya');

INSERT INTO public.categories (name, type, icon, color) VALUES
  ('Food', 'expense', 'Utensils', '#f97316'),
  ('Transport', 'expense', 'Car', '#525252'),
  ('Bills', 'expense', 'Receipt', '#737373'),
  ('Shopping', 'expense', 'ShoppingBag', '#a1a1a1'),
  ('Entertainment', 'expense', 'Film', '#525252'),
  ('Health', 'expense', 'HeartPulse', '#737373'),
  ('Other', 'expense', 'MoreHorizontal', '#9ca3af'),
  ('Salary', 'income', 'Wallet', '#16a34a'),
  ('Freelance', 'income', 'Briefcase', '#16a34a'),
  ('Investment', 'income', 'TrendingUp', '#16a34a');
