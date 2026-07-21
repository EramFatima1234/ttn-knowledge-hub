export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  data?: Record<string, string>;
}

export interface PushPort {
  sendToUser(userId: string, payload: PushPayload): Promise<void>;
}

export const PUSH_PORT = Symbol('PUSH_PORT');
