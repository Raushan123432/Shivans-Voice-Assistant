export type AppState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'interrupted'
  | 'reconnecting'
  | 'error';

export interface ToolCall {
  name: string;
  args: Record<string, any>;
  id: string;
}

export interface ToolResponse {
  id: string;
  name?: string;
  response: Record<string, any>;
}

export interface MessagePayload {
  type: 'audio' | 'interrupted' | 'tool_call' | 'status' | 'transcript' | 'error';
  data?: string; // Base64 audio or other string data
  functionCalls?: ToolCall[];
  status?: AppState;
  transcript?: {
    text: string;
    isUser: boolean;
  };
  error?: string;
}

export interface ClientPayload {
  type: 'audio' | 'tool_response' | 'status_change';
  audio?: string; // PCM16 base64
  toolResponse?: ToolResponse;
  status?: AppState;
}

export type VoiceType = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface UserSettings {
  voice: VoiceType;
  volume: number; // 0 to 1
  muted: boolean;
  autoReconnect: boolean;
}

export interface PendingConfirmation {
  id: string;
  name: string;
  args: Record<string, any>;
  resolve: (value: Record<string, any>) => void;
  reject: (reason?: any) => void;
  isAutoConfirmed?: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered';
}


