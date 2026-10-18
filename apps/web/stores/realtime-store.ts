"use client";
import { create } from "zustand";
import type { Socket } from "socket.io-client";

type RealtimeState = {
  socket: Socket | null;
  connected: boolean;
  readingRoomId: string;
  setReadingRoomId: (id: string) => void;
};

export const useRealtimeStore = create<RealtimeState>((set) => ({
  socket: null,
  connected: false,
  readingRoomId: "",
  setReadingRoomId: (id) => set({ readingRoomId: id }),
}));
