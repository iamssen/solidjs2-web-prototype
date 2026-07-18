import type { JSX } from '@solidjs/web';
import type { Element } from 'solid-js';
import {
  createEffect,
  createSignal,
  For,
  omit,
  onSettled,
  Show,
} from 'solid-js';
import styles from './SimpleTable.module.css';

/**
 * {@link SimpleTable}이 받을 수 있는 행 데이터의 최소 형태다.
 *
 * 열의 `cell`에 행 속성 이름을 지정하면 이 행 객체에서 값을 읽어 기본 문자열로
 * 표시한다. 별도의 형식화나 행에 없는 값을 표시할 때는 cell renderer를 사용한다.
 */
export type SimpleTableRow = object;

/** 열의 cell renderer와 동적 cell class 함수에 전달하는 현재 셀 정보다. */
export interface SimpleTableCellContext<Row extends SimpleTableRow> {
  /** 현재 셀을 렌더링하는 행 데이터다. */
  row: Row;
  /** 현재 `rows` 배열에서 `row`가 차지하는 0부터 시작하는 위치다. */
  rowIndex: number;
  /** 현재 셀을 렌더링하는 열 정의다. */
  column: SimpleTableColumn<Row>;
}

/** 동적 header renderer에 전달하는 현재 열과 전체 행 정보다. */
export interface SimpleTableHeaderContext<Row extends SimpleTableRow> {
  /** header가 현재 표시하는 모든 행이다. renderer는 이 배열을 변경해서는 안 된다. */
  rows: readonly Row[];
  /** 현재 header를 렌더링하는 열 정의다. */
  column: SimpleTableColumn<Row>;
  /** 현재 `columns` 배열에서 `column`이 차지하는 0부터 시작하는 위치다. */
  columnIndex: number;
}

/** 동적 `rowClass` callback에 전달하는 현재 행 정보다. */
export interface SimpleTableRowContext<Row extends SimpleTableRow> {
  /** 현재 렌더링하는 행 데이터다. */
  row: Row;
  /** 현재 `rows` 배열에서 `row`가 차지하는 0부터 시작하는 위치다. */
  rowIndex: number;
}

interface KeyedRow<Row extends SimpleTableRow> {
  key: string | number | Row;
  row: Row;
}

export interface SimpleTableColumn<Row extends SimpleTableRow> {
  /** 열을 동적으로 조합할 때도 유지되는 안정적인 열 식별자다. */
  id: string;
  /**
   * 열 header에 표시할 내용 또는 현재 행에 따라 header를 계산하는 renderer다.
   *
   * 예를 들어 renderer는 행 수나 특정 숫자 열의 합계를 header에 표시할 수 있다.
   */
  header: Element | ((context: SimpleTableHeaderContext<Row>) => Element);
  /** 픽셀 단위의 최소 열 너비이며, 가로 overflow 판단과 table 최소 너비에 사용된다. */
  minWidth: number;
  /**
   * 각 body cell의 내용이다.
   *
   * 행 속성 이름을 지정하면 해당 값을 기본 문자열로 표시한다. cell renderer를 지정하면
   * 형식화, 상태 badge, 동작 요소처럼 행에 따라 달라지는 내용을 표시할 수 있다.
   */
  cell:
    | Extract<keyof Row, string>
    | ((context: SimpleTableCellContext<Row>) => Element);
  /** 이 열의 header cell에 추가할 class 이름이다. 정렬도 CSS class로 지정한다. */
  headerClass?: string;
  /**
   * 이 열의 body cell에 추가할 class 이름이다.
   *
   * 현재 행이나 셀 값에 따라 class가 달라지면 callback을 사용한다.
   */
  cellClass?:
    string | ((context: SimpleTableCellContext<Row>) => string | undefined);
}

/**
 * `SimpleTable`이 내부적으로 렌더링하는 구조와 충돌하지 않는 native `<table>` 속성이다.
 *
 * `children`과 `role`은 table 구조와 native table 의미를 바꿀 수 있어 허용하지 않는다.
 * `class`, `style`, `ref`는 기본 table class와 계산된 너비를 안전하게 병합하기 위해
 * `SimpleTableProps`에서 다시 정의한다. scroll container는 바깥 viewport이므로
 * native `onScroll` 대신 `onViewportScroll`을 사용한다.
 */
type SimpleTableNativeAttributes = Omit<
  JSX.IntrinsicElements['table'],
  | 'children'
  | 'role'
  | 'class'
  | 'style'
  | 'ref'
  | 'onScroll'
  | 'aria-label'
  | 'aria-labelledby'
>;

/** 실제 `<table>`의 접근 가능한 이름을 반드시 제공하도록 하는 union이다. */
type SimpleTableAccessibleName =
  | {
      /** table을 직접 설명하는 접근 가능한 이름이다. */
      'aria-label': string;
      /** 다른 element의 text로 이름을 제공할 때 사용할 ID다. */
      'aria-labelledby'?: string;
    }
  | {
      /** table을 직접 설명하는 접근 가능한 이름이다. */
      'aria-label'?: string;
      /** 다른 element의 text로 table 이름을 제공할 때 사용할 ID다. */
      'aria-labelledby': string;
    };

