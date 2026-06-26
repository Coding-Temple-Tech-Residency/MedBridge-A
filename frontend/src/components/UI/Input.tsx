import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-brand-dark"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`w-full rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:border-transparent ${
          error
            ? 'border border-red-500 focus:ring-red-500'
            : 'border border-gray-200 focus:ring-brand-primary'
        }`}
        {...props}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;