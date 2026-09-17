import { memo, useCallback, useMemo, useState } from "react";

import { Button } from "../ui";
import styles from "./ReusableTable.module.css";

import type { CellAddress, TableColumn, TableRow } from "../../types/pricing";
import { QUANTITY_COLUMN } from "../../utils/priceTransformer";
export interface ReusableTableProps {
  columns: TableColumn<TableRow>[];
  data: TableRow[];
  /** Rows rendered before "See more" is expanded. */
  initialRowCount?: number;
  selected?: CellAddress | null;
  onSelect?: (address: CellAddress) => void;
  caption?: string;
  emptyMessage?: string;
}

interface CellProps {
  column: TableColumn<TableRow>;
  row: TableRow;
  isSelected: boolean;
  isHovered: boolean;
  /** Cell sits on the active row or column — the crosshair highlight. */
  inCrosshair: boolean;
  onHover: (address: CellAddress | null) => void;
  onSelect?: (address: CellAddress) => void;
}

const Cell = memo(function Cell({
  column,
  row,
  isSelected,
  isHovered,
  inCrosshair,
  onHover,
  onSelect,
}: CellProps) {
  const content = column.render(row);

  const handleEnter = useCallback(
    () => onHover({ rowKey: row.key, columnKey: column.key }),
    [column.key, onHover, row.key],
  );
  const handleLeave = useCallback(() => onHover(null), [onHover]);
  const handleClick = useCallback(
    () => onSelect?.({ rowKey: row.key, columnKey: column.key }),
    [column.key, onSelect, row.key],
  );

  // Row headers share the cell shell but are never selectable.
  if (column.isRowHeader) {
    return (
      <th
        scope="row"
        className={`${styles.cell} ${styles.rowHeader} ${
          inCrosshair ? styles.crosshair : ""
        }`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {content}
      </th>
    );
  }

  if (content === null) {
    return (
      <td
        className={`${styles.cell} ${styles.cellEmpty} ${
          inCrosshair ? styles.crosshair : ""
        }`}
        aria-label="Unavailable"
      >
        —
      </td>
    );
  }

  const classes = [styles.cell, styles.cellInteractive];
  if (isSelected) classes.push(styles.cellSelected);
  else if (isHovered) classes.push(styles.cellHover);
  else if (inCrosshair) classes.push(styles.crosshair);

  return (
    <td
      className={classes.join(" ")}
      aria-pressed={isSelected}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      onClick={handleClick}
    >
      {content}
    </td>
  );
});

const Chevron = memo(function Chevron({ up }: { up: boolean }) {
  return (
    <svg
      className={`${styles.chevron} ${up ? styles.chevronUp : ""}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
});

function ReusableTableBase({
  columns,
  data,
  initialRowCount = 5,
  selected = null,
  onSelect,
  caption,
  emptyMessage = "No data available.",
}: ReusableTableProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState<CellAddress | null>(null);

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);
  const handleHover = useCallback((address: CellAddress | null) => {
    if (address?.columnKey !== QUANTITY_COLUMN) setHovered(address);
  }, []);

  const collapsible = data.length > initialRowCount;
  const visibleRows = useMemo(
    () => (expanded || !collapsible ? data : data.slice(0, initialRowCount)),
    [collapsible, data, expanded, initialRowCount],
  );

  /** Crosshair follows hover, falling back to the current selection. */
  const axis = hovered ?? selected;

  if (columns.length === 0 || data.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.scroller}>
        <table className={styles.table}>
          {caption ? (
            <caption className="visually-hidden">{caption}</caption>
          ) : null}
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`${styles.headCell} ${
                    column.isRowHeader ? styles.headCorner : ""
                  } ${axis?.columnKey === column.key ? styles.crosshair : ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const rowActive = axis?.rowKey === row.key;
              return (
                <tr key={row.key}>
                  {columns.map((column) => (
                    <Cell
                      key={column.key}
                      column={column}
                      row={row}
                      isSelected={
                        selected?.rowKey === row.key &&
                        selected?.columnKey === column.key
                      }
                      isHovered={
                        hovered?.rowKey === row.key &&
                        hovered?.columnKey === column.key
                      }
                      inCrosshair={rowActive || axis?.columnKey === column.key}
                      onHover={handleHover}
                      onSelect={onSelect}
                    />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {collapsible ? (
        <div className={styles.toggleRow}>
          <Button
            variant="ghost"
            onClick={toggleExpanded}
            aria-expanded={expanded}
          >
            <Chevron up={expanded} />
            {expanded
              ? "See less"
              : `See more (${data.length - initialRowCount})`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export const ReusableTable = memo(ReusableTableBase);
export default ReusableTable;
