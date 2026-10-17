"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useRealtime(onRefresh: () => void, enabled = true) {
  const callback = useRef(onRefresh);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    callback.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
      return;
    }
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4099", { transports: ["websocket"] });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => callback.current(), 75);
    };
    socket.on("connect", () => {
      setConnected(true);
      refresh();
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));
    socket.on("workspace.updated", refresh);
    return () => {
      clearTimeout(timer);
      socket.disconnect();
    };
  }, [enabled]);

  return connected;
}
