/** Paper sizes accepted by the pricing endpoint. */
export const PAPER_SIZES = ['A4', 'A5', 'B4', 'B5'] as const;

export type PaperSize = (typeof PAPER_SIZES)[number];

export const DEFAULT_PAPER_SIZE: PaperSize = 'A4';

/** Single price point as returned by the API. */
export interface PriceEntry {
  business_day: number;
  price: number;
  quantity: number;
}

/** Raw payload of GET /prices?paper_size=... */
export interface PricesResponse {
  paper_size: string;
  prices: PriceEntry[][];
}

