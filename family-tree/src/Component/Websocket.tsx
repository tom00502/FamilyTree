import { useCallback, useEffect, useRef, useState } from "react";

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const listeners = useRef<Set<(msg: string) => void>>(new Set());

  useEffect(() => {
    let isCleaned = false;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => { if (!isCleaned) setConnected(true); };
    ws.onclose = () => { if (!isCleaned) setConnected(false); };
    ws.onerror = () => { if (!isCleaned) setConnected(false); };
    ws.onmessage = (e) => {
      if (!isCleaned) listeners.current.forEach((cb) => cb(e.data));
    };

    return () => {
      isCleaned = true;
      ws.close();
    };
  }, [url]);

  const send = useCallback((data: string | object) => {
    if (!wsRef.current) return;
    wsRef.current.send(
      typeof data === "string" ? data : JSON.stringify(data)
    );
  }, []);

  const subscribe = useCallback((cb: (msg: string) => void) => {
    listeners.current.add(cb);
    return () => {
      listeners.current.delete(cb);
    };
  }, []);

  return { connected, send, subscribe };
}
