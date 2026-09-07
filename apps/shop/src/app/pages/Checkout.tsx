import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { submitOrder } from '../lib/api';
import { money, totalsOf } from '../lib/pricing';
import { useShop } from '../state/store';

interface Fields {
  fullName: string;
  address: string;
  city: string;
  postcode: string;
}

const EMPTY: Fields = { fullName: '', address: '', city: '', postcode: '' };

function validate(fields: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (!fields.fullName.trim()) errors.fullName = 'Full name is required';
  if (!fields.address.trim()) errors.address = 'Address is required';
  if (!fields.city.trim()) errors.city = 'City is required';
  if (!/^\d{6}$/.test(fields.postcode.trim())) errors.postcode = 'Postcode must be 6 digits';
  return errors;
}

export function Checkout() {
  const { lines, user, clearCart, recordOrder } = useShop();
  const location = useLocation();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [pending, setPending] = useState(false);
  const [confirmation, setConfirmation] = useState<{ reference: string; total: number } | null>(null);

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (confirmation) {
    return (
      <section className="narrow">
        <h1 data-cy="page-title">Order confirmed</h1>
        <p data-cy="order-reference">{confirmation.reference}</p>
        <p data-cy="order-total">{money(confirmation.total)}</p>
        <Link to="/orders" data-cy="view-orders">
          View orders
        </Link>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="narrow">
        <h1 data-cy="page-title">Checkout</h1>
        <p data-cy="empty-cart">Your cart is empty.</p>
        <Link to="/" data-cy="back-to-catalog">
          Browse the catalog
        </Link>
      </section>
    );
  }

  const totals = totalsOf(lines);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setPending(true);
    const { reference } = await submitOrder({ ...fields, lines });
    recordOrder({
      reference,
      placedAt: new Date().toISOString(),
      email: user!.email,
      lines,
      total: totals.total,
    });
    clearCart();
    setPending(false);
    setConfirmation({ reference, total: totals.total });
  }

  const field = (key: keyof Fields, label: string) => (
    <>
      <label htmlFor={key}>{label}</label>
      <input id={key} data-cy={key} value={fields[key]} onChange={(e) => setFields({ ...fields, [key]: e.target.value })} />
      {errors[key] && (
        <p className="error" data-cy={`error-${key}`}>
          {errors[key]}
        </p>
      )}
    </>
  );

  return (
    <section className="narrow">
      <h1 data-cy="page-title">Checkout</h1>
      <p className="muted" data-cy="checkout-email">
        {user.email}
      </p>

      <form onSubmit={onSubmit} data-cy="checkout-form" noValidate>
        {field('fullName', 'Full name')}
        {field('address', 'Address')}
        {field('city', 'City')}
        {field('postcode', 'Postcode')}

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

        <button type="submit" className="primary" data-cy="place-order" disabled={pending}>
          {pending ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </section>
  );
}
