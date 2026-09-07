import { NavLink } from 'react-router-dom';
import { byCategory } from '../content/articles';

export function Sidebar() {
  return (
    <nav className="docs-sidebar" aria-label="Documentation" data-cy="sidebar">
      {byCategory().map(({ category, articles }) => (
        <div className="sidebar-group" key={category} data-cy="sidebar-group" data-category={category}>
          <h2 className="sidebar-group-title" data-cy="sidebar-group-title">
            {category}
          </h2>
          <ul>
            {articles.map((article) => (
              <li key={article.slug}>
                <NavLink
                  to={`/docs/${article.slug}`}
                  data-cy="sidebar-link"
                  data-slug={article.slug}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {article.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
