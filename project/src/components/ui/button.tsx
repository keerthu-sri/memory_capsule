import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
          variant === 'default' && 'bg-[#7919e6] hover:bg-[#6a15cc] text-white shadow-lg hover:shadow-xl',
          variant === 'outline' && 'border border-[#7919e633] bg-[#ffffff08] hover:bg-[#ffffff12] text-white',
          variant === 'ghost' && 'hover:bg-[#ffffff08] text-white',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
