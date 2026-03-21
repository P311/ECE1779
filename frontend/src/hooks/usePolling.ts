"use client";

import { useState, useEffect, useCallback } from "react";
import { apiRequest } from "@/utils/api";

export function usePolling<T>(
  path: string,
  intervalMs: number = 3000,
  fallback?: T,
) {
  const [data, setData] = useState<T | null>(fallback ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await apiRequest<T>(path);
    if (res.data !== null) {
      setData(res.data);
      setError(null);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [path]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, intervalMs);
    return () => clearInterval(interval);
  }, [fetchData, intervalMs]);

  return { data, error, loading };
}
