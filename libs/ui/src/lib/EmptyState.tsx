import type { ReactNode } from 'react';

export function EmptyState({ message, action, cy }: { message: string; action?: ReactNode; cy?: string }) {
  return (
    <div className="ui-empty" data-cy={cy}>
      <p>{message}</p>
      {action}
    </div>
  );
}
