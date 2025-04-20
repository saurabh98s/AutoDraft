import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white',
  };

  const toastContent = (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center justify-between rounded-md px-4 py-3 shadow-lg transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${typeStyles[type]}`}
      role="alert"
    >
      <p className="mr-4 text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-4 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  if (!mounted) return null;

  return createPortal(toastContent, document.body);
};

export default Toast; 