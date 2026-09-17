import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchPrices, getCached } from "@/services/pricingApi";
import { type PriceTableData, transformPrices } from "@/utils/priceTransformer";

import type { PaperSize, PricesResponse } from "@/types/pricing";
interface PricingState {
  /** Request this snapshot belongs to; stale snapshots are ignored on render. */
  key: string;
  data: PricesResponse | null;
  error: string | null;
}

export interface UsePricingDataResult extends PriceTableData {
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const IDLE: PricingState = { key: "", data: null, error: null };

/**
 * Fetches and transforms pricing for a paper size.
 * Cache hits render immediately; every request is
 * guarded by an AbortController.
 */
export function usePricingData(size: PaperSize): UsePricingDataResult {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<PricingState>(IDLE);

  const requestKey = `${size}:${nonce}`;
  const cached = getCached(size);

  // Derived during render rather than synced via an effect.
  const settled = state.key === requestKey ? state : null;
  const data = settled?.data ?? (settled ? null : (cached ?? null));
  const error = settled?.error ?? null;
  const loading = !settled && !cached;

  useEffect(() => {
    if (getCached(size)) {
      // Served from cache in render; nothing to fetch.
      return;
    }

    const controller = new AbortController();

    fetchPrices(size, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return;
        setState({ key: `${size}:${nonce}`, data: response, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Failed to load prices";
        setState({ key: `${size}:${nonce}`, data: null, error: message });
      });

    return () => controller.abort();
  }, [size, nonce]);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  const { columns, rows } = useMemo(() => transformPrices(data), [data]);

  return { columns, rows, loading, error, refetch };
}
