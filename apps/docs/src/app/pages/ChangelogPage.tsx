import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, EmptyState } from 'ui';
import { CHANGE_TYPES, type ChangeType, type Release } from '../content/changelog';
import { fetchReleases } from '../lib/api';

type Filter = ChangeType | 'all';

const TONE: Record<ChangeType, 'good' | 'neutral' | 'bad'> = {
  feature: 'good',
  fix: 'neutral',
  breaking: 'bad',
};

export function ChangelogPage() {
  const [releases, setReleases] = useState<Release[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    let live = true;
    fetchReleases().then((found) => {
      if (live) setReleases(found);
    });
    return () => {
      live = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (releases === null) return [];
    return releases
      .map((release) => ({
        ...release,
        changes: filter === 'all' ? release.changes : release.changes.filter((c) => c.type === filter),
      }))
      .filter((release) => release.changes.length > 0);
  }, [releases, filter]);

  const changeCount = visible.reduce((total, release) => total + release.changes.length, 0);

  if (releases === null) {
    return (
      <p className="muted" data-cy="changelog-loading">
        Loading releases…
      </p>
    );
  }

  return (
    <section>
      <h1 data-cy="page-title">Changelog</h1>

      <div className="chips" data-cy="changelog-filter">
        {(['all', ...CHANGE_TYPES] as Filter[]).map((value) => (
          <button
            key={value}
            type="button"
            className={value === filter ? 'chip chip-active' : 'chip'}
            data-cy={`filter-${value}`}
            aria-pressed={value === filter}
            onClick={() => setFilter(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <p className="muted" data-cy="filter-count">
        {changeCount} changes in {visible.length} releases
      </p>

      {visible.length === 0 ? (
        <EmptyState cy="changelog-empty" message="No changes of that kind have shipped yet." />
      ) : (
        visible.map((release) => (
          <Card
            key={release.version}
            cy="release"
            title={<span data-cy="release-version">{release.version}</span>}
            actions={
              <span className="muted" data-cy="release-date">
                {release.date}
              </span>
            }
          >
            <ul className="change-list" data-version={release.version}>
              {release.changes.map((change) => (
                <li key={change.id} data-cy="change-item" data-type={change.type}>
                  <Badge cy="change-type" tone={TONE[change.type]}>
                    {change.type}
                  </Badge>
                  <span data-cy="change-text">{change.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))
      )}
    </section>
  );
}
