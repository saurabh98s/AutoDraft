import { useState, useEffect, useCallback, useRef } from 'react';
import { API_URL } from '../lib/constants';

interface EventSourceOptions {
  onMessage?: (event: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export const useEventSource = (options: EventSourceOptions = {}) => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<Event | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { onMessage, onError, onOpen } = options;

  const stopEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const startEventSource = useCallback((endpoint: string) => {
    // First close any existing connection
    stopEventSource();

    // Create a new connection
    const url = `${API_URL}${endpoint}`;
    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      if (onOpen) onOpen();
    };

    // Listen for message events
    eventSource.addEventListener('message', (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData((prev) => [...prev, parsedData]);
        if (onMessage) onMessage(event);
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    });

    // Listen for error events
    eventSource.addEventListener('error', (event) => {
      try {
        const parsedData = JSON.parse((event as MessageEvent).data);
        setData((prev) => [...prev, parsedData]);
      } catch (error) {
        console.error('Failed to parse SSE error data:', error);
      }
      
      setError(event);
      setIsConnected(false);
      if (onError) onError(event);
      stopEventSource();
    });

    // Handle generic errors
    eventSource.onerror = (event) => {
      setError(event);
      setIsConnected(false);
      if (onError) onError(event);
      stopEventSource();
    };

    return eventSource;
  }, [onMessage, onError, onOpen, stopEventSource]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopEventSource();
    };
  }, [stopEventSource]);

  const reset = useCallback(() => {
    setData([]);
    setError(null);
  }, []);

  return {
    data,
    error,
    isConnected,
    reset,
    startEventSource,
    stopEventSource,
  };
}; 