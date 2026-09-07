import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findProduct } from '../data/products';
import { money } from '../lib/pricing';
import { useShop } from '../state/store';

export function ProductDetail() {
  const { id = '' } = useParams();
  const product = findProduct(id);
  const { addToCart, busy } = useShop();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <section>
        <h1 data-cy="page-title">Not found</h1>
        <p data-cy="not-found">We do not stock that product.</p>
        <Link to="/" data-cy="back-to-catalog">
          Back to catalog
        </Link>
      </section>
    );
  }

  return (
    <section className="detail">
      <h1 data-cy="page-title">{product.name}</h1>
      <p className="muted" data-cy="product-category">
        {product.category}
      </p>
      <p data-cy="product-blurb">{product.blurb}</p>
      <strong className="price" data-cy="product-price">
        {money(product.price)}
      </strong>
      <p className="muted" data-cy="product-stock">
        {product.stock} in stock
      </p>

      <div className="qty">
        <button type="button" data-cy="qty-decrement" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
          −
        </button>
        <span data-cy="qty-value">{qty}</span>
        <button
          type="button"
          data-cy="qty-increment"
          aria-label="Increase quantity"
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
        >
          +
        </button>
      </div>

      <button
        type="button"
        className="primary"
        data-cy="add-to-cart"
        disabled={busy}
        onClick={async () => {
          await addToCart(product.id, qty);
          setAdded(true);
        }}
      >
        {busy ? 'Adding…' : 'Add to cart'}
      </button>

      {added && (
        <p className="notice" data-cy="added-notice">
          Added to cart
        </p>
      )}

      <Link to="/" data-cy="back-to-catalog">
        Back to catalog
      </Link>
    </section>
  );
}
