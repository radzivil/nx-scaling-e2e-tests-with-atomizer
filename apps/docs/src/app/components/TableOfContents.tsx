import { useLocation } from 'react-router-dom';

export function TableOfContents({ items }: { items: { id: string; text: string }[] }) {
  // index.html carries `<base href="/">`, so a bare `#id` href would resolve
  // against the base and navigate home. Qualify it with the current path.
  const { pathname } = useLocation();

  if (items.length === 0) return null;

  return (
    <aside className="docs-toc" data-cy="toc">
      <h2 className="toc-title" data-cy="toc-title">
        On this page
      </h2>
      <p className="muted" data-cy="toc-count">
        {items.length} sections
      </p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`${pathname}#${item.id}`} data-cy="toc-item" data-target={item.id}>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
