import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderFallback = () => {
    if (!fallback) return null;
    return (
      <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground">
        <span className="text-sm font-medium">{getInitials(fallback)}</span>
      </div>
    );
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          className="rounded-full object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        renderFallback()
      )}
    </div>
  );
};

export default Avatar; 