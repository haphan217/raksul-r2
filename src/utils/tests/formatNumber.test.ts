import { describe, expect, it } from "vitest";

import { formatNumber, formatYen } from "../formatNumber";

describe("formatNumber", () => {
  it.each([
    [0, "0"],
    [5, "5"],
    [42, "42"],
    [999, "999"],
  ])("leaves %i under four digits untouched", (input, expected) => {
    expect(formatNumber(input)).toBe(expected);
  });

  it.each([
    [1000, "1,000"],
    [1568, "1,568"],
    [9999, "9,999"],
    [12345, "12,345"],
    [100000, "100,000"],
    [999999, "999,999"],
  ])("groups %i into thousands", (input, expected) => {
    expect(formatNumber(input)).toBe(expected);
  });

  it.each([
    [1000000, "1,000,000"],
    [48051, "48,051"],
    [198040, "198,040"],
    [1234567890, "1,234,567,890"],
    [1000000000000, "1,000,000,000,000"],
  ])("groups %i across every boundary", (input, expected) => {
    expect(formatNumber(input)).toBe(expected);
  });

  it("places a separator exactly every three digits from the right", () => {
    for (let digits = 1; digits <= 15; digits += 1) {
      const value = Number("1".repeat(digits));
      const formatted = formatNumber(value);

      expect(formatted.replace(/,/g, "")).toBe(String(value));
      expect(formatted.split(",")).toHaveLength(Math.ceil(digits / 3));
      // Every group but the leading one holds exactly three digits.
      for (const group of formatted.split(",").slice(1)) {
        expect(group).toHaveLength(3);
      }
    }
  });

  it("never starts or ends with a separator", () => {
    for (const value of [1, 100, 1000, 10000, 100000, 1000000]) {
      const formatted = formatNumber(value);
      expect(formatted.startsWith(",")).toBe(false);
      expect(formatted.endsWith(",")).toBe(false);
    }
  });

  it("does not rely on locale formatting", () => {
    // A Intl/toLocaleString implementation would be locale-sensitive; this is not.
    expect(formatNumber(1234567)).toBe("1,234,567");
    expect(formatNumber(1234567)).not.toContain(".");
    expect(formatNumber(1234567)).not.toContain(" ");
  });

  describe("negative values", () => {
    it.each([
      [-5, "-5"],
      [-999, "-999"],
      [-1000, "-1,000"],
      [-4500, "-4,500"],
      [-1234567, "-1,234,567"],
    ])("keeps the sign outside the groups: %i", (input, expected) => {
      expect(formatNumber(input)).toBe(expected);
    });

    it("groups a negative exactly like its absolute value", () => {
      expect(formatNumber(-98765)).toBe(`-${formatNumber(98765)}`);
    });

    it("treats negative zero as zero", () => {
      expect(formatNumber(-0)).toBe("0");
    });
  });

  describe("decimal values", () => {
    it.each([
      [0.5, "0.5"],
      [12.34, "12.34"],
      [999.99, "999.99"],
      [1000.5, "1,000.5"],
      [1213.12232, "1,213.12232"],
      [1234567.891, "1,234,567.891"],
      [-1234.5, "-1,234.5"],
    ])("groups only the integer part of %d", (input, expected) => {
      expect(formatNumber(input)).toBe(expected);
    });

    it("never places a separator in the fraction", () => {
      const fraction = formatNumber(1234.5678901234).split(".")[1];
      expect(fraction).toBe("5678901234");
      expect(fraction).not.toContain(",");
    });

    it("round-trips back to the original number", () => {
      for (const value of [1234.5, -98765.4321, 0.125, 1000000.001]) {
        expect(Number(formatNumber(value).replace(/,/g, ""))).toBe(value);
      }
    });
  });

  describe("values with no digits to group", () => {
    it.each([
      [Number.NaN, "NaN"],
      [Number.POSITIVE_INFINITY, "Infinity"],
      [Number.NEGATIVE_INFINITY, "-Infinity"],
    ])("passes %s through unmangled", (input, expected) => {
      expect(formatNumber(input)).toBe(expected);
    });

    it.each([
      [1e21, "1e+21"],
      [1e-7, "1e-7"],
      [-1e21, "-1e+21"],
    ])("leaves exponential notation alone: %d", (input, expected) => {
      expect(formatNumber(input)).toBe(expected);
    });
  });
});

describe("formatYen", () => {
  it.each([
    [0, "¥0"],
    [999, "¥999"],
    [1660, "¥1,660"],
    [192040, "¥192,040"],
  ])("prefixes %i with the yen sign", (input, expected) => {
    expect(formatYen(input)).toBe(expected);
  });

  it("delegates grouping to formatNumber", () => {
    expect(formatYen(1234567)).toBe(`¥${formatNumber(1234567)}`);
  });
});
