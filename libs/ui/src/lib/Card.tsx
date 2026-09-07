import type { ReactNode } from 'react';

export function Card({ title, actions, children, cy }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; cy?: string }) {
  return (
    <section className="ui-card" data-cy={cy}>
      {(title || actions) && (
        <header className="ui-card-head">
          {title && <h2 className="ui-card-title">{title}</h2>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
