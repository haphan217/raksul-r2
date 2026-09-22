// Manual thousands separator
export function formatNumber(value: number): string {
  // NaN / ±Infinity have no digits to group
  if (!Number.isFinite(value)) return String(value);

  const sign = value < 0 ? "-" : "";
  const digits = String(Math.abs(value));

  // Exponential notation (|value| >= 1e21 or very small) isn't groupable.
  if (digits.includes("e")) return sign + digits;

  const splits = digits.split(".");
  const whole = splits[0];
  const fraction = splits[1] || "";

  let out = "";
  let counter = 0;

  for (let i = whole.length - 1; i >= 0; i -= 1) {
    out = whole[i] + out;
    counter += 1;
    if (counter % 3 === 0 && i > 0) {
      out = "," + out;
    }
  }

  return sign + out + (fraction ? `.${fraction}` : "");
}

/** Yen-prefixed price label, e.g. 12345 -> "¥12,345". */
export function formatYen(value: number): string {
  return "¥" + formatNumber(value);
}
