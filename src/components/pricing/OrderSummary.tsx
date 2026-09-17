import { memo } from "react";

import { formatNumber, formatYen } from "../../utils/formatNumber";
import styles from "./OrderSummary.module.css";

import type { PriceSelection } from "../../types/pricing";
export interface OrderSummaryProps {
  selection: PriceSelection | null;
}

function OrderSummaryBase({ selection }: OrderSummaryProps) {
  if (!selection) {
    return (
      <p className={styles.placeholder} role="status">
        Select a price from the table to see order details.
      </p>
    );
  }

  const { paperSize, quantity, businessDay, price } = selection;

  return (
    <div className={styles.summary} role="status" aria-live="polite">
      <div className={styles.item}>
        <div className={styles.term}>Paper size</div>
        <div className={styles.value}>{paperSize}</div>
      </div>
      <div className={styles.item}>
        <div className={styles.term}>Quantity</div>
        <div className={styles.value}>{formatNumber(quantity)} sheets</div>
      </div>
      <div className={styles.item}>
        <div className={styles.term}>Delivery</div>
        <div className={styles.value}>
          {businessDay} {businessDay === 1 ? "business day" : "business days"}
        </div>
      </div>
      <div className={styles.item}>
        <div className={styles.term}>Price</div>
        <div className={`${styles.value} ${styles.price}`}>
          {formatYen(price)}
        </div>
      </div>
    </div>
  );
}

export const OrderSummary = memo(OrderSummaryBase);
export default OrderSummary;
