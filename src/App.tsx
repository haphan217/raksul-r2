import { useCallback, useMemo, useState } from "react";
import { Button, Card } from "./components/ui";
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
import { formatYen } from "./utils/formatNumber";
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

  const handleApply = useCallback((size: PaperSize) => {
    setPaperSize(size);
    setSelected(null);
  }, []);

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
    <main className={styles.page}>
      <h1 className={styles.heading}>Raksul Price Table</h1>

      <div className={styles.layout}>
        <PaperSizeSelector
          value={paperSize}
          onApply={handleApply}
          disabled={loading}
        />

        <Card title="Price table" className={styles.tableCard}>
          <div className={styles.tableBody}>
            <OrderSummary selection={selection} />
            <PriceTableSection
              columns={columns}
              data={rows}
              loading={loading}
              error={error}
              selected={selection ? selected : null}
              onSelect={setSelected}
              onRetry={refetch}
            />
          </div>
        </Card>
      </div>

      <div className={styles.footerBar}>
        <span className={styles.orderPrice}>
          Order price:{" "}
          <span className={styles.orderPriceValue}>
            {selection ? formatYen(selection.price) : "—"}
          </span>
        </span>
        <Button variant="primary" disabled={!selection}>
          Cart
        </Button>
      </div>
    </main>
  );
}

export default App;
