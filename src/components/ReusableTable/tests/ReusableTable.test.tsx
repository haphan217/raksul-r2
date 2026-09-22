// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ReusableTable } from "@/components/ReusableTable";

import type { TableColumn, TableRow } from "@/types/pricing";

afterEach(cleanup);

/** Quantity axis + three day columns, mirroring the pricing shape. */
const columns: TableColumn<TableRow>[] = [
  { key: "quantity", label: "Quantity", isRowHeader: true },
  { key: "d1", label: "1 Day", render: (row) => row.d1 ?? null },
  { key: "d2", label: "2 Days", render: (row) => row.d2 ?? null },
  { key: "d3", label: "3 Days", render: (row) => row.d3 ?? null },
];

const makeRows = (count: number): TableRow[] =>
  Array.from({ length: count }, (_, i) => {
    const quantity = (i + 1) * 10;
    return {
      key: `q${quantity}`,
      quantity,
      d1: quantity * 2,
      d2: quantity * 3,
      d3: quantity * 4,
    };
  });

const rows = makeRows(8);

function setup(props: Partial<Parameters<typeof ReusableTable>[0]> = {}) {
  const onSelect = vi.fn();
  const view = render(
    <ReusableTable
      tableName="Prices"
      columns={columns}
      data={rows}
      onSelect={onSelect}
      caption="Prices by quantity and delivery time"
      {...props}
    />,
  );
  return { onSelect, user: userEvent.setup(), ...view };
}

/** Class names are hashed by CSS Modules, so match on the readable fragment. */
const hasStyle = (el: Element | null, fragment: string) =>
  !!el && new RegExp(fragment).test(el.className);

const bodyRows = () => screen.getAllByRole("row").slice(1);
const cellsOf = (rowIndex: number) =>
  Array.from(bodyRows()[rowIndex].children) as HTMLElement[];
const priceCell = (rowIndex: number, columnIndex: number) =>
  cellsOf(rowIndex)[columnIndex];

