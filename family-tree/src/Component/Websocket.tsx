import { useEffect, useRef, useState } from "react";

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (e) => setLastMessage(e.data);

    return () => ws.close();
  }, [url]);

  const send = (data: string | object) => {
    if (!wsRef.current) return;
    wsRef.current.send(
      typeof data === "string" ? data : JSON.stringify(data)
    );
  };

  return { connected, lastMessage, send };
}
