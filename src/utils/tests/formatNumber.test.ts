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
