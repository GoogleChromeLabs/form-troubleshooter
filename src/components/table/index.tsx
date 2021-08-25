/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

import { FunctionalComponent, h } from 'preact';

type Column =
  | {
      field: string;
      display?: string;
      className?: string;
    }
  | string;

interface Props {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: Array<{ [key: string]: any }>;
  class?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowClick?: (row: h.JSX.HTMLAttributes<HTMLTableRowElement>, item: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowEnter?: (row: h.JSX.HTMLAttributes<HTMLTableRowElement>, item: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRowLeave?: (row: h.JSX.HTMLAttributes<HTMLTableRowElement>, item: any) => void;
}

const Table: FunctionalComponent<Props> = props => {
  const { items, columns } = props;
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col, colIndex) => {
            const display = typeof col === 'string' ? col : col.display ?? col.field;
            const className = typeof col === 'string' ? undefined : col.className;
            return (
              <th key={colIndex} class={className}>
                {display}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const row = (
            <tr
              key={index}
              onClick={() => props.onRowClick?.(row as h.JSX.HTMLAttributes<HTMLTableRowElement>, item)}
              onMouseEnter={() => props.onRowEnter?.(row as h.JSX.HTMLAttributes<HTMLTableRowElement>, item)}
              onMouseLeave={() => props.onRowLeave?.(row as h.JSX.HTMLAttributes<HTMLTableRowElement>, item)}
            >
              {columns.map((col, colIndex) => {
                const key = typeof col === 'string' ? col : col.field;
                const className = typeof col === 'string' ? undefined : col.className;
                return (
                  <td key={colIndex} class={className}>
                    {item[key]?.toString()}
                  </td>
                );
              })}
            </tr>
          );
          return row;
        })}
      </tbody>
    </table>
  );
};

export default Table;
