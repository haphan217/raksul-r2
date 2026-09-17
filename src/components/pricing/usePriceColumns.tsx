import { useMemo } from "react";
import type { TableColumn, TableRow } from "../../types/pricing";
import type { PriceColumnMeta } from "../../utils/priceTransformer";
import { formatNumber, formatYen } from "../../utils/formatNumber";
import styles from "./priceColumns.module.css";

/**
 * Lifts plain column metadata into renderable table columns.
 */
export function usePriceColumns(
  meta: PriceColumnMeta[],
): TableColumn<TableRow>[] {
  return useMemo(
    () =>
      meta.map((column) => {
        if (column.isRowHeader) {
          const { key } = column;
          return {
            key,
            label: column.label,
            isRowHeader: true,
            render: (row: TableRow) => {
              const quantity = row[key];
              if (typeof quantity !== "number") return null;
              return (
                <span className={styles.quantity}>
                  {formatNumber(quantity)} sheets
                </span>
              );
            },
          };
        }

        return {
          key: column.key,
          label: column.label,
          render: (row: TableRow) => {
            const price = row[column.key];
            if (typeof price !== "number") return null;
            return <span className={styles.price}>{formatYen(price)}</span>;
          },
        };
      }),
    [meta],
  );
}
