import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ServerToClientEvents, ClientToServerEvents, AuthenticatedSocket } from './socket.types';
import { setupRoomHandlers, initializeIo } from './rooms';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  user_id: number;
  role: string;
}

const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication Error: Missing token'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (socket as AuthenticatedSocket).user = decoded; 
    next();
  } catch (err) {
    next(new Error('Authentication Error: Invalid token'));
  }
};

export const initializeRealtimeServer = (server: HttpServer) => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/ws/socket.io', 
  });

  initializeIo(io); 

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(
      `⚡ User connected: ID ${authSocket.user?.user_id} (${authSocket.user?.role}) | Socket ID: ${socket.id}`
    );

    setupRoomHandlers(authSocket);

    socket.on('disconnect', () => {
      console.log(
        `-- User disconnected: ID ${authSocket.user?.user_id} | Socket ID: ${socket.id}`
      );
    });
  });
};