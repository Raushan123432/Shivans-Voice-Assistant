import { AppState, MessagePayload, ClientPayload, ToolResponse, VoiceType } from '../types';
import audioStreamer from './AudioStreamer';
import ToolExecutor from './ToolExecutor';

export class LiveSession {
  private ws: WebSocket | null = null;
  private isConnecting = false;
  private autoReconnect = true;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: any = null;
  private currentVoice: VoiceType = 'Zephyr';
  private currentLanguage = 'English';
  private currentSensitivity = 'medium';
  private currentAssistantName = 'Shivansh AI Agent';
  private currentSpeakingRate = 1.0;
  private messageQueue: string[] = [];

  // State Change callback
  private onStateChange: (state: AppState) => void = () => {};
  private onTranscriptChange: (text: string, isUser: boolean) => void = () => {};
  private onError: (errorMsg: string) => void = () => {};

  constructor() {}

  public setAssistantName(name: string) {
    this.currentAssistantName = name;
  }

  public setSpeakingRate(rate: number) {
    this.currentSpeakingRate = rate;
    audioStreamer.setSpeakingRate(rate);
  }

  public setVoice(voice: VoiceType) {
    this.currentVoice = voice;
    // If connected, we can send a status_change to update the voice or let it apply on next connect
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'status_change',
        voice: this.currentVoice
      }));
    }
  }

  public setLanguage(lang: string) {
    this.currentLanguage = lang;
  }

  public setSensitivity(sens: string) {
    this.currentSensitivity = sens;
  }

  public registerCallbacks(
    onStateChange: (state: AppState) => void,
    onTranscriptChange: (text: string, isUser: boolean) => void,
    onError: (errorMsg: string) => void
  ) {
    this.onStateChange = onStateChange;
    this.onTranscriptChange = onTranscriptChange;
    this.onError = onError;
  }

  /**
   * Establishes a WebSocket connection to our backend server
   */
  public connect() {
    if (this.ws || this.isConnecting) return;

    this.isConnecting = true;
    this.onStateChange('connecting');

    // Use ws:// or wss:// depending on HTTP protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const customApiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('babu_custom_api_key') || '' : '';
    const wsUrl = `${protocol}//${window.location.host}/ws/live?voice=${this.currentVoice}&language=${encodeURIComponent(this.currentLanguage)}&sensitivity=${this.currentSensitivity}&assistantName=${encodeURIComponent(this.currentAssistantName)}&speakingRate=${this.currentSpeakingRate}${customApiKey ? `&apiKey=${encodeURIComponent(customApiKey)}` : ''}`;
    
    console.log(`[LiveSession] Connecting to ${wsUrl}`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[LiveSession] Connected to backend WS!');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.onStateChange('connected');
        
        // Process any queued messages
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift();
          if (msg) {
            this.sendTextMessage(msg);
          }
        }
        
        // Start streaming mic audio directly to our WS
        this.startMicStreaming();
      };

      this.ws.onmessage = async (event) => {
        try {
          const payload: MessagePayload = JSON.parse(event.data);

          switch (payload.type) {
            case 'audio':
              if (payload.data) {
                audioStreamer.playChunk(payload.data);
              }
              break;

            case 'interrupted':
              console.log('[LiveSession] Audio interrupted by barge-in');
              audioStreamer.interrupt();
              this.onStateChange('interrupted');
              // Briefly transition back to idle/listening after a moment
              setTimeout(() => this.onStateChange('listening'), 200);
              break;

            case 'status':
              if (payload.status) {
                this.onStateChange(payload.status);
              }
              break;

            case 'transcript':
              if (payload.transcript) {
                this.onTranscriptChange(
                  payload.transcript.text,
                  payload.transcript.isUser
                );
              }
              break;

            case 'tool_call':
              if (payload.functionCalls) {
                this.onStateChange('thinking');
                for (const call of payload.functionCalls) {
                  const toolResponse = await ToolExecutor.execute(call);
                  this.sendToolResponse(toolResponse);
                }
              }
              break;

            case 'error':
              if (payload.error) {
                console.error('[LiveSession] Server Error:', payload.error);
                this.onError(payload.error);
                this.onStateChange('error');
              }
              break;
          }
        } catch (e) {
          console.error('[LiveSession] Error processing message:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[LiveSession] WebSocket error occurred:', err);
        if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          // Silent warning during auto-reconnection
          console.log('[LiveSession] Handled transient socket error. Auto-reconnect is active.');
        } else {
          this.onStateChange('error');
          this.onError('Network connection error. Please try again.');
        }
      };

      this.ws.onclose = (event) => {
        console.log('[LiveSession] Connection closed:', event.code, event.reason);
        this.isConnecting = false;
        this.ws = null;
        
        audioStreamer.stopRecording();
        audioStreamer.interrupt();

        const isFatalError = event.code === 1008 || event.code === 4000;

        if (!isFatalError && this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.onStateChange('reconnecting');
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
          this.reconnectAttempts++;
          console.log(`[LiveSession] Reconnection attempt #${this.reconnectAttempts} in ${delay}ms`);
          
          this.reconnectTimer = setTimeout(() => {
            this.connect();
          }, delay);
        } else {
          this.onStateChange(isFatalError ? 'error' : 'disconnected');
        }
      };

    } catch (e: any) {
      console.error('[LiveSession] Failed to connect:', e);
      this.isConnecting = false;
      this.onStateChange('error');
      this.onError(e.message || 'Connection failed.');
    }
  }

  public getIsConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public setAutoReconnect(auto: boolean) {
    this.autoReconnect = auto;
  }

  /**
   * Disconnects the session
   */
  public disconnect() {
    this.autoReconnect = false;
    this.messageQueue = [];
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    audioStreamer.stopRecording();
    audioStreamer.interrupt();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.onStateChange('disconnected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  public sendTextMessage(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'text',
        text
      }));
    } else {
      console.log('[LiveSession] Queueing text message because socket is not open:', text);
      this.messageQueue.push(text);
      if (!this.ws && !this.isConnecting) {
        this.connect();
      }
    }
  }

  /**
   * Start recording microphone and streaming chunks directly to WebSocket
   */
  public async startMicStreaming() {
    try {
      await audioStreamer.startRecording((base64Pcm) => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const payload: ClientPayload = {
            type: 'audio',
            audio: base64Pcm
          };
          this.ws.send(JSON.stringify(payload));
        }
      });
      // Set state to listening once mic is active
      this.onStateChange('listening');
    } catch (err: any) {
      console.warn('[LiveSession] Mic recording start failed:', err?.message || err);
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.onStateChange('connected');
      } else {
        this.onStateChange('idle');
      }
      this.onError('Microphone permission denied or unavailable. Shivansh AI remains fully operational via text commands!');
    }
  }

  /**
   * Send function response back to the server
   */
  private sendToolResponse(toolResponse: ToolResponse) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const payload: ClientPayload = {
        type: 'tool_response',
        toolResponse
      };
      this.ws.send(JSON.stringify(payload));
      console.log(`[LiveSession] Sent tool response back for ${toolResponse.id}`);
    }
  }
}

export const liveSession = new LiveSession();
export default liveSession;
