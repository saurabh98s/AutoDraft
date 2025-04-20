import { useCallback, useRef } from 'react';

interface EventSourceOptions {
  onMessage?: (event: { data: string }) => void;
  onError?: (error: any) => void;
  onOpen?: () => void;
  onComplete?: () => void;
}

export const useEventSource = (options: EventSourceOptions = {}) => {
  const eventSourceRef = useRef<EventSource | null>(null);

  const startEventSource = useCallback((url: string) => {
    // Close any existing connections
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    try {
      // Create new EventSource connection
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;
      
      // Set up event handlers
      eventSource.onopen = () => {
        if (options.onOpen) options.onOpen();
      };
      
      eventSource.onmessage = (event) => {
        if (options.onMessage) options.onMessage(event);
      };
      
      eventSource.onerror = (error) => {
        if (options.onError) options.onError(error);
        eventSource.close();
        eventSourceRef.current = null;
        if (options.onComplete) options.onComplete();
      };
      
      // Return a cleanup function
      return () => {
        eventSource.close();
        eventSourceRef.current = null;
      };
    } catch (error) {
      console.error('Error establishing SSE connection:', error);
      if (options.onError) options.onError(error);
      if (options.onComplete) options.onComplete();
    }
  }, [options]);
  
  const stopEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      if (options.onComplete) options.onComplete();
    }
  }, [options]);
  
  return {
    startEventSource,
    stopEventSource,
    isConnected: !!eventSourceRef.current
  };
}; 