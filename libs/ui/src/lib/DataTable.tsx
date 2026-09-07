import type { ReactNode } from 'react';

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  cy: string;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
};

export function DataTable<T>({ columns, rows, rowKey, cy, onSort, sortKey, sortDir }: Props<T>) {
  return (
    <table className="ui-table" data-cy={cy}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} data-cy={`th-${c.key}`}>
              {c.sortable && onSort ? (
                <button type="button" data-cy={`sort-${c.key}`} onClick={() => onSort(c.key)}>
                  {c.header}
                  {sortKey === c.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </button>
              ) : (
                c.header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} data-cy={`${cy}-row`} data-row-id={rowKey(row)}>
            {columns.map((c) => (
              <td key={c.key} data-cy={`${c.key}-cell`}>
                {c.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
