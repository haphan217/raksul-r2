import {
  DEFAULT_PAPER_SIZE,
  PAPER_SIZES,
  type PaperSize,
  type PricesResponse,
} from "../types/pricing";

const ENDPOINT = "https://us-central1-fe-ws-test.cloudfunctions.net/prices";

/** Process-lifetime cache keyed by normalized paper size. */
const cache = new Map<PaperSize, PricesResponse>();

export class PricingApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PricingApiError";
    this.status = status;
  }
}

/** Case-insensitive coercion to a supported paper size. */
export function normalizePaperSize(
  value: string | null | undefined,
): PaperSize {
  const upper = String(value ?? "").toUpperCase();
  return (PAPER_SIZES as readonly string[]).includes(upper)
    ? (upper as PaperSize)
    : DEFAULT_PAPER_SIZE;
}

export function getCached(size: PaperSize): PricesResponse | undefined {
  return cache.get(size);
}

/**
 * Fetches prices for a paper size.
 * Returns synchronously-cached data on a hit (no network).
 */
export async function fetchPrices(
  size: PaperSize,
  signal?: AbortSignal,
): Promise<PricesResponse> {
  const cached = getCached(size);
  if (cached) return cached;

  const response = await fetch(
    `${ENDPOINT}?paper_size=${encodeURIComponent(size)}`,
    { signal },
  );

  if (!response.ok) {
    throw new PricingApiError(
      `Request failed with status ${response.status}`,
      response.status,
    );
  }

  let payload: PricesResponse;
  try {
    payload = await response.json();
  } catch {
    throw new PricingApiError("Malformed response from pricing service");
  }

  cache.set(size, payload);
  return payload;
}
