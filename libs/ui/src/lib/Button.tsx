import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
};

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return <button className={`ui-btn ui-btn-${variant} ${className}`.trim()} {...rest} />;
}
