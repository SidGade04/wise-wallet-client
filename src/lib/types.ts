export type InsightKind =
  | "cashflow_delta"
  | "category_spike"
  | "subscription_drift"
  | "debt_utilization"
  | "emergency_fund"
  | "budget_recommendation"
  | "general_answer";

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  detail: string; // human text the LLM produced
  impactUSD?: number; // optional estimated impact
  meta?: Record<string, unknown>; // raw numbers for explainability
  createdAt: string; // ISO
}

export interface AskRequest {
  userId: string; // UUID (from auth)
  question: string; // user text
}

export interface AnalyzeRequest {
  userId: string;
  goal?: { savingsRateMin?: number };
}

export interface AIContext {
  as_of: string; // YYYY-MM-DD
  balances: { checking?: number; savings?: number; credit_due?: number };
  income_net_30d: number;
  spend_30d: { fixed: number; variable: number };
  top_categories: Array<{ cat: string; spend: number; mom_pct?: number }>;
  efund_months?: number | null;
}

// Utility to format dollars (client + server safe)
export const fmtUSD = (n?: number) =>
  typeof n === "number" ? n.toLocaleString(undefined, { style: "currency", currency: "USD" }) : "—";
