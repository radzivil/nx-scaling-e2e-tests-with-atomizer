import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, DataTable, type Column } from 'ui';
import { formatDate, formatQuantity, money, percent } from 'formatting';
import { Loading } from '../components/Loading';
import { LATENCY, useLoaded } from '../lib/api';
import { orderItemCount, orderTotal, statusTone, type Order, type Product } from '../data/seed';
import { useAdmin } from '../state/store';

export function Dashboard() {
  const { products, orders, users, settings } = useAdmin();
  const [reload, setReload] = useState(0);
  // Four resources behind one screen, so the dashboard pays twice the latency.
  const loaded = useLoaded(`dashboard-${reload}`, LATENCY * 2);

  const stats = useMemo(() => {
    const billable = orders.filter((o) => o.status !== 'cancelled');
    const revenue = billable.reduce((sum, o) => sum + orderTotal(o), 0);
    const lowStock = products.filter((p) => p.stock < settings.lowStockThreshold);
    const active = users.filter((u) => u.active);
    return { revenue, billable, lowStock, active };
  }, [orders, products, users, settings.lowStockThreshold]);

  const recent = useMemo(
    () => [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)).slice(0, 5),
    [orders]
  );

  const recentColumns: Column<Order>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (o) => (
        <Link to={`/orders/${o.id}`} data-cy="recent-reference">
          {o.id}
        </Link>
      ),
    },
    { key: 'customer', header: 'Customer', render: (o) => <span data-cy="recent-customer">{o.customer}</span> },
    { key: 'placed', header: 'Placed', render: (o) => <span data-cy="recent-placed">{formatDate(o.placedAt)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <Badge tone={statusTone(o.status)} cy="recent-status">
          {o.status}
        </Badge>
      ),
    },
    { key: 'items', header: 'Items', render: (o) => <span data-cy="recent-items">{orderItemCount(o)}</span> },
    { key: 'total', header: 'Total', render: (o) => <span data-cy="recent-total">{money(orderTotal(o))}</span> },
  ];

  const lowStockColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <Link to={`/products/${p.id}`} data-cy="low-stock-name">
          {p.name}
        </Link>
      ),
    },
    { key: 'sku', header: 'SKU', render: (p) => <span data-cy="low-stock-sku">{p.sku}</span> },
    { key: 'stock', header: 'Stock', render: (p) => <span data-cy="low-stock-qty">{formatQuantity(p.stock, 'unit')}</span> },
  ];

  return (
    <section>
      <div className="page-head">
        <h1 data-cy="page-title">Dashboard</h1>
        <Button variant="ghost" data-cy="refresh-stats" onClick={() => setReload((n) => n + 1)}>
          Refresh
        </Button>
      </div>

      {!loaded ? (
        <Loading />
      ) : (
        <>
          <div className="tiles" data-cy="stat-tiles">
            <Card title="Revenue" cy="tile-revenue">
              <p className="stat" data-cy="stat-revenue">
                {money(stats.revenue)}
              </p>
              <p className="muted" data-cy="stat-revenue-detail">
                {formatQuantity(stats.billable.length, 'billable order')}
              </p>
            </Card>

            <Card title="Orders" cy="tile-orders">
              <p className="stat" data-cy="stat-orders">
                {orders.length}
              </p>
              <p className="muted" data-cy="stat-orders-detail">
                {percent(stats.billable.length, orders.length)} not cancelled
              </p>
            </Card>

            <Card title="Low stock" cy="tile-low-stock">
              <p className="stat" data-cy="stat-low-stock">
                {stats.lowStock.length}
              </p>
              <p className="muted" data-cy="stat-low-stock-detail">
                below {formatQuantity(settings.lowStockThreshold, 'unit')}
              </p>
            </Card>

            <Card title="Active users" cy="tile-active-users">
              <p className="stat" data-cy="stat-active-users">
                {stats.active.length}
              </p>
              <p className="muted" data-cy="stat-active-users-detail">
                {percent(stats.active.length, users.length)} of {formatQuantity(users.length, 'account')}
              </p>
            </Card>
          </div>

          <Card
            title="Recent orders"
            cy="recent-orders-card"
            actions={
              <Link to="/orders" data-cy="view-all-orders">
                View all orders
              </Link>
            }
          >
            <DataTable columns={recentColumns} rows={recent} rowKey={(o) => o.id} cy="recent-orders" />
          </Card>

          <Card
            title="Low stock"
            cy="low-stock-card"
            actions={
              <Link to="/products" data-cy="view-all-products">
                View all products
              </Link>
            }
          >
            <DataTable
              columns={lowStockColumns}
              rows={[...stats.lowStock].sort((a, b) => a.stock - b.stock)}
              rowKey={(p) => p.id}
              cy="low-stock"
            />
          </Card>
        </>
      )}
    </section>
  );
}
