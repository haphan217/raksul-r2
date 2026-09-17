/** Manual thousands separator for non-negative integers. */
export function formatNumber(value: number): string {
  const digits = String(value);

  let out = "";
  let counter = 0;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    out = digits[i] + out;
    counter += 1;
    if (counter % 3 === 0 && i > 0) {
      out = "," + out;
    }
  }

  return out;
}

/** Yen-prefixed price label, e.g. 12345 -> "¥12,345". */
export function formatYen(value: number): string {
  return "¥" + formatNumber(value);
}
