import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'info';
  title?: string;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'default',
  title,
  className = '',
}) => {
  const baseStyles = 'relative w-full rounded-lg border p-4';
  
  const variantStyles = {
    default: 'bg-background text-foreground',
    destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
    success: 'border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600',
    info: 'border-blue-500/50 text-blue-600 dark:border-blue-500 [&>svg]:text-blue-600',
  };
  
  const icons = {
    default: AlertCircle,
    destructive: XCircle,
    success: CheckCircle,
    info: Info,
  };
  
  const Icon = icons[variant];
  
  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;
  
  return (
    <div className={classes} role="alert">
      <div className="flex items-start gap-2">
        <Icon className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
          <div className="text-sm [&_p]:leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Alert; 