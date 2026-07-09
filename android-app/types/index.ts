export type AppState = 'idle' | 'connecting' | 'reconnecting' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
}

export interface MemoryEntry {
  id: string;
  key: string;
  value: string;
  category: 'preference' | 'personal' | 'fact' | 'instruction';
  timestamp: string;
  synced: number; // 0 or 1
}

export interface UserSettings {
  voice: string;
  language: string;
  sensitivity: 'low' | 'medium' | 'high';
  assistantName: string;
  offlineMode: boolean;
  firebaseSync: boolean;
  volume: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  streak: number;
  joinedDate: string;
}
