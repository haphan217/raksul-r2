import type { ReactNode } from 'react';

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

/** ---- Generic table contracts (consumed by ReusableTable) ---- */

/** Flat cell value; every column key indexes straight into the row. */
export type CellValue = number | string | undefined;

/** A row is a flat bag of values keyed by column key, plus its own identity. */
export interface TableRow {
  key: string;
  [columnKey: string]: CellValue;
}

export interface TableColumn<TRow extends TableRow = TableRow> {
  /** Stable identity; also the key this column reads from each row. */
  key: string;
  /** Header content. */
  label: ReactNode;
  /** Rendered as a row header cell instead of a selectable value cell. */
  isRowHeader?: boolean;
  /** Cell content; `null` marks the intersection as unavailable. */
  render: (row: TRow) => ReactNode;
}

export interface CellAddress {
  rowKey: string;
  columnKey: string;
}

/** Fully resolved selection, surfaced to the order summary. */
export interface PriceSelection {
  paperSize: PaperSize;
  quantity: number;
  businessDay: number;
  price: number;
}
