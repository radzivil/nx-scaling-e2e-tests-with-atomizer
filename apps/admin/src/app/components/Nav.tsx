import { Link, NavLink } from 'react-router-dom';
import { Button } from 'ui';
import { useAdmin } from '../state/store';

export function Nav() {
  const { user, signOut, settings } = useAdmin();

  if (!user) return null;

  return (
    <nav className="app-nav" data-cy="app-nav">
      <Link to="/" className="app-brand" data-cy="brand">
        {settings.storeName} Admin
      </Link>
      <NavLink to="/" end data-cy="nav-dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
        Dashboard
      </NavLink>
      <NavLink to="/products" data-cy="nav-products" className={({ isActive }) => (isActive ? 'active' : '')}>
        Products
      </NavLink>
      <NavLink to="/orders" data-cy="nav-orders" className={({ isActive }) => (isActive ? 'active' : '')}>
        Orders
      </NavLink>
      <NavLink to="/users" data-cy="nav-users" className={({ isActive }) => (isActive ? 'active' : '')}>
        Users
      </NavLink>
      <NavLink to="/settings" data-cy="nav-settings" className={({ isActive }) => (isActive ? 'active' : '')}>
        Settings
      </NavLink>
      <span className="nav-spacer" />
      <span className="nav-user" data-cy="current-user">
        {user.email}
      </span>
      <Button variant="ghost" data-cy="sign-out" onClick={signOut}>
        Sign out
      </Button>
    </nav>
  );
}
