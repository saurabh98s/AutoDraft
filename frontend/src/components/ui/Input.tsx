import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      icon: Icon,
      fullWidth = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const baseStyles = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    const widthStyles = fullWidth ? 'w-full' : '';
    
    const classes = `${baseStyles} ${widthStyles} ${className}`;
    
    return (
      <div className={`relative ${widthStyles}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`${classes} ${Icon ? 'pl-10' : ''}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 