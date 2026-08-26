export type AppState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'idle'
  | 'sleeping'
  | 'clap_detected'
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
  clapDetectionEnabled?: boolean;
  clapMode?: 'single' | 'double';
  clapSensitivity?: 'low' | 'medium' | 'high';
  backgroundModeEnabled?: boolean;
  emotionalModeEnabled?: boolean;
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

export interface ActiveTimer {
  id: string;
  label: string;
  totalDurationSeconds: number;
  durationMinutes: number;
  durationSeconds: number;
  startTime: number;
  endTime: number;
  remainingSeconds: number;
  status: 'running' | 'paused' | 'completed' | 'cancelled';
  pausedAt?: number;
}

export interface StopwatchState {
  status: 'stopped' | 'running' | 'paused';
  startTime: number;
  elapsedBeforePause: number;
  laps: Array<{
    lapNumber: number;
    lapTime: string;
    splitTime: string;
    timestamp: number;
  }>;
}

export interface VideoPlaybackState {
  status: 'playing' | 'paused' | 'stopped';
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0 to 100
  query: string;
  videoTitle: string;
  platform: 'youtube' | 'chrome' | 'spotify' | 'vlc';
  url: string;
  sourceApp?: string;
  updatedAt: number;
}

export interface SecondScreenState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  mode: 'youtube' | 'website' | 'media' | 'blank';
  title: string;
  service: 'youtube' | 'chrome' | 'google' | 'facebook' | 'wikipedia' | 'custom';
  url: string;
  currentQuery: string;
  videoId?: string;
  playbackStatus: 'playing' | 'paused' | 'stopped';
  isMuted: boolean;
  volume: number;
  playlistIndex: number;
  playlist: Array<{ title: string; query: string; videoId?: string }>;
  isExternalWindowOpen: boolean;
  lastAction: string;
  updatedAt: number;
}

export type SecondScreenAction =
  | 'open'
  | 'close'
  | 'navigate'
  | 'search_youtube'
  | 'play'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'mute'
  | 'unmute'
  | 'next'
  | 'previous'
  | 'focus'
  | 'minimize'
  | 'maximize'
  | 'restore'
  | 'popout';

export type AllowedBrowserAction =
  | 'navigate'
  | 'search'
  | 'play'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'mute'
  | 'unmute'
  | 'set_volume'
  | 'next_track'
  | 'previous_track'
  | 'refresh'
  | 'history_back'
  | 'history_forward'
  | 'minimize'
  | 'maximize'
  | 'restore'
  | 'close'
  | 'popout'
  | 'scroll_up'
  | 'scroll_down'
  | 'take_screenshot';

export type DomainCategory = 'search' | 'media' | 'social' | 'developer' | 'streaming' | 'shopping' | 'utility' | 'custom';

export interface WhitelistDomainEntry {
  id: string;
  domain: string;
  category: DomainCategory;
  description: string;
  isSystem: boolean;
  enabled: boolean;
  dateAdded: number;
}

export interface SecurityAuditEvent {
  id: string;
  timestamp: number;
  action: string;
  target: string;
  status: 'allowed' | 'blocked' | 'sanitized';
  reason: string;
  category: 'domain' | 'code_execution' | 'action' | 'scheme';
}

export interface SecurityPolicyState {
  arbitraryExecutionBlocked: boolean;
  strictDomainWhitelistEnforced: boolean;
  allowedActionsOnlyEnforced: boolean;
  blockedAttemptsCount: number;
  allowedRequestsCount: number;
  sanitizedRequestsCount: number;
  recentSecurityLogs: SecurityAuditEvent[];
}
