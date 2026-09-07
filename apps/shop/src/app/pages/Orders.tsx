import { Link } from 'react-router-dom';
import { money } from '../lib/pricing';
import { useShop } from '../state/store';

export function Orders() {
  const { orders } = useShop();

  return (
    <section>
      <h1 data-cy="page-title">Orders</h1>

      {orders.length === 0 ? (
        <>
          <p data-cy="empty-orders">You have not placed any orders yet.</p>
          <Link to="/" data-cy="back-to-catalog">
            Browse the catalog
          </Link>
        </>
      ) : (
        <ul className="lines" data-cy="order-list">
          {orders.map((order) => (
            <li key={order.reference} className="line" data-cy="order-row">
              <span data-cy="order-reference">{order.reference}</span>
              <span data-cy="order-items">{order.lines.reduce((sum, line) => sum + line.qty, 0)} items</span>
              <span data-cy="order-total">{money(order.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
