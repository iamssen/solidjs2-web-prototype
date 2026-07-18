import type { Element } from 'solid-js';
import { SimpleTable } from '../index.ts';
import type { SimpleTableColumn } from '../index.ts';
import styles from './spreadsheet.module.css';

type Forecast = {
  metric: string;
  april: number;
  may: number;
  june: number;
  july: number;
  total: number;
};

const formatCurrency = (value: number) => `$${value.toLocaleString('en-US')}`;

const rows: readonly Forecast[] = Array.from({ length: 60 }, (_, index) => {
  const baseAmount = 12_000 + index * 850;
  const april = baseAmount;
  const may = baseAmount + 1300;
  const june = baseAmount + 2100;
  const july = baseAmount + 2900;

  return {
    metric: `${['Revenue', 'Operating cost', 'Net income'][index % 3]} ${String(
      Math.floor(index / 3) + 1,
    ).padStart(2, '0')}`,
    april,
    may,
    june,
    july,
    total: april + may + june + july,
  };
});

const columns = [
  { id: 'metric', cell: 'metric', header: 'FY26', minWidth: 180 },
  {
    id: 'april',
    cell: (context) => formatCurrency(context.row.april),
    header: 'Apr',
    minWidth: 120,
    headerClass: styles.amount,
    cellClass: styles.amount,
  },
  {
    id: 'may',
    cell: (context) => formatCurrency(context.row.may),
    header: 'May',
    minWidth: 120,
    headerClass: styles.amount,
    cellClass: styles.amount,
  },
  {
    id: 'june',
    cell: (context) => formatCurrency(context.row.june),
    header: 'Jun',
    minWidth: 120,
    headerClass: styles.amount,
    cellClass: styles.amount,
  },
  {
    id: 'july',
    cell: (context) => formatCurrency(context.row.july),
    header: 'Jul',
    minWidth: 120,
    headerClass: styles.amount,
    cellClass: styles.amount,
  },
  {
    id: 'total',
    cell: (context) => formatCurrency(context.row.total),
    header: (context) =>
      `Total (${formatCurrency(
        context.rows.reduce((sum, row) => sum + row.total, 0),
      )})`,
    minWidth: 190,
    headerClass: styles.amount,
    cellClass: styles.amount,
  },
] as const satisfies readonly SimpleTableColumn<Forecast>[];

export function SpreadsheetPreview(): Element {
  return (
    <section class={styles.example}>
      <h2>Spreadsheet</h2>
      <p>Dense grid lines for comparing 60 values across monthly columns.</p>
      <SimpleTable
        class={styles.table}
        viewportClass={styles.viewport}
        columns={columns}
        rows={rows}
        aria-label="Quarterly financial forecast"
        maxHeight="12rem"
        getRowKey={(row) => row.metric}
      />
    </section>
  );
}
