import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Card, DataTable, EmptyState, type Column } from 'ui';
import { formatDate, formatQuantity, money } from 'formatting';
import { Loading } from '../components/Loading';
import { useLoaded } from '../lib/api';
import { nextStatus, orderItemCount, orderTotal, statusTone, type OrderLine } from '../data/seed';
import { useAdmin } from '../state/store';

export function OrderDetail() {
  const { id = '' } = useParams();
  const { orders, setOrderStatus, saving } = useAdmin();
  const loaded = useLoaded(`order-${id}`);
  const [notice, setNotice] = useState('');

  const order = orders.find((o) => o.id === id);

  if (!loaded) {
    return (
      <section>
        <h1 data-cy="page-title">Order</h1>
        <Loading />
      </section>
    );
  }

  if (!order) {
    return (
      <section>
        <h1 data-cy="page-title">Order</h1>
        <EmptyState
          message={`No order with reference "${id}".`}
          cy="not-found"
          action={
            <Link to="/orders" data-cy="back-to-orders">
              Back to orders
            </Link>
          }
        />
      </section>
    );
  }

  const advance = nextStatus(order.status);
  const cancellable = order.status === 'pending' || order.status === 'paid';

  const columns: Column<OrderLine>[] = [
    { key: 'name', header: 'Product', render: (l) => <span data-cy="line-name">{l.name}</span> },
    { key: 'qty', header: 'Qty', render: (l) => <span data-cy="line-qty">{l.qty}</span> },
    { key: 'price', header: 'Unit price', render: (l) => <span data-cy="line-price">{money(l.price)}</span> },
    { key: 'total', header: 'Line total', render: (l) => <span data-cy="line-total">{money(l.price * l.qty)}</span> },
  ];

  return (
    <section>
      <div className="page-head">
        <h1 data-cy="page-title">Order {order.id}</h1>
        <Link to="/orders" data-cy="back-to-orders">
          Back to orders
        </Link>
      </div>

      <Card
        title="Summary"
        cy="order-summary"
        actions={
          <Badge tone={statusTone(order.status)} cy="order-status">
            {order.status}
          </Badge>
        }
      >
        <dl className="summary">
          <dt>Customer</dt>
          <dd data-cy="order-customer">{order.customer}</dd>
          <dt>Placed</dt>
          <dd data-cy="order-placed">{formatDate(order.placedAt)}</dd>
          <dt>Items</dt>
          <dd data-cy="order-items">{formatQuantity(orderItemCount(order), 'item')}</dd>
          <dt>Total</dt>
          <dd data-cy="order-total">{money(orderTotal(order))}</dd>
        </dl>

        <div className="actions">
          {advance ? (
            <Button
              data-cy="advance-status"
              disabled={saving}
              onClick={async () => {
                setNotice('');
                await setOrderStatus(order.id, advance);
                setNotice(`Order marked as ${advance}`);
              }}
            >
              {saving ? 'Updating…' : `Mark as ${advance}`}
            </Button>
          ) : (
            <p className="muted" data-cy="status-final">
              This order is {order.status}. No further transitions.
            </p>
          )}

          {cancellable && (
            <Button
              variant="danger"
              data-cy="cancel-order"
              disabled={saving}
              onClick={async () => {
                setNotice('');
                await setOrderStatus(order.id, 'cancelled');
                setNotice('Order cancelled');
              }}
            >
              Cancel order
            </Button>
          )}
        </div>

        {notice && (
          <p className="notice" data-cy="status-notice">
            {notice}
          </p>
        )}
      </Card>

      <Card title="Line items" cy="order-lines-card">
        <DataTable columns={columns} rows={order.lines} rowKey={(l) => l.productId} cy="order-lines" />
      </Card>

      <Card title="History" cy="order-history-card">
        <ol className="history" data-cy="status-history">
          {order.history.map((event, index) => (
            <li key={`${event.status}-${index}`} data-cy="status-event">
              {event.status}
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}
