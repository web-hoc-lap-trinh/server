import { Server } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, CoderySocket } from './socket.types';

export const LessonRoom = (lessonId: number) => `lesson:${lessonId}`;
export const ProblemRoom = (problemId: number) => `problem:${problemId}`;
export const SubmissionRoom = (submissionId: number) => `submission:${submissionId}`;

export let io: Server<ClientToServerEvents, ServerToClientEvents>;

export const initializeIo = (socketIoServer: Server) => {
  io = socketIoServer;
};

export const setupRoomHandlers = (socket: CoderySocket) => {
  socket.on('join:lesson-room', (lessonId: number) => {
    const roomName = LessonRoom(lessonId);
    socket.join(roomName);
  });

  socket.on('leave:lesson-room', (lessonId: number) => {
    const roomName = LessonRoom(lessonId);
    socket.leave(roomName);
  });

  socket.on('join:problem-room', (problemId: number) => {
    const roomName = ProblemRoom(problemId);
    socket.join(roomName);
  });

  socket.on('leave:problem-room', (problemId: number) => {
    const roomName = ProblemRoom(problemId);
    socket.leave(roomName);
  });

  socket.on('submission:track', (submissionId: number) => {
    const roomName = SubmissionRoom(submissionId);
    socket.join(roomName);
  });
};