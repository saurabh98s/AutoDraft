import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { WS_URL } from '../lib/constants';
import * as Y from 'yjs';

interface PresenceUser {
  id: string;
  name: string;
  color: string;
  cursor: {
    x: number;
    y: number;
  } | null;
}

export const usePresence = (docId: string) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateCursor = useCallback((x: number, y: number) => {
    if (!user) return;
    
    // This would be implemented with y-websocket awareness
    // For now, we'll just log it
    console.log(`User ${user.id} moved cursor to (${x}, ${y})`);
  }, [user]);

  useEffect(() => {
    if (!user || !docId) return;

    // In a real implementation, this would use y-websocket
    // For now, we'll simulate presence with a mock implementation
    const mockUsers: PresenceUser[] = [
      {
        id: user.id,
        name: user.name,
        color: '#0070f3',
        cursor: null,
      },
      {
        id: 'user2',
        name: 'Jane Doe',
        color: '#ff0000',
        cursor: { x: 100, y: 200 },
      },
      {
        id: 'user3',
        name: 'John Smith',
        color: '#00ff00',
        cursor: { x: 300, y: 400 },
      },
    ];

    setUsers(mockUsers);
    setIsConnected(true);

    // Cleanup
    return () => {
      setIsConnected(false);
    };
  }, [user, docId]);

  return {
    users,
    isConnected,
    error,
    updateCursor,
  };
}; 