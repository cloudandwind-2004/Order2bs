import { useEffect, useRef, useCallback } from 'react';
import type { WSMessage } from '@/types';

type Handler = (payload: unknown) => void;

export function useWebSocket(handlers: Record<string, Handler>) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      console.log('🔗 WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        const handler = handlersRef.current[msg.type];
        if (handler) {
          handler(msg.payload);
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected, reconnecting in 3s...');
      setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('WS error', err);
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return wsRef;
}
