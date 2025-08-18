import { useCallback, useMemo, useRef, useState } from "react";
import type { Insight } from "@/lib/types";

export function useAIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const addInsight = useCallback((i: Insight) => setInsights((prev) => [i, ...prev].slice(0, 50)), []);

  const askQuestion = useCallback(async (question: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(await res.text());
      const payload: Insight = await res.json();
      addInsight(payload);
    } finally {
      setIsSubmitting(false);
    }
  }, [addInsight]);

  const analyzeSpending = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const items: Insight[] = await res.json();
      setInsights((prev) => [...items, ...prev]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { insights, isLoading, isSubmitting, askQuestion, analyzeSpending };
}