import { useMemo } from "react";
import type { TableColumn, TableRow } from "../../types/pricing";
import type { PriceColumnMeta } from "../../utils/priceTransformer";
import { formatNumber } from "../../utils/formatNumber";
import styles from "./priceColumns.module.css";

/**
 * Lifts plain column metadata into renderable table columns.
 * All formatting and JSX lives here so the transformer stays pure data.
 */
export function usePriceColumns(
  meta: PriceColumnMeta[],
): TableColumn<TableRow>[] {
  return useMemo(
    () =>
      meta.map((column) => {
        if (column.isRowHeader) {
          return {
            key: column.key,
            label: (
              <span className={styles.cornerLabel}>
                <span className={styles.cornerTop}>Delivery</span>
                <span className={styles.cornerMain}>{column.label}</span>
              </span>
            ),
            isRowHeader: true,
            render: (row: TableRow) => {
              const quantity = row[column.key];
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
            return <span className={styles.price}>{formatNumber(price)}</span>;
          },
        };
      }),
    [meta],
  );
}
