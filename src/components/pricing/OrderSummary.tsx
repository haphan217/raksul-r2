import { memo } from 'react';
import { Button } from '../ui';
import { formatNumber } from '../../utils/formatNumber';
import type { PaperSize, PriceSelection } from '../../types/pricing';
import styles from './OrderSummary.module.css';

export interface OrderSummaryProps {
  selection: PriceSelection | null;
  paperSize: PaperSize;
}

function OrderSummaryBase({ selection, paperSize }: OrderSummaryProps) {
  const empty = selection === null;

  return (
    <section
      className={`${styles.band} ${empty ? styles.bandEmpty : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.details}>
        <p className={styles.label}>Order summary</p>
        {empty ? (
          <p className={styles.hint}>
            Select a price in the table to build your order.
          </p>
        ) : (
          <div className={styles.facts}>
            <span className={styles.fact}>
              Size: <strong className={styles.strong}>{paperSize}</strong>
            </span>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.fact}>
              Qty:{' '}
              <strong className={styles.strong}>
                {formatNumber(selection.quantity)}
              </strong>
            </span>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.fact}>
              Delivery:{' '}
              <strong className={styles.strong}>
                {selection.businessDay}{' '}
                {selection.businessDay === 1 ? 'Business Day' : 'Business Days'}
              </strong>
            </span>
          </div>
        )}
      </div>

      <div className={styles.totalGroup}>
        <div className={styles.total}>
          <span className={styles.totalLabel}>Total price (Tax incl.)</span>
          <span className={styles.totalValue}>
            <span className={styles.yen}>¥</span>
            {selection ? formatNumber(selection.price) : '—'}
          </span>
        </div>
        <Button variant="primary" disabled={empty} className={styles.cart}>
          Add to Cart
        </Button>
      </div>
    </section>
  );
}

export const OrderSummary = memo(OrderSummaryBase);
export default OrderSummary;
