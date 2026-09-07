import { Link } from 'react-router-dom';
import { BULK_DISCOUNT_THRESHOLD, FREE_SHIPPING_THRESHOLD, money, totalsOf } from '../lib/pricing';
import { useShop } from '../state/store';

export function Cart() {
  const { lines, setQty, removeLine, busy } = useShop();
  const totals = totalsOf(lines);

  if (lines.length === 0) {
    return (
      <section>
        <h1 data-cy="page-title">Cart</h1>
        <p data-cy="empty-cart">Your cart is empty.</p>
        <Link to="/" data-cy="back-to-catalog">
          Browse the catalog
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h1 data-cy="page-title">Cart</h1>

      <ul className="lines" data-cy="cart-lines">
        {lines.map((line) => (
          <li key={line.id} className="line" data-cy="cart-line" data-product-id={line.id}>
            <span data-cy="line-name">{line.name}</span>
            <span data-cy="line-price">{money(line.price)}</span>

            <div className="qty">
              <button
                type="button"
                data-cy="line-decrement"
                aria-label={`Decrease ${line.name}`}
                disabled={busy}
                onClick={() => setQty(line.id, line.qty - 1)}
              >
                −
              </button>
              <span data-cy="line-qty">{line.qty}</span>
              <button
                type="button"
                data-cy="line-increment"
                aria-label={`Increase ${line.name}`}
                disabled={busy}
                onClick={() => setQty(line.id, line.qty + 1)}
              >
                +
              </button>
            </div>

            <span data-cy="line-total">{money(line.price * line.qty)}</span>

            <button type="button" className="link" data-cy="line-remove" disabled={busy} onClick={() => removeLine(line.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <dl className="totals" data-cy="totals">
        <dt>Subtotal</dt>
        <dd data-cy="subtotal">{money(totals.subtotal)}</dd>
        <dt>Bulk discount</dt>
        <dd data-cy="discount">−{money(totals.discount)}</dd>
        <dt>Shipping</dt>
        <dd data-cy="shipping">{totals.shipping === 0 ? 'Free' : money(totals.shipping)}</dd>
        <dt>Total</dt>
        <dd data-cy="total">{money(totals.total)}</dd>
      </dl>

      <p className="muted" data-cy="policy">
        Free shipping over {money(FREE_SHIPPING_THRESHOLD)} · 10% off over {money(BULK_DISCOUNT_THRESHOLD)}
      </p>

      <Link to="/checkout" className="primary" data-cy="go-to-checkout">
        Checkout
      </Link>
    </section>
  );
}
