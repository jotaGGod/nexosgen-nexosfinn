// Espelho tipado dos DTOs devolvidos pelo backend.
// Mantido manualmente e alinhado com backend/docs/openapi.yaml.

export type TransactionType = "income" | "expense";
export type AccountType = "checking" | "savings" | "credit_card" | "cash" | "investment";
export type BudgetStatus = "ok" | "warning" | "exceeded";
export type APIKeyStatus = "active" | "revoked" | "expired";

export interface Money {
  amount: number;
  formatted: string;
}

export interface Metric {
  value: number;
  formatted: string;
  /** Variação percentual contra o período anterior. */
  variation: number;
}

export interface Period {
  start_date: string;
  end_date: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface CategoryRef {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  archived: boolean;
}

export interface AccountRef {
  id: string;
  name: string;
  type: AccountType;
  icon: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initial_balance: Money;
  balance: Money;
  color: string;
  icon: string;
  archived: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: Money;
  description: string;
  notes: string;
  date: string;
  category: CategoryRef;
  account: AccountRef;
  created_at: string;
}

export interface TransactionList {
  items: Transaction[];
  pagination: Pagination;
  totals: {
    income: Money;
    expense: Money;
    net: Money;
  };
}

export interface Goal {
  id: string;
  name: string;
  target_amount: Money;
  current_amount: Money;
  remaining: Money;
  suggested_monthly: Money;
  percentage: number;
  months_remaining: number;
  completed: boolean;
  overdue: boolean;
  deadline: string;
  image_url: string;
  icon: string;
  color: string;
  archived: boolean;
}

export interface Budget {
  id: string;
  category: CategoryRef;
  month: string;
  limit: Money;
  spent: Money;
  remaining: Money;
  percentage: number;
  status: BudgetStatus;
}

export interface BudgetList {
  month: string;
  items: Budget[];
  total_limit: Money;
  total_spent: Money;
  percentage: number;
}

export interface CashflowPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategorySlice {
  category_id: string;
  name: string;
  color: string;
  icon: string;
  total: Money;
  percentage: number;
  count: number;
}

export interface CategoryDistribution {
  total: Money;
  slices: CategorySlice[];
}

export interface DashboardSummary {
  total_balance: Metric;
  income: Metric;
  expense: Metric;
  savings: Metric;
  savings_rate: number;
  period: Period;
}

export interface GoalSummary {
  id: string;
  name: string;
  current_amount: Money;
  target_amount: Money;
  percentage: number;
  color: string;
}

export interface Dashboard {
  summary: DashboardSummary;
  cashflow: CashflowPoint[];
  category_expenses: CategoryDistribution;
  recent_transactions: Transaction[];
  goals: GoalSummary[];
}

export interface TrendPoint {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  savings_rate: number;
}

export interface TransactionHighlight {
  description: string;
  amount: Money;
  date: string;
  category: CategoryRef;
}

export interface ReportInsights {
  biggest_expense: TransactionHighlight | null;
  smallest_expense: TransactionHighlight | null;
  trending_category: {
    category: CategoryRef;
    current: Money;
    previous: Money;
    variation: number;
  } | null;
  best_day: { date: string; net: Money } | null;
}

export interface Report {
  period: Period;
  overview: {
    total_income: Metric;
    total_expense: Metric;
    average_ticket: Metric;
    transaction_count: Metric;
  };
  cashflow: CashflowPoint[];
  category_expenses: CategoryDistribution;
  category_incomes: CategoryDistribution;
  trends: TrendPoint[];
  insights: ReportInsights;
  comparison_period: Period;
}

export interface APIKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  status: APIKeyStatus;
  expires_at: string;
  last_used_at: string;
  created_at: string;
}

export interface CreatedAPIKey {
  api_key: APIKey;
  /** Segredo completo — devolvido uma única vez, na criação. */
  plain_key: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in: number;
  user: User;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

/** Envelope usado pelas listagens simples do backend. */
export interface Envelope<T> {
  data: T;
}
