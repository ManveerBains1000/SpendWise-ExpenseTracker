import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { SOCKET_URL } from "../config/env";

export const SocketContext = createContext(null);

const SOCKET_ENABLED = import.meta.env.VITE_ENABLE_SOCKET !== "false";

export const SocketProvider = ({ children }) => {
  const { accessToken } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  // Keep a mutable ref so the cleanup callback always has the latest socket
  const socketRef = useRef(null);

  useEffect(() => {
    if (!SOCKET_ENABLED) {
      setConnected(false);
      setSocket(null);
      return;
    }

    if (!accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Create socket with auth token
    const sock = io(SOCKET_URL, {
      auth: { token: accessToken },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    sock.on("connect", () => {
      console.log("[Socket] Connected:", sock.id);
      setConnected(true);
    });

    sock.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
      setConnected(false);
    });

    sock.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
      setConnected(false);
    });

    socketRef.current = sock;
    // Expose socket via state so context consumers re-render when it changes
    setSocket(sock);

    return () => {
      sock.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
