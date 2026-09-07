import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, Field } from 'ui';
import { money } from 'formatting';
import { Loading } from '../components/Loading';
import { useLoaded } from '../lib/api';
import { CATEGORIES, type Category } from '../data/seed';
import { useAdmin } from '../state/store';

interface Draft {
  name: string;
  price: string;
  stock: string;
  category: Category;
}

type Errors = Partial<Record<keyof Draft, string>>;

export function validateDraft(draft: Draft): Errors {
  const errors: Errors = {};
  if (!draft.name.trim()) errors.name = 'Name is required';
  else if (draft.name.trim().length < 3) errors.name = 'Name must be at least 3 characters';

  const price = Number(draft.price);
  if (draft.price.trim() === '' || Number.isNaN(price)) errors.price = 'Price must be a number';
  else if (price <= 0) errors.price = 'Price must be greater than zero';

  const stock = Number(draft.stock);
  if (draft.stock.trim() === '' || Number.isNaN(stock)) errors.stock = 'Stock must be a number';
  else if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Stock must be a whole number of 0 or more';

  return errors;
}

export function ProductEdit() {
  const { id = '' } = useParams();
  const { products, updateProduct, saving } = useAdmin();
  const loaded = useLoaded(`product-${id}`);
  const product = products.find((p) => p.id === id);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!product) return;
    setDraft({ name: product.name, price: String(product.price), stock: String(product.stock), category: product.category });
    setErrors({});
    setSaved(false);
    // Only reseed the form when the route changes, not on every store write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, loaded]);

  if (!loaded) {
    return (
      <section>
        <h1 data-cy="page-title">Product</h1>
        <Loading />
      </section>
    );
  }

  if (!product) {
    return (
      <section>
        <h1 data-cy="page-title">Product</h1>
        <EmptyState
          message={`No product with id "${id}".`}
          cy="not-found"
          action={
            <Link to="/products" data-cy="back-to-products">
              Back to products
            </Link>
          }
        />
      </section>
    );
  }

  const current = draft ?? { name: product.name, price: String(product.price), stock: String(product.stock), category: product.category };

  const set = (patch: Partial<Draft>) => {
    setDraft({ ...current, ...patch });
    setSaved(false);
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateDraft(current);
    setErrors(found);
    setSaved(false);
    if (Object.keys(found).length > 0) return;

    await updateProduct(id, {
      name: current.name.trim(),
      price: Number(current.price),
      stock: Number(current.stock),
      category: current.category,
    });
    setSaved(true);
  }

  const dirty =
    current.name !== product.name ||
    Number(current.price) !== product.price ||
    Number(current.stock) !== product.stock ||
    current.category !== product.category;

  return (
    <section className="narrow">
      <div className="page-head">
        <h1 data-cy="page-title">Edit product</h1>
        <Link to="/products" data-cy="back-to-products">
          Back to products
        </Link>
      </div>

      <Card title={product.name} cy="product-card">
        <p className="muted" data-cy="product-sku">
          {product.sku}
        </p>
        <p className="muted" data-cy="saved-price">
          Saved price {money(product.price)} · {product.stock} in stock
        </p>

        <form onSubmit={onSubmit} data-cy="product-form" noValidate>
          <Field label="Name" name="name" data-cy="name" value={current.name} error={errors.name} onChange={(e) => set({ name: e.target.value })} />
          <Field label="Price" name="price" data-cy="price" value={current.price} error={errors.price} onChange={(e) => set({ price: e.target.value })} />
          <Field label="Stock" name="stock" data-cy="stock" value={current.stock} error={errors.stock} onChange={(e) => set({ stock: e.target.value })} />

          <label className="ui-field" htmlFor="category">
            <span className="ui-field-label">Category</span>
            <select
              id="category"
              data-cy="category"
              value={current.category}
              onChange={(e) => set({ category: e.target.value as Category })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="actions">
            <Button type="submit" data-cy="save-product" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              data-cy="reset-product"
              disabled={saving || !dirty}
              onClick={() => {
                setDraft({ name: product.name, price: String(product.price), stock: String(product.stock), category: product.category });
                setErrors({});
                setSaved(false);
              }}
            >
              Reset
            </Button>
          </div>

          {saved && (
            <p className="notice" data-cy="save-notice">
              Product saved
            </p>
          )}
        </form>
      </Card>
    </section>
  );
}