describe("rendering", () => {
  it("renders the table name, caption and every column header", () => {
    setup();

    expect(screen.getByText("Prices")).toBeInTheDocument();
    expect(
      screen.getByRole("table", {
        name: "Prices by quantity and delivery time",
      }),
    ).toBeInTheDocument();

    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual([
      "Quantity",
      "1 Day",
      "2 Days",
      "3 Days",
    ]);
  });

  it("shows only the first `initialRowCount` rows", () => {
    setup({ initialRowCount: 3 });
    expect(bodyRows()).toHaveLength(3);
  });

  it("renders the row header as a header cell, not a control", () => {
    setup();

    const header = within(bodyRows()[0]).getByRole("rowheader");
    expect(header).toHaveTextContent("10");
    expect(within(header).queryByRole("button")).toBeNull();
  });

  it("falls back to indexing the row when a column has no renderer", () => {
    setup({
      columns: [
        { key: "quantity", label: "Quantity", isRowHeader: true },
        { key: "d1", label: "1 Day" },
      ],
    });

    expect(priceCell(0, 1)).toHaveTextContent("20");
  });

  it("marks an intersection with no value as unavailable", () => {
    setup({ data: [{ key: "q10", quantity: 10, d1: 100, d3: 300 }] });

    const cell = screen.getByLabelText("Unavailable");
    expect(cell).toHaveTextContent("—");
    expect(within(cell).queryByRole("button")).toBeNull();
  });

  it("renders the empty message instead of a table when there is no data", () => {
    setup({ data: [], emptyMessage: "Nothing here." });

    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("renders the empty message when there are no columns", () => {
    setup({ columns: [] });
    expect(screen.getByText("No data available.")).toBeInTheDocument();
  });
});

describe("see more / see less", () => {
  it("expands to every row and collapses back", async () => {
    const { user } = setup({ initialRowCount: 5 });

    const toggle = screen.getByRole("button", { name: /see more \(3\)/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(bodyRows()).toHaveLength(5);

    await user.click(toggle);

    expect(bodyRows()).toHaveLength(8);
    const collapse = screen.getByRole("button", { name: /see less/i });
    expect(collapse).toHaveAttribute("aria-expanded", "true");

    await user.click(collapse);
    expect(bodyRows()).toHaveLength(5);
  });

  it("omits the toggle when everything already fits", () => {
    setup({ data: makeRows(4), initialRowCount: 5 });
    expect(
      screen.queryByRole("button", { name: /see more|see less/i }),
    ).toBeNull();
  });
});

describe("selection", () => {
  it("reports the address of the clicked cell", async () => {
    const { user, onSelect } = setup();

    await user.click(priceCell(2, 2));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({ rowKey: "q30", columnKey: "d2" });
  });

  it("ignores clicks on the row header", async () => {
    const { user, onSelect } = setup();

    await user.click(within(bodyRows()[0]).getByRole("rowheader"));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("marks only the selected cell as pressed", () => {
    setup({ selected: { rowKey: "q20", columnKey: "d3" } });

    const pressed = screen
      .getAllByRole("button", { pressed: true })
      .map((b) => b.textContent);
    expect(pressed).toEqual(["80"]);
    expect(hasStyle(priceCell(1, 3), "cellSelected")).toBe(true);
  });

  it("survives having no onSelect handler", async () => {
    const { user } = setup({ onSelect: undefined });
    await expect(user.click(priceCell(0, 1))).resolves.not.toThrow();
  });
});

describe("keyboard access", () => {
  it("reaches a cell by tabbing and selects it with Enter", async () => {
    const { user, onSelect } = setup({ data: makeRows(1) });

    await user.tab();
    expect(document.activeElement).toBe(
      within(priceCell(0, 1)).getByRole("button"),
    );

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith({ rowKey: "q10", columnKey: "d1" });
  });

  it("highlights the focused cell's row and column, like hover does", async () => {
    const { user } = setup({ data: makeRows(3) });

    await user.tab();
    await user.tab();

    expect(hasStyle(priceCell(0, 2), "cellHover")).toBe(true);
    expect(hasStyle(priceCell(0, 1), "crosshair")).toBe(true);
    expect(hasStyle(priceCell(2, 2), "crosshair")).toBe(true);
  });
});

describe("crosshair highlight", () => {
  it("tints the hovered cell, its row and its column", async () => {
    const { user } = setup({ initialRowCount: 3 });

    await user.hover(priceCell(1, 2));

    expect(hasStyle(priceCell(1, 2), "cellHover")).toBe(true);
    expect(hasStyle(priceCell(1, 1), "crosshair")).toBe(true);
    expect(hasStyle(priceCell(1, 3), "crosshair")).toBe(true);
    expect(hasStyle(priceCell(0, 2), "crosshair")).toBe(true);
    expect(hasStyle(priceCell(2, 2), "crosshair")).toBe(true);
  });

  it("leaves unrelated cells untouched", async () => {
    const { user } = setup({ initialRowCount: 3 });

    await user.hover(priceCell(1, 2));

    expect(hasStyle(priceCell(0, 1), "crosshair")).toBe(false);
    expect(hasStyle(priceCell(2, 3), "crosshair")).toBe(false);
  });

  it("clears when the pointer leaves", async () => {
    const { user } = setup({ initialRowCount: 3 });

    await user.hover(priceCell(1, 2));
    await user.unhover(priceCell(1, 2));

    expect(hasStyle(priceCell(1, 2), "cellHover")).toBe(false);
    expect(hasStyle(priceCell(0, 2), "crosshair")).toBe(false);
  });

  it("falls back to the selection when nothing is hovered", () => {
    setup({ selected: { rowKey: "q20", columnKey: "d3" }, initialRowCount: 3 });

    expect(hasStyle(priceCell(1, 1), "crosshair")).toBe(true);
    expect(hasStyle(priceCell(0, 3), "crosshair")).toBe(true);
  });

  it("lets hover win over the selection", async () => {
    const { user } = setup({
      selected: { rowKey: "q20", columnKey: "d3" },
      initialRowCount: 3,
    });

    await user.hover(priceCell(0, 1));

    expect(hasStyle(priceCell(0, 2), "crosshair")).toBe(true);
    expect(hasStyle(priceCell(2, 3), "crosshair")).toBe(false);
  });

  it("does not react to hovering a row header", async () => {
    const { user } = setup({ initialRowCount: 3 });

    await user.hover(within(bodyRows()[1]).getByRole("rowheader"));

    expect(hasStyle(priceCell(1, 1), "crosshair")).toBe(false);
  });
});
