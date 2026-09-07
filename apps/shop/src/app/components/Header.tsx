import { Link, NavLink } from 'react-router-dom';
import { useShop } from '../state/store';

export function Header() {
  const { itemCount, user, signOut } = useShop();

  return (
    <header className="header">
      <Link to="/" className="brand" data-cy="brand">
        Nx&nbsp;Shop
      </Link>

      <nav className="nav">
        <NavLink to="/" end data-cy="nav-catalog">
          Catalog
        </NavLink>
        <NavLink to="/orders" data-cy="nav-orders">
          Orders
        </NavLink>
        <NavLink to="/cart" data-cy="nav-cart">
          Cart
          <span className="badge" data-cy="cart-count">
            {itemCount}
          </span>
        </NavLink>
      </nav>

      {user ? (
        <div className="account">
          <span data-cy="current-user">{user.email}</span>
          <button type="button" className="link" data-cy="sign-out" onClick={signOut}>
            Sign out
          </button>
        </div>
      ) : (
        <NavLink to="/login" className="account" data-cy="nav-login">
          Sign in
        </NavLink>
      )}
    </header>
  );
}
