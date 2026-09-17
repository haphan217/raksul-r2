import { useCallback, useMemo, useState } from "react";
import { Card } from "./components/ui";
import { OrderSummary } from "./components/pricing/OrderSummary";
import { PaperSizeSelector } from "./components/pricing/PaperSizeSelector";
import { PriceTableSection } from "./components/pricing/PriceTableSection";
import { usePriceColumns } from "./components/pricing/usePriceColumns";
import { usePricingData } from "./hooks/usePricingData";
import {
  DEFAULT_PAPER_SIZE,
  type CellAddress,
  type PaperSize,
  type PriceSelection,
} from "./types/pricing";
import { QUANTITY_COLUMN } from "./utils/priceTransformer";
import styles from "./App.module.css";

function App() {
  const [paperSize, setPaperSize] = useState<PaperSize>(DEFAULT_PAPER_SIZE);
  const [selected, setSelected] = useState<CellAddress | null>(null);

  const {
    columns: columnMeta,
    rows,
    loading,
    error,
    refetch,
  } = usePricingData(paperSize);
  const columns = usePriceColumns(columnMeta);

  const handlePaperSizeChange = useCallback((size: PaperSize) => {
    setPaperSize(size);
    setSelected(null);
  }, []);

  const handleSelect = useCallback(
    (address: CellAddress) => setSelected(address),
    [],
  );

  /** Resolve the selected address against current data; drops stale selections. */
  const selection = useMemo<PriceSelection | null>(() => {
    if (!selected) return null;
    const row = rows.find((r) => r.key === selected.rowKey);
    const column = columnMeta.find((c) => c.key === selected.columnKey);
    const price = row?.[selected.columnKey];
    const quantity = row?.[QUANTITY_COLUMN];

    if (
      typeof price !== "number" ||
      typeof quantity !== "number" ||
      column?.businessDay === undefined
    ) {
      return null;
    }

    return { paperSize, quantity, businessDay: column.businessDay, price };
  }, [columnMeta, paperSize, rows, selected]);

  return (
    <div className={styles.viewport}>
      <Card className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h1 className={styles.heading}>Printing Prices</h1>
            <p className={styles.subtitle}>
              Select paper size to view delivery and quantity options.
            </p>
          </div>
          <PaperSizeSelector
            value={paperSize}
            onChange={handlePaperSizeChange}
            disabled={loading}
          />
        </header>

        <div className={styles.content}>
          <OrderSummary selection={selection} paperSize={paperSize} />
          <PriceTableSection
            columns={columns}
            data={rows}
            loading={loading}
            error={error}
            selected={selection ? selected : null}
            onSelect={handleSelect}
            onRetry={refetch}
          />
        </div>
      </Card>
    </div>
  );
}

export default App;
