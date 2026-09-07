import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, DataTable, EmptyState, type Column } from 'ui';
import { formatQuantity, money } from 'formatting';
import { Loading } from '../components/Loading';
import { useLoaded } from '../lib/api';
import { CATEGORIES, type Product } from '../data/seed';
import { useAdmin } from '../state/store';

type SortKey = 'name' | 'price' | 'stock' | 'sku';

export function Products() {
  const { products, settings, adjustStock, saving } = useAdmin();
  const loaded = useLoaded('products');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = products.filter((p) => {
      const matchesQuery = !needle || p.name.toLowerCase().includes(needle) || p.category.toLowerCase().includes(needle);
      const matchesCategory = category === 'all' || p.category === category;
      return matchesQuery && matchesCategory;
    });

    const direction = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'price') return (a.price - b.price) * direction;
      if (sortKey === 'stock') return (a.stock - b.stock) * direction;
      if (sortKey === 'sku') return a.sku.localeCompare(b.sku) * direction;
      return a.name.localeCompare(b.name) * direction;
    });
  }, [products, query, category, sortKey, sortDir]);

  function onSort(key: string) {
    const next = key as SortKey;
    if (next === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(next);
      setSortDir('asc');
    }
  }

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (p) => (
        <Link to={`/products/${p.id}`} data-cy="product-name">
          {p.name}
        </Link>
      ),
    },
    { key: 'sku', header: 'SKU', sortable: true, render: (p) => <span data-cy="product-sku">{p.sku}</span> },
    { key: 'category', header: 'Category', render: (p) => <span data-cy="product-category">{p.category}</span> },
    { key: 'price', header: 'Price', sortable: true, render: (p) => <span data-cy="product-price">{money(p.price)}</span> },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (p) => (
        <span className="stock-editor">
          <Button
            variant="ghost"
            data-cy="stock-decrement"
            aria-label={`Decrease stock for ${p.name}`}
            disabled={saving || p.stock === 0}
            onClick={() => adjustStock(p.id, -1)}
          >
            −
          </Button>
          <span data-cy="product-stock">{p.stock}</span>
          <Button
            variant="ghost"
            data-cy="stock-increment"
            aria-label={`Increase stock for ${p.name}`}
            disabled={saving}
            onClick={() => adjustStock(p.id, 1)}
          >
            +
          </Button>
          {p.stock < settings.lowStockThreshold && (
            <Badge tone="warn" cy="low-stock-flag">
              low
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <Link to={`/products/${p.id}`} data-cy="edit-product">
          Edit
        </Link>
      ),
    },
  ];

  return (
    <section>
      <div className="page-head">
        <h1 data-cy="page-title">Products</h1>
      </div>

      {!loaded ? (
        <Loading />
      ) : (
        <Card cy="products-card">
          <div className="toolbar">
            <input
              data-cy="product-filter"
              placeholder="Filter products"
              aria-label="Filter products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select data-cy="category-filter" aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="muted" data-cy="product-count">
              {formatQuantity(rows.length, 'product')}
            </span>
            <Button variant="ghost" data-cy="clear-filters" onClick={() => { setQuery(''); setCategory('all'); }}>
              Clear
            </Button>
          </div>

          {rows.length === 0 ? (
            <EmptyState message="No products match that filter." cy="no-products" />
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(p) => p.id}
              cy="products"
              onSort={onSort}
              sortKey={sortKey}
              sortDir={sortDir}
            />
          )}
        </Card>
      )}
    </section>
  );
}
