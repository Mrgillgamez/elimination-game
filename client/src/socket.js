import { io } from 'socket.io-client';

// In local development, frontend (5173) and backend (4000) run on different ports.
// In production, they're the same server/origin, so no URL is needed at all.
const SERVER_URL = import.meta.env.DEV ? 'http://localhost:4000' : undefined;

export const socket = io(SERVER_URL);