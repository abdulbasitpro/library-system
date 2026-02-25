import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-glow-sm focus:ring-primary-500/40',
  secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 focus:ring-neutral-400/40',
  ghost:     'bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 focus:ring-neutral-400/40',
  outline:   'bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 focus:ring-neutral-400/40',
  danger:    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm focus:ring-rose-500/40',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm focus:ring-emerald-500/40',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const base = `
    inline-flex items-center justify-center font-medium
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    whitespace-nowrap select-none
  `;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;
