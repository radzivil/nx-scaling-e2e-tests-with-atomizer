import { useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from 'ui';
import { useTheme } from '../state/theme';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <header className="app-nav" data-cy="header">
      <Link to="/" className="app-brand" data-cy="brand">
        Nx Shop Docs
      </Link>

      <nav className="docs-nav">
        <NavLink to="/" end data-cy="nav-home">
          Home
        </NavLink>
        <NavLink to="/docs/installation" data-cy="nav-docs">
          Docs
        </NavLink>
        <NavLink to="/changelog" data-cy="nav-changelog">
          Changelog
        </NavLink>
      </nav>

      <form className="header-search" onSubmit={submit} data-cy="header-search-form" role="search">
        <input
          type="search"
          placeholder="Search the docs"
          aria-label="Search the docs"
          data-cy="header-search-input"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
        <Button type="submit" variant="ghost" data-cy="header-search-submit">
          Search
        </Button>
      </form>

      <Button
        type="button"
        variant="ghost"
        data-cy="theme-toggle"
        aria-pressed={theme === 'dark'}
        onClick={toggleTheme}
      >
        Theme: <span data-cy="theme-label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
      </Button>
    </header>
  );
}
