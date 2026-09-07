import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../state/store';

export function RequireAuth({ children }: { children: ReactElement }) {
  const { user } = useAdmin();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  return children;
}
