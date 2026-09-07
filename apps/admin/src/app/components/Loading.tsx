export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <p className="loading" data-cy="loading">
      {label}
    </p>
  );
}
