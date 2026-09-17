import { memo, useCallback } from "react";
import { Select } from "@/components/ui";
import { PAPER_SIZES, type PaperSize } from "@/types/pricing";
import { normalizePaperSize } from "@/services/pricingApi";
import styles from "./PaperSizeSelector.module.css";

const OPTIONS = PAPER_SIZES.map((size) => ({ value: size, label: size }));

export interface PaperSizeSelectorProps {
  value: PaperSize;
  onChange: (size: PaperSize) => void;
  disabled?: boolean;
}

function PaperSizeSelectorBase({
  value,
  onChange,
  disabled = false,
}: PaperSizeSelectorProps) {
  const handleChange = useCallback(
    (next: string) => onChange(normalizePaperSize(next)),
    [onChange],
  );

  return (
    <div className={styles.field}>
      <Select
        label="Paper size"
        value={value}
        options={OPTIONS}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}

export const PaperSizeSelector = memo(PaperSizeSelectorBase);
export default PaperSizeSelector;
