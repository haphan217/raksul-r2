import { memo, useCallback } from "react";

import { normalizePaperSize } from "../../services/pricingApi";
import { PAPER_SIZES, type PaperSize } from "../../types/pricing";
import { Card, Select } from "../ui";
import styles from "./PaperSizeSelector.module.css";

const OPTIONS = PAPER_SIZES.map((size) => ({ value: size, label: size }));

export interface PaperSizeSelectorProps {
  value: PaperSize;
  onApply: (size: PaperSize) => void;
  disabled?: boolean;
}

function PaperSizeSelectorBase({
  value,
  onApply,
  disabled = false,
}: PaperSizeSelectorProps) {
  const handleChange = useCallback(
    (next: string) => onApply(normalizePaperSize(next)),
    [onApply],
  );

  return (
    <Card title="Select paper size" className={styles.card}>
      <div className={styles.body}>
        <Select
          label="Paper size"
          value={value}
          options={OPTIONS}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    </Card>
  );
}

export const PaperSizeSelector = memo(PaperSizeSelectorBase);
export default PaperSizeSelector;
