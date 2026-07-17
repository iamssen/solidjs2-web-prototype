import type { Element } from 'solid-js';
import { createSignal, For, onSettled, Show } from 'solid-js';
import styles from './SimpleTable.module.css';

export type SimpleTableRow = Record<string, unknown>;

export type SimpleTableAlignment = 'start' | 'center' | 'end';

export interface SimpleTableCellContext<Row extends SimpleTableRow> {
  row: Row;
  rowIndex: number;
  column: SimpleTableColumn<Row>;
}

export interface SimpleTableRowContext<Row extends SimpleTableRow> {
  row: Row;
  rowIndex: number;
}

interface KeyedRow<Row extends SimpleTableRow> {
  key: string | number | Row;
  row: Row;
}

export interface SimpleTableColumn<Row extends SimpleTableRow> {
  id: string;
  key?: Extract<keyof Row, string>;
  header: Element;
  minWidth: number;
  maxWidth?: number;
  cell?: (context: SimpleTableCellContext<Row>) => Element;
  align?: SimpleTableAlignment;
  headerClass?: string;
  cellClass?:
    string | ((context: SimpleTableCellContext<Row>) => string | undefined);
}

export interface SimpleTableProps<Row extends SimpleTableRow> {
  columns: readonly SimpleTableColumn<Row>[];
  rows: readonly Row[];
  ariaLabel: string;
  maxHeight?: string;
  class?: string;
  tableClass?: string;
  rowClass?:
    string | ((context: SimpleTableRowContext<Row>) => string | undefined);
  empty?: Element;
  stickyFirstColumn?: boolean;
  getRowKey?: (row: Row, rowIndex: number) => string | number;
}

function getCellValue<Row extends SimpleTableRow>(
  row: Row,
  column: SimpleTableColumn<Row>,
): Element {
  if (column.key === undefined) return '';

  const value = row[column.key];

  return value == null ? '' : String(value);
}

function resolveClass<Context>(
  className: string | ((context: Context) => string | undefined) | undefined,
  context: Context,
): string | undefined {
  return typeof className === 'function' ? className(context) : className;
}

export function SimpleTable<Row extends SimpleTableRow>(
  props: SimpleTableProps<Row>,
): Element {
  let viewport: HTMLDivElement | undefined;
  const [viewportWidth, setViewportWidth] = createSignal(0);
  const totalMinWidth = () =>
    props.columns.reduce((total, column) => total + column.minWidth, 0);
  const hasHorizontalOverflow = () =>
    viewportWidth() > 0 && viewportWidth() < totalMinWidth();
  const shouldStickFirstColumn = () => props.stickyFirstColumn ?? true;
  const keyedRows = (): readonly KeyedRow<Row>[] =>
    props.rows.map((row, rowIndex) => ({
      key: props.getRowKey?.(row, rowIndex) ?? row,
      row,
    }));

  onSettled(() => {
    const viewportElement = viewport;
    if (viewportElement === undefined) return;

    const updateWidth = () => {
      setViewportWidth(
        Math.floor(viewportElement.getBoundingClientRect().width),
      );
    };
    const observer = new ResizeObserver(updateWidth);

    updateWidth();
    observer.observe(viewportElement);

    return () => observer.disconnect();
  });

  return (
    <div
      ref={(element) => {
        viewport = element;
      }}
      class={[styles.viewport, props.class]}
      style={{ 'max-height': props.maxHeight ?? '24rem' }}
      data-layout={hasHorizontalOverflow() ? 'overflowing' : 'fitted'}
    >
      <table
        class={[
          styles.table,
          { [styles.overflowing]: hasHorizontalOverflow() },
          { [styles.stickyFirstColumn]: shouldStickFirstColumn() },
          props.tableClass,
        ]}
        style={{
          'width': hasHorizontalOverflow() ? `${totalMinWidth()}px` : '100%',
          'min-width': `${totalMinWidth()}px`,
        }}
        aria-label={props.ariaLabel}
      >
        <colgroup>
          <For each={props.columns}>
            {(column) => (
              <col
                style={{
                  'min-width': `${column.minWidth}px`,
                  'max-width': column.maxWidth
                    ? `${column.maxWidth}px`
                    : undefined,
                }}
              />
            )}
          </For>
        </colgroup>
        <thead>
          <tr>
            <For each={props.columns}>
              {(column) => (
                <th
                  scope="col"
                  class={column.headerClass}
                  data-align={column.align ?? 'start'}
                >
                  {column.header}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <Show
            when={props.rows.length > 0}
            fallback={
              <tr>
                <td class={styles.emptyCell} colspan={props.columns.length}>
                  {props.empty ?? 'No rows to display.'}
                </td>
              </tr>
            }
          >
            <For each={keyedRows()} keyed={(keyedRow) => keyedRow.key}>
              {(keyedRow, rowIndex) => (
                <tr
                  class={resolveClass(props.rowClass, {
                    row: keyedRow().row,
                    rowIndex: rowIndex(),
                  })}
                >
                  <For each={props.columns}>
                    {(column) => (
                      <td
                        class={resolveClass(column.cellClass, {
                          row: keyedRow().row,
                          rowIndex: rowIndex(),
                          column,
                        })}
                        data-align={column.align ?? 'start'}
                      >
                        {column.cell
                          ? column.cell({
                              row: keyedRow().row,
                              rowIndex: rowIndex(),
                              column,
                            })
                          : getCellValue(keyedRow().row, column)}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </Show>
        </tbody>
      </table>
    </div>
  );
}
