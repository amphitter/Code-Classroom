import { io } from "socket.io-client";

export const socket = io(
  "http://192.168.29.27:5000",
  {
    autoConnect: false,
  }
);