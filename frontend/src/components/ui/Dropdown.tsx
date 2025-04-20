import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const alignStyles = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-56 origin-top-right rounded-md bg-popover shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none ${alignStyles[align]}`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      className={`block w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
      tabIndex={-1}
    >
      {children}
    </button>
  );
};

interface DropdownSeparatorProps {
  className?: string;
}

export const DropdownSeparator: React.FC<DropdownSeparatorProps> = ({ className = '' }) => {
  return <div className={`my-1 h-px bg-border ${className}`} />;
};

export default Dropdown; 