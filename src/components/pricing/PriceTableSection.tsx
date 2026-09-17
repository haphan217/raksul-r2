import { memo } from 'react';
import { Button, SkeletonLoader } from '../ui';
import { ReusableTable } from '../table/ReusableTable';
import type { CellAddress, TableColumn, TableRow } from '../../types/pricing';
import styles from './PriceTableSection.module.css';

export interface PriceTableSectionProps {
  columns: TableColumn<TableRow>[];
  data: TableRow[];
  loading: boolean;
  error: string | null;
  selected: CellAddress | null;
  onSelect: (address: CellAddress) => void;
  onRetry: () => void;
}

const TableSkeleton = memo(function TableSkeleton() {
  return (
    <div className={styles.skeleton} aria-label="Loading prices">
      <SkeletonLoader height="34px" count={6} />
    </div>
  );
});

function PriceTableSectionBase({
  columns,
  data,
  loading,
  error,
  selected,
  onSelect,
  onRetry,
}: PriceTableSectionProps) {
  if (loading) return <TableSkeleton />;

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p className={styles.errorTitle}>Could not load prices</p>
        <p className={styles.errorBody}>{error}</p>
        <Button onClick={onRetry}>Try again</Button>
      </div>
    );
  }

  return (
    <ReusableTable
      columns={columns}
      data={data}
      initialRowCount={5}
      selected={selected}
      onSelect={onSelect}
      caption="Prices by quantity and delivery time in business days"
      emptyMessage="No prices available for this paper size."
    />
  );
}

export const PriceTableSection = memo(PriceTableSectionBase);
export default PriceTableSection;
