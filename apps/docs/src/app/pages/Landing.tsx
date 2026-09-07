import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card } from 'ui';
import { byCategory } from '../content/articles';
import { fetchOverview } from '../lib/api';

const FEATURES = [
  {
    id: 'atomizer',
    title: 'One target per spec',
    body: 'The atomizer turns a single end-to-end project into one cacheable target per spec file.',
  },
  {
    id: 'cache',
    title: 'Replay instead of rerun',
    body: 'Every target is hashed from its inputs, so an untouched spec is replayed rather than run again.',
  },
  {
    id: 'parallel',
    title: 'Scale across agents',
    body: 'Small targets schedule well. Add agents and wall-clock time falls instead of flattening out.',
  },
  {
    id: 'graph',
    title: 'Honest dependencies',
    body: 'The project graph decides what is affected, so a change to one library never reruns the world.',
  },
];

export function Landing() {
  const [overview, setOverview] = useState<{ articles: number; categories: number } | null>(null);

  useEffect(() => {
    let live = true;
    fetchOverview().then((value) => {
      if (live) setOverview(value);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="landing">
      <section className="hero" data-cy="hero">
        <h1 data-cy="page-title">Nx Shop Documentation</h1>
        <p className="hero-subtitle" data-cy="hero-subtitle">
          Everything you need to build, test and ship on the Nx Shop platform.
        </p>
        <div className="hero-actions">
          <Link className="ui-btn ui-btn-primary" to="/docs/installation" data-cy="hero-cta">
            Get started
          </Link>
          <Link className="ui-btn" to="/changelog" data-cy="hero-changelog">
            Read the changelog
          </Link>
        </div>
        {overview === null ? (
          <p className="muted" data-cy="overview-loading">
            Loading the library…
          </p>
        ) : (
          <p className="muted" data-cy="overview">
            {overview.articles} articles across {overview.categories} categories
          </p>
        )}
      </section>

      <ul className="feature-grid" data-cy="feature-grid">
        {FEATURES.map((feature) => (
          <li key={feature.id} data-cy="feature-card" data-feature={feature.id}>
            <Card title={<span data-cy="feature-title">{feature.title}</span>}>
              <p data-cy="feature-body">{feature.body}</p>
            </Card>
          </li>
        ))}
      </ul>

      <section data-cy="categories">
        {byCategory().map(({ category, articles }) => (
          <Card
            key={category}
            cy="category-card"
            title={<span data-cy="category-title">{category}</span>}
            actions={<Badge cy="category-count">{articles.length} articles</Badge>}
          >
            <ul className="category-list">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link to={`/docs/${article.slug}`} data-cy="article-link" data-slug={article.slug}>
                    {article.title}
                  </Link>
                  <span className="muted" data-cy="article-summary">
                    {article.summary}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>
    </div>
  );
}
