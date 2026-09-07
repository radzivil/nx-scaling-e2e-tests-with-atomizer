import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Field } from 'ui';
import { ADMIN_USER, authenticate } from '../lib/api';
import { useAdmin } from '../state/store';

export function Login() {
  const { user, signIn } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [failure, setFailure] = useState('');
  const [pending, setPending] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  if (user) return <Navigate to={redirectTo} replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFailure('');

    const found: { email?: string; password?: string } = {};
    if (!email.trim()) found.email = 'Email is required';
    if (!password) found.password = 'Password is required';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setPending(true);
    try {
      signIn(await authenticate(email, password));
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFailure((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-shell">
      <Card title="Sign in to the back office" cy="login-card">
        <h1 className="visually-hidden" data-cy="page-title">
          Sign in
        </h1>

        <form onSubmit={onSubmit} data-cy="login-form" noValidate>
          <Field
            label="Email"
            name="email"
            data-cy="email"
            type="email"
            value={email}
            error={errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Password"
            name="password"
            data-cy="password"
            type="password"
            value={password}
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {failure && (
            <p className="error" data-cy="login-error">
              {failure}
            </p>
          )}

          <Button type="submit" data-cy="submit-login" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="muted" data-cy="demo-credentials">
          Demo account: {ADMIN_USER.email} / {ADMIN_USER.password}
        </p>
      </Card>
    </div>
  );
}
