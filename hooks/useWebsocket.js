"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import env from "@utilities/env";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [wsData, setWsData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws;

    const connect = () => {
      ws = new WebSocket(env.websocket);
      setSocket(ws);

      ws.onopen = () => {
        console.log('✅ Connected to WebSocket server');
        setIsConnected(true);

        ws.pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 Received from bot:', data);
        setWsData(data);
      };

      ws.onclose = () => {
        console.log('❌ WebSocket connection closed');
        setIsConnected(false);
        clearInterval(ws.pingInterval);
        setTimeout(connect, 1000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };
    };

    connect();

    return () => {
      if (ws) {
        clearInterval(ws.pingInterval);
        ws.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ wsData, socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
