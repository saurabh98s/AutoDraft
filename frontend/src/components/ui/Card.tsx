import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  footer,
}) => {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      {(title || subtitle) && (
        <div className="flex flex-col space-y-1.5 p-6">
          {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className="p-6 pt-0">{children}</div>
      {footer && <div className="flex items-center p-6 pt-0">{footer}</div>}
    </div>
  );
};

export default Card; 