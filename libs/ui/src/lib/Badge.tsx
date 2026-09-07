export function Badge({ tone = 'neutral', children, cy }: { tone?: 'neutral' | 'good' | 'warn' | 'bad'; children: React.ReactNode; cy?: string }) {
  return (
    <span className={`ui-badge ui-badge-${tone}`} data-cy={cy}>
      {children}
    </span>
  );
}
