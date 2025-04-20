import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../lib/constants';

interface EventSourceOptions {
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export const useEventSource = (endpoint: string, options: EventSourceOptions = {}) => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<Event | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { onMessage, onError, onOpen } = options;

  const connect = useCallback(() => {
    const url = `${API_URL}${endpoint}`;
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onopen = () => {
      setIsConnected(true);
      if (onOpen) onOpen();
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData((prev) => [...prev, parsedData]);
        if (onMessage) onMessage(parsedData);
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    };

    eventSource.onerror = (event) => {
      setError(event);
      setIsConnected(false);
      if (onError) onError(event);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [endpoint, onMessage, onError, onOpen]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
  }, []);

  return {
    data,
    error,
    isConnected,
    reset,
  };
}; 