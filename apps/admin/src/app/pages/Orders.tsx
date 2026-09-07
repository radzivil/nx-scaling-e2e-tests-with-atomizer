import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, DataTable, EmptyState, type Column } from 'ui';
import { formatDate, formatQuantity, money } from 'formatting';
import { Loading } from '../components/Loading';
import { useLoaded } from '../lib/api';
import { ORDER_STATUSES, orderItemCount, orderTotal, statusTone, type Order } from '../data/seed';
import { useAdmin } from '../state/store';

type SortKey = 'id' | 'placedAt' | 'total';

export function Orders() {
  const { orders } = useAdmin();
  const loaded = useLoaded('orders');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('placedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(() => {
    const filtered = orders.filter((o) => status === 'all' || o.status === status);
    const direction = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'total') return (orderTotal(a) - orderTotal(b)) * direction;
      if (sortKey === 'id') return a.id.localeCompare(b.id) * direction;
      return a.placedAt.localeCompare(b.placedAt) * direction;
    });
  }, [orders, status, sortKey, sortDir]);

  const revenue = rows.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + orderTotal(o), 0);

  function onSort(key: string) {
    const next = key as SortKey;
    if (next === sortKey) setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(next);
      setSortDir('asc');
    }
  }

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Reference',
      sortable: true,
      render: (o) => (
        <Link to={`/orders/${o.id}`} data-cy="order-reference">
          {o.id}
        </Link>
      ),
    },
    { key: 'customer', header: 'Customer', render: (o) => <span data-cy="order-customer">{o.customer}</span> },
    { key: 'placedAt', header: 'Placed', sortable: true, render: (o) => <span data-cy="order-placed">{formatDate(o.placedAt)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <Badge tone={statusTone(o.status)} cy="order-status">
          {o.status}
        </Badge>
      ),
    },
    { key: 'items', header: 'Items', render: (o) => <span data-cy="order-items">{formatQuantity(orderItemCount(o), 'item')}</span> },
    { key: 'total', header: 'Total', sortable: true, render: (o) => <span data-cy="order-total">{money(orderTotal(o))}</span> },
    {
      key: 'details',
      header: 'Lines',
      render: (o) => (
        <>
          <Button
            variant="ghost"
            data-cy="toggle-lines"
            aria-expanded={expanded === o.id}
            onClick={() => setExpanded((current) => (current === o.id ? null : o.id))}
          >
            {expanded === o.id ? 'Hide' : 'Show'}
          </Button>
          {expanded === o.id && (
            <ul className="order-lines" data-cy="order-lines">
              {o.lines.map((l) => (
                <li key={l.productId} data-cy="order-line" data-product-id={l.productId}>
                  <span data-cy="line-name">{l.name}</span>
                  {' × '}
                  <span data-cy="line-qty">{l.qty}</span>
                  {' — '}
                  <span data-cy="line-total">{money(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      ),
    },
  ];

  return (
    <section>
      <div className="page-head">
        <h1 data-cy="page-title">Orders</h1>
      </div>

      {!loaded ? (
        <Loading />
      ) : (
        <Card cy="orders-card">
          <div className="toolbar">
            <select
              data-cy="status-filter"
              aria-label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setExpanded(null);
              }}
            >
              <option value="all">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="muted" data-cy="order-count">
              {formatQuantity(rows.length, 'order')}
            </span>
            <span className="muted" data-cy="filtered-revenue">
              {money(revenue)}
            </span>
          </div>

          {rows.length === 0 ? (
            <EmptyState message="No orders with that status." cy="no-orders" />
          ) : (
            <DataTable columns={columns} rows={rows} rowKey={(o) => o.id} cy="orders" onSort={onSort} sortKey={sortKey} sortDir={sortDir} />
          )}
        </Card>
      )}
    </section>
  );
}