/** 표현과 접근성을 갖춘 HTML table을 제어하는 options다. */
export type SimpleTableProps<Row extends SimpleTableRow> =
  SimpleTableNativeAttributes &
    SimpleTableAccessibleName & {
      /** header와 각 행을 렌더링할 때 순서대로 사용하는 열 정의다. */
      columns: readonly SimpleTableColumn<Row>[];
      /**
       * 표시할 행이다. component는 정렬, 필터링, 선택 상태를 내부에서 관리하지 않는다.
       */
      rows: readonly Row[];
      /** scroll viewport의 최대 높이다. 기본값은 `24rem`이다. */
      maxHeight?: string;
      /** 실제 `<table>`에 추가할 class 이름이다. */
      class?: JSX.IntrinsicElements['table']['class'];
      /**
       * 실제 `<table>`에 추가할 inline style이다.
       *
       * `width`와 `min-width`는 overflow 레이아웃을 유지하기 위해 component 계산값이
       * 항상 우선한다.
       */
      style?: JSX.CSSProperties | string;
      /** 실제 `<table>` element를 받는 native ref다. */
      ref?: JSX.Ref<HTMLTableElement>;
      /** scroll viewport에 추가할 class 이름이다. */
      viewportClass?: JSX.IntrinsicElements['div']['class'];
      /** 실제 scroll viewport에서 발생하는 scroll event handler다. */
      onViewportScroll?: JSX.EventHandlerUnion<HTMLDivElement, Event>;
      /** 각 body row에 추가할 class 이름 또는 행별 class를 계산하는 callback이다. */
      rowClass?:
        string | ((context: SimpleTableRowContext<Row>) => string | undefined);
      /** `rows`가 비어 있을 때 전체 너비 cell 하나에 표시할 내용이다. */
      empty?: Element;
      /** 가로 overflow 중 첫 열을 계속 보이게 할지 결정한다. 기본값은 `true`다. */
      stickyFirstColumn?: boolean;
      /**
       * 각 행의 안정적인 key를 반환한다.
       *
       * 행 객체가 다시 만들어지거나, 추가·삭제·재정렬될 수 있으면 제공해야 한다.
       */
      getRowKey?: (row: Row, rowIndex: number) => string | number;
    };

function getCellValue<Row extends SimpleTableRow>(
  row: Row,
  key: Extract<keyof Row, string>,
): Element {
  const value = (row as Record<string, unknown>)[key];

  return value == null ? '' : String(value);
}

function resolveCell<Row extends SimpleTableRow>(
  column: SimpleTableColumn<Row>,
  context: SimpleTableCellContext<Row>,
): Element {
  return typeof column.cell === 'function'
    ? column.cell(context)
    : getCellValue(context.row, column.cell);
}

function resolveHeader<Row extends SimpleTableRow>(
  column: SimpleTableColumn<Row>,
  context: SimpleTableHeaderContext<Row>,
): Element {
  return typeof column.header === 'function'
    ? column.header(context)
    : column.header;
}

function resolveClass<Context>(
  className: string | ((context: Context) => string | undefined) | undefined,
  context: Context,
): string | undefined {
  return typeof className === 'function' ? className(context) : className;
}

function resolveTableStyle(
  style: JSX.CSSProperties | string | undefined,
  totalMinWidth: number,
  hasHorizontalOverflow: boolean,
): JSX.CSSProperties | string {
  const tableWidth = hasHorizontalOverflow ? `${totalMinWidth}px` : '100%';
  const layoutStyle: JSX.CSSProperties = {
    'width': tableWidth,
    'min-width': `${totalMinWidth}px`,
  };

  if (typeof style === 'string') {
    return `${style}; width: ${tableWidth}; min-width: ${totalMinWidth}px;`;
  }

  return { ...style, ...layoutStyle };
}

export function SimpleTable<Row extends SimpleTableRow>(
  props: SimpleTableProps<Row>,
): Element {
  let viewport: HTMLDivElement | undefined;
  const [viewportWidth, setViewportWidth] = createSignal(0);
  const tableProps = omit(
    props,
    'columns',
    'rows',
    'maxHeight',
    'class',
    'style',
    'ref',
    'viewportClass',
    'onViewportScroll',
    'rowClass',
    'empty',
    'stickyFirstColumn',
    'getRowKey',
  );
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

  createEffect(
    () => props.rows,
    () => {
      viewport?.scrollTo({ left: 0, top: 0 });
    },
  );

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
      class={[styles.viewport, props.viewportClass]}
      style={{ 'max-height': props.maxHeight ?? '24rem' }}
      data-layout={hasHorizontalOverflow() ? 'overflowing' : 'fitted'}
      onScroll={(event) => {
        const handler = props.onViewportScroll;

        if (typeof handler === 'function') {
          handler(event);
          return;
        }

        handler?.[0](handler[1], event);
      }}
    >
      <table
        {...tableProps}
        ref={props.ref}
        class={[
          styles.table,
          { [styles.overflowing]: hasHorizontalOverflow() },
          { [styles.stickyFirstColumn]: shouldStickFirstColumn() },
          props.class,
        ]}
        style={resolveTableStyle(
          props.style,
          totalMinWidth(),
          hasHorizontalOverflow(),
        )}
      >
        <colgroup>
          <For each={props.columns}>
            {(column) => (
              <col
                style={{
                  'min-width': `${column.minWidth}px`,
                }}
              />
            )}
          </For>
        </colgroup>
        <thead>
          <tr>
            <For each={props.columns}>
              {(column, columnIndex) => (
                <th scope="col" class={column.headerClass}>
                  {resolveHeader(column, {
                    rows: props.rows,
                    column,
                    columnIndex: columnIndex(),
                  })}
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
                    {(column) => {
                      const context = () => ({
                        row: keyedRow().row,
                        rowIndex: rowIndex(),
                        column,
                      });

                      return (
                        <td class={resolveClass(column.cellClass, context())}>
                          {resolveCell(column, context())}
                        </td>
                      );
                    }}
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
