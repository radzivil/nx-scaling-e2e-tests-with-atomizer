import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEMO_USER, authenticate } from '../lib/api';
import { useShop } from '../state/store';

export function Login() {
  const { signIn } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      signIn(await authenticate(email, password));
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="narrow">
      <h1 data-cy="page-title">Sign in</h1>

      <form onSubmit={onSubmit} data-cy="login-form" noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" data-cy="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Password</label>
        <input id="password" type="password" data-cy="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && (
          <p className="error" data-cy="login-error">
            {error}
          </p>
        )}

        <button type="submit" className="primary" data-cy="submit-login" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="muted" data-cy="demo-credentials">
        Demo account: {DEMO_USER.email} / {DEMO_USER.password}
      </p>
    </section>
  );
}
