import { io } from "socket.io-client";
import API from "./api";

const socket = io(API.defaults.baseURL || "http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

function connectSocket() {
  const token = localStorage.getItem("token");
  socket.auth = token ? { token } : {};

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function joinRealtimeRoom(room) {
  const activeSocket = connectSocket();
  activeSocket.emit("join_room", room);
}

export function subscribeRealtime(eventName, handler) {
  const activeSocket = connectSocket();
  activeSocket.on(eventName, handler);

  return () => {
    activeSocket.off(eventName, handler);
  };
}

export default socket;
