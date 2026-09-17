import type { PriceEntry, PricesResponse, TableRow } from "../types/pricing";

/** Column key holding the quantity axis */
export const QUANTITY_COLUMN = "quantity";

export const columnKeyOf = (businessDay: number) => `d${businessDay}`;
export const rowKeyOf = (quantity: number) => `q${quantity}`;

/**
 * Column description in plain data form.
 */
export interface PriceColumnMeta {
  key: string;
  label: string;
  isRowHeader?: boolean;
  businessDay?: number;
}

export interface PriceTableData {
  columns: PriceColumnMeta[];
  rows: TableRow[];
}

export const EMPTY_PRICE_TABLE: PriceTableData = { columns: [], rows: [] };

export function transformPrices(
  response: PricesResponse | null,
): PriceTableData {
  if (!response || !Array.isArray(response.prices)) return EMPTY_PRICE_TABLE;

  const entries: PriceEntry[] = response.prices.flat();
  if (entries.length === 0) return EMPTY_PRICE_TABLE;

  const days = new Set<number>();
  const byQuantity = new Map<number, TableRow>();

  for (const entry of entries) {
    const { business_day: day, quantity, price } = entry;
    if (!Number.isFinite(day) || !Number.isFinite(quantity)) continue;

    days.add(day);

    let row = byQuantity.get(quantity);
    if (!row) {
      row = { key: rowKeyOf(quantity), [QUANTITY_COLUMN]: quantity };
      byQuantity.set(quantity, row);
    }
    row[columnKeyOf(day)] = price;
  }
  const columns: PriceColumnMeta[] = [
    { key: QUANTITY_COLUMN, label: "Quantity", isRowHeader: true },
    ...[...days]
      .sort((a, b) => a - b)
      .map((day) => ({
        key: columnKeyOf(day),
        label: `${day} ${day === 1 ? "Day" : "Days"}`,
        businessDay: day,
      })),
  ];

  const rows = [...byQuantity.keys()]
    .sort((a, b) => a - b)
    .map((quantity) => byQuantity.get(quantity) as TableRow);

  return { columns, rows };
}
