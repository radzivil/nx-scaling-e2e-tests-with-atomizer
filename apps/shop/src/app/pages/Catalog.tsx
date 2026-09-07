import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { delay } from '../lib/api';
import { money } from '../lib/pricing';

type Sort = 'name' | 'price-asc' | 'price-desc';

export function Catalog() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [sort, setSort] = useState<Sort>('name');

  useEffect(() => {
    let live = true;
    delay().then(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = PRODUCTS.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (needle === '' || p.name.toLowerCase().includes(needle) || p.blurb.toLowerCase().includes(needle))
    );
    const sorted = [...filtered];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [query, category, sort]);

  if (loading) return <p data-cy="catalog-loading">Loading catalog…</p>;

  return (
    <section>
      <h1 data-cy="page-title">Catalog</h1>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Search products"
          aria-label="Search products"
          data-cy="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="chips" data-cy="category-filter">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={c === category ? 'chip chip-active' : 'chip'}
              data-cy={`category-${c.toLowerCase()}`}
              aria-pressed={c === category}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <select aria-label="Sort products" data-cy="sort-select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="name">Name</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      <p className="muted" data-cy="result-count">
        {visible.length} products
      </p>

      {visible.length === 0 ? (
        <p data-cy="empty-results">No products match that search.</p>
      ) : (
        <ul className="grid" data-cy="product-grid">
          {visible.map((product) => (
            <li key={product.id} className="card" data-cy="product-card" data-product-id={product.id}>
              <Link to={`/product/${product.id}`} data-cy="product-name">
                {product.name}
              </Link>
              <span className="muted" data-cy="product-category">
                {product.category}
              </span>
              <p className="blurb">{product.blurb}</p>
              <strong data-cy="product-price">{money(product.price)}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
