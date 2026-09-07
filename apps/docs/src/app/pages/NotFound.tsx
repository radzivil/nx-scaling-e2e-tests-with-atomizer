import { Link } from 'react-router-dom';
import { EmptyState } from 'ui';

export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <section data-cy="not-found">
      <h1 data-cy="not-found-title">404 — {what} not found</h1>
      <EmptyState
        cy="not-found-body"
        message={`We could not find that ${what}. It may have been renamed or removed.`}
        action={
          <div className="not-found-actions">
            <Link className="ui-btn ui-btn-primary" to="/" data-cy="back-home">
              Back to the home page
            </Link>
            <Link className="ui-btn" to="/docs/installation" data-cy="back-docs">
              Browse the docs
            </Link>
          </div>
        }
      />
    </section>
  );
}
