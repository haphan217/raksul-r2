import { describe, expect, it } from "vitest";

import {
  columnKeyOf,
  EMPTY_PRICE_TABLE,
  QUANTITY_COLUMN,
  rowKeyOf,
  transformPrices,
} from "./priceTransformer";

import type { PriceEntry, PricesResponse } from "@/types/pricing";

const entry = (
  quantity: number,
  business_day: number,
  price: number,
): PriceEntry => ({ quantity, business_day, price });

const response = (prices: PriceEntry[][]): PricesResponse => ({
  paper_size: "a4",
  prices,
});

/** 2 quantities x 2 business days. */
const sample = response([
  [entry(10, 1, 1568), entry(10, 2, 1578)],
  [entry(100, 1, 1640), entry(100, 2, 1650)],
]);

describe("key helpers", () => {
  it("prefixes business-day and quantity keys distinctly", () => {
    expect(columnKeyOf(3)).toBe("d3");
    expect(rowKeyOf(500)).toBe("q500");
    expect(columnKeyOf(1)).not.toBe(rowKeyOf(1));
  });
});

describe("transformPrices — empty and malformed input", () => {
  it("returns the empty table for a null response", () => {
    expect(transformPrices(null)).toEqual(EMPTY_PRICE_TABLE);
  });

  it("returns the empty table when prices is not an array", () => {
    const malformed = { paper_size: "a4" } as unknown as PricesResponse;
    expect(transformPrices(malformed)).toEqual(EMPTY_PRICE_TABLE);
  });

  it("returns the empty table for an empty matrix", () => {
    expect(transformPrices(response([]))).toEqual(EMPTY_PRICE_TABLE);
    expect(transformPrices(response([[], []]))).toEqual(EMPTY_PRICE_TABLE);
  });
});

describe("transformPrices — columns", () => {
  it("leads with the quantity column as a row header", () => {
    const { columns } = transformPrices(sample);

    expect(columns[0]).toEqual({
      key: QUANTITY_COLUMN,
      label: "Quantity",
      isRowHeader: true,
    });
    expect(columns[0].businessDay).toBeUndefined();
  });

  it("derives one column per business day, ascending", () => {
    const unordered = response([
      [entry(10, 3, 300), entry(10, 1, 100), entry(10, 2, 200)],
    ]);

    const { columns } = transformPrices(unordered);

    expect(columns.map((c) => c.key)).toEqual([QUANTITY_COLUMN, "d1", "d2", "d3"]);
    expect(columns.slice(1).map((c) => c.businessDay)).toEqual([1, 2, 3]);
  });

  it("labels one day in the singular and the rest in the plural", () => {
    const { columns } = transformPrices(
      response([[entry(10, 1, 100), entry(10, 2, 200), entry(10, 7, 700)]]),
    );

    expect(columns.slice(1).map((c) => c.label)).toEqual([
      "1 Day",
      "2 Days",
      "7 Days",
    ]);
  });

  it("marks only the quantity column as a row header", () => {
    const { columns } = transformPrices(sample);
    expect(columns.filter((c) => c.isRowHeader)).toHaveLength(1);
  });
});

describe("transformPrices — rows", () => {
  it("indexes quantity by column key alongside the prices", () => {
    const { rows } = transformPrices(sample);

    expect(rows[0]).toEqual({
      key: "q10",
      [QUANTITY_COLUMN]: 10,
      d1: 1568,
      d2: 1578,
    });
  });

  it("keeps rows flat — no nested cell container", () => {
    const { rows } = transformPrices(sample);

    expect(rows[0].cells).toBeUndefined();
    expect(rows[0][columnKeyOf(2)]).toBe(1578);
  });

  it("sorts rows by quantity ascending regardless of input order", () => {
    const unordered = response([
      [entry(1000, 1, 3)],
      [entry(10, 1, 1)],
      [entry(200, 1, 2)],
    ]);

    const { rows } = transformPrices(unordered);

    expect(rows.map((r) => r.key)).toEqual(["q10", "q200", "q1000"]);
    expect(rows.map((r) => r[QUANTITY_COLUMN])).toEqual([10, 200, 1000]);
  });

  it("merges entries that share a quantity across sub-arrays", () => {
    const split = response([
      [entry(10, 1, 100)],
      [entry(10, 2, 200)],
      [entry(20, 1, 110)],
    ]);

    const { rows } = transformPrices(split);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ key: "q10", [QUANTITY_COLUMN]: 10, d1: 100, d2: 200 });
  });
});

describe("transformPrices — ragged and invalid data", () => {
  it("unions every business day seen and omits missing intersections", () => {
    const ragged = response([
      [entry(10, 1, 100), entry(10, 2, 200)],
      [entry(100, 2, 210), entry(100, 5, 500)],
    ]);

    const { columns, rows } = transformPrices(ragged);

    expect(columns.map((c) => c.key)).toEqual([QUANTITY_COLUMN, "d1", "d2", "d5"]);
    expect(rows[0].d5).toBeUndefined();
    expect(rows[1].d1).toBeUndefined();
    expect(rows[1].d2).toBe(210);
  });

  it("skips entries whose axes are not finite numbers", () => {
    const dirty = response([
      [
        entry(10, 1, 100),
        entry(Number.NaN, 2, 200),
        entry(20, Number.NaN, 300),
        entry(30, Number.POSITIVE_INFINITY, 400),
      ],
    ]);

    const { columns, rows } = transformPrices(dirty);

    expect(columns.map((c) => c.key)).toEqual([QUANTITY_COLUMN, "d1"]);
    expect(rows).toHaveLength(1);
    expect(rows[0][QUANTITY_COLUMN]).toBe(10);
  });

  it("produces a row key for every row and never a duplicate", () => {
    const { rows } = transformPrices(
      response([
        [entry(10, 1, 1), entry(10, 2, 2)],
        [entry(100, 1, 3)],
        [entry(1000, 1, 4)],
      ]),
    );

    const keys = rows.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(keys.map((_, i) => rowKeyOf([10, 100, 1000][i])));
  });
});
