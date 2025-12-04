import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  user?: {
    user_id: number;
    role: string;
  };
}

export type SubmissionUpdatePayload = {
  submission_id: number;
  status: string;
  execution_time?: number;
  memory_used?: number;
  test_cases_passed?: number;
  total_test_cases?: number;
  error_message?: string;
}

export interface ServerToClientEvents {
  'lesson:new-discussion': (data: any) => void;
  'lesson:update-discussion': (data: any) => void;
  'lesson:delete-discussion': (data: { discussion_id: number }) => void;
  'lesson:new-reply': (data: any) => void;
  'lesson:update-reply': (data: any) => void;
  'lesson:delete-reply': (data: { reply_id: number; discussion_id: number }) => void;
  'lesson:vote-update': (data: {
    discussion_id: number;
    reply_id?: number;
    upvotes: number;
    downvotes: number;
  }) => void;
  
  'submission:status-update': (data: {
    submission_id: number;
    status: string; 
    execution_time?: number;
    memory_used?: number;
    test_cases_passed?: number;
    total_test_cases?: number;
    error_message?: string;
  }) => void;

  'system:error': (data: { message: string }) => void;
  'user:notification': (data: any) => void;
}

export interface ClientToServerEvents {
  'join:lesson-room': (lessonId: number) => void;
  'leave:lesson-room': (lessonId: number) => void;
  'join:problem-room': (problemId: number) => void;
  'leave:problem-room': (problemId: number) => void;
  'submission:track': (submissionId: number) => void;
}

export type CoderySocket = AuthenticatedSocket;
