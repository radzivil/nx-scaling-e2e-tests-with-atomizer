import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Field({ label, error, id, ...rest }: Props) {
  const inputId = id ?? `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <label className="ui-field" htmlFor={inputId}>
      <span className="ui-field-label">{label}</span>
      <input id={inputId} aria-invalid={Boolean(error)} {...rest} />
      {error && (
        <span className="ui-field-error" data-cy={`error-${rest.name ?? inputId}`}>
          {error}
        </span>
      )}
    </label>
  );
}
