import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge, Button, EmptyState } from 'ui';
import { searchArticles, type SearchHit } from '../lib/api';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [term, setTerm] = useState(query);
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => setTerm(query), [query]);

  useEffect(() => {
    if (query.trim() === '') {
      setHits(null);
      setLoading(false);
      return;
    }
    let live = true;
    setLoading(true);
    setHits(null);
    searchArticles(query).then((found) => {
      if (!live) return;
      setHits(found);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [query]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setParams(term.trim() === '' ? {} : { q: term.trim() });
  };

  return (
    <section className="search-page">
      <h1 data-cy="page-title">Search</h1>

      <form className="search-form" onSubmit={submit} data-cy="search-form" role="search">
        <input
          type="search"
          placeholder="Search the docs"
          aria-label="Search the documentation"
          data-cy="search-input"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
        <Button type="submit" data-cy="search-submit">
          Search
        </Button>
      </form>

      {query.trim() === '' && (
        <EmptyState cy="search-prompt" message="Type a word or two to search every article in the documentation." />
      )}

      {loading && (
        <p className="muted" data-cy="search-loading">
          Searching…
        </p>
      )}

      {!loading && hits !== null && (
        <>
          <p className="muted" data-cy="result-count">
            {hits.length} {hits.length === 1 ? 'result' : 'results'} for "{query.trim()}"
          </p>

          {hits.length === 0 ? (
            <EmptyState
              cy="search-empty"
              message={`No articles match "${query.trim()}".`}
              action={
                <Button
                  type="button"
                  variant="ghost"
                  data-cy="clear-search"
                  onClick={() => {
                    setTerm('');
                    setParams({});
                  }}
                >
                  Clear the search
                </Button>
              }
            />
          ) : (
            <ul className="search-results" data-cy="search-results">
              {hits.map((hit) => (
                <li key={hit.slug}>
                  <Link
                    className="search-result"
                    to={`/docs/${hit.slug}`}
                    data-cy="search-result"
                    data-slug={hit.slug}
                  >
                    <span className="search-result-title" data-cy="search-result-title">
                      {hit.title}
                    </span>
                    <Badge cy="search-result-category">{hit.category}</Badge>
                    <span className="muted" data-cy="search-result-matches">
                      {hit.matches} matches
                    </span>
                    <span className="muted" data-cy="search-result-snippet">
                      {hit.snippet}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
