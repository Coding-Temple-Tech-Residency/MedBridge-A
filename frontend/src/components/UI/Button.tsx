import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyles =
    'rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-brand-dark text-white hover:bg-brand-primary',
    secondary: 'bg-brand-light text-brand-dark hover:bg-brand-gold',
    outline: 'border border-brand-dark text-brand-dark hover:bg-brand-bg',
    ghost: 'text-gray-500 hover:text-brand-dark hover:bg-brand-bg',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
