import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Message, AppState } from '../types';
import { SQLiteMemoryService } from './SQLiteMemoryService';
import { AndroidIntents } from './AndroidIntents';

export class GeminiLiveService {
  private static ws: WebSocket | null = null;
  private static isConnecting = false;
  private static recording: Audio.Recording | null = null;
  private static playSound: Audio.Sound | null = null;
  private static audioQueue: string[] = []; // Array of Base64 chunks to play sequentially
  private static isPlaying = false;
  private static currentVoice = 'Zephyr';
  private static currentLanguage = 'English';
  private static currentSensitivity = 'medium';
  private static currentAssistantName = 'BABU AI';
  private static messageQueue: string[] = [];

  // State Callbacks
  private static onStateChange: (state: AppState) => void = () => {};
  private static onMessageReceived: (msg: Message) => void = () => {};
  private static onAudioVisualizerData: (level: number) => void = () => {};

  public static initialize(callbacks: {
    onStateChange: (state: AppState) => void;
    onMessageReceived: (msg: Message) => void;
    onAudioVisualizerData: (level: number) => void;
  }) {
    this.onStateChange = callbacks.onStateChange;
    this.onMessageReceived = callbacks.onMessageReceived;
    this.onAudioVisualizerData = callbacks.onAudioVisualizerData;
  }

  /**
   * Connects to secure backend WebSocket proxy
   */
  public static async connect(config: {
    voice: string;
    language: string;
    sensitivity: 'low' | 'medium' | 'high';
    assistantName: string;
  }) {
    if (this.ws || this.isConnecting) return;

    this.currentVoice = config.voice;
    this.currentLanguage = config.language;
    this.currentSensitivity = config.sensitivity;
    this.currentAssistantName = config.assistantName;

    this.isConnecting = true;
    this.onStateChange('connecting');

    const backendWsUrl = `wss://ais-dev-2cj3t5surtdsecvywu3p4u-602578311229.asia-east1.run.app/ws/live?voice=${encodeURIComponent(this.currentVoice)}&language=${encodeURIComponent(this.currentLanguage)}&sensitivity=${encodeURIComponent(this.currentSensitivity)}&assistantName=${encodeURIComponent(this.currentAssistantName)}`;

    try {
      console.log('[GeminiLiveService] Connecting to:', backendWsUrl);
      this.ws = new WebSocket(backendWsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.onStateChange('idle');
        console.log('[GeminiLiveService] WebSocket connected successfully.');

        // Flush any queued text messages
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift();
          if (msg) this.sendTextMessage(msg);
        }

        // Start microphone recording and streaming
        this.startRecordingAndStreaming();
      };

      this.ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'text') {
            this.onStateChange('speaking');
            const newMsg: Message = {
              id: Math.random().toString(),
              sender: 'bot',
              text: data.text,
              timestamp: new Date().toISOString(),
              status: 'sent',
            };
            await SQLiteMemoryService.saveMessage(newMsg);
            this.onMessageReceived(newMsg);
          }

          if (data.type === 'audio') {
            this.onStateChange('speaking');
            this.queueAudioChunk(data.audio);
          }

          if (data.type === 'toolCall') {
            await this.handleNativeToolCall(data.name, data.args, data.id);
          }

          if (data.type === 'state') {
            this.onStateChange(data.state as AppState);
          }

          if (data.type === 'error') {
            console.error('[GeminiLiveService] Server error:', data.error);
            this.onStateChange('error');
          }
        } catch (e) {
          // Binary audio packet fallback
          if (typeof event.data === 'string' && event.data.startsWith('/')) {
            // It's raw audio chunk encoded as base64
            this.queueAudioChunk(event.data);
          }
        }
      };

      this.ws.onerror = (e) => {
        console.error('[GeminiLiveService] WebSocket error:', e);
        this.onStateChange('error');
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.isConnecting = false;
        this.onStateChange('reconnecting');
        console.log('[GeminiLiveService] WebSocket closed. Auto-reconnecting in 3s...');
        setTimeout(() => this.connect(config), 3000);
      };

    } catch (err) {
      console.error('[GeminiLiveService] Connect failed:', err);
      this.isConnecting = false;
      this.onStateChange('error');
    }
  }

  /**
   * Disconnect the Live conversation
   */
  public static async disconnect() {
    this.stopRecordingAndStreaming();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
    this.onStateChange('idle');
  }

  /**
   * Send text prompt manually to Gemini Live
   */
  public static sendTextMessage(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'text', text }));
    } else {
      console.log('[GeminiLiveService] Queuing text message (WS offline):', text);
      this.messageQueue.push(text);
    }
  }

  /**
   * Capture microphone audio and stream PCM chunks to server
   */
  private static async startRecordingAndStreaming() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.warn('Microphone permission not granted.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      // 16kHz Mono 16-bit PCM configuration for Gemini Live API
      const recordingConfig = {
        android: {
          extension: '.pcm',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {}
      };

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(recordingConfig);
      
      // Periodically stream audio chunks
      this.recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          // Map metering (-160 to 0dB) to a 0-1 range for visualizer
          const normalizedLevel = Math.max(0, (status.metering + 160) / 160);
          this.onAudioVisualizerData(normalizedLevel);
          
          // Fast-stream chunks securely
          this.streamRecordingChunk();
        }
      });

      await this.recording.startAsync();
      console.log('[GeminiLiveService] Recording started.');

    } catch (err) {
      console.error('[GeminiLiveService] Failed to start recording:', err);
    }
  }

  private static async streamRecordingChunk() {
    if (!this.recording || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    try {
      const uri = this.recording.getURI();
      if (!uri) return;

      // Extract raw audio data as Base64 chunk
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send raw base64 PCM chunk over WebSocket
      this.ws.send(JSON.stringify({
        type: 'audio',
        audio: base64Audio,
      }));

    } catch (err) {
      // Audio stream chunk skip logging
    }
  }

  private static async stopRecordingAndStreaming() {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
    } catch (e) {
      console.error('[GeminiLiveService] Stop recording error:', e);
    }
  }

  // --- AUDIO OUT SYSTEM ---

  private static queueAudioChunk(base64Audio: string) {
    this.audioQueue.push(base64Audio);
    if (!this.isPlaying) {
      this.playNextAudioChunk();
    }
  }

  private static async playNextAudioChunk() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.onStateChange('idle');
      return;
    }

    this.isPlaying = true;
    const chunk = this.audioQueue.shift();
    if (!chunk) return;

    try {
      const tempFileUri = `${FileSystem.cacheDirectory}gemini_out.wav`;
      await FileSystem.writeAsStringAsync(tempFileUri, chunk, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: tempFileUri },
        { shouldPlay: true }
      );

      this.playSound = sound;
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          this.playNextAudioChunk();
        }
      });

    } catch (err) {
      console.error('[GeminiLiveService] Play chunk error:', err);
      this.playNextAudioChunk();
    }
  }

  // --- NATIVE ANDROID INTENT TOOL HANDLER ---

  private static async handleNativeToolCall(name: string, args: Record<string, any>, id: string) {
    console.log(`[GeminiLiveService] Executing Android Native Intent tool: ${name}`, args);
    let result: Record<string, any> = { success: false };

    try {
      switch (name) {
        case 'openWhatsApp':
          result = await AndroidIntents.openWhatsApp(args.number, args.message);
          break;
        case 'openInstagram':
          result = await AndroidIntents.openInstagram(args.username);
          break;
        case 'openFacebook':
          result = await AndroidIntents.openFacebook();
          break;
        case 'openMessenger':
          result = await AndroidIntents.openMessenger();
          break;
        case 'openYouTube':
          result = await AndroidIntents.openYouTube(args.query);
          break;
        case 'openSpotify':
          result = await AndroidIntents.openSpotify(args.query);
          break;
        case 'openNetflix':
          result = await AndroidIntents.openNetflix();
          break;
        case 'openGoogleMaps':
          result = await AndroidIntents.openGoogleMaps(args.location);
          break;
        case 'openGmail':
          result = await AndroidIntents.openGmail(args.to, args.subject, args.body);
          break;
        case 'openSMS':
          result = await AndroidIntents.openSMS(args.number, args.message);
          break;
        case 'openPhoneDialer':
          result = await AndroidIntents.openPhoneDialer(args.number);
          break;
        case 'openContacts':
          result = await AndroidIntents.openContacts();
          break;
        case 'openCamera':
          result = await AndroidIntents.openCamera();
          break;
        case 'openGallery':
          result = await AndroidIntents.openGallery();
          break;
        case 'openFiles':
          result = await AndroidIntents.openFiles();
          break;
        case 'openCalculator':
          result = await AndroidIntents.openCalculator();
          break;
        case 'openClock':
          result = await AndroidIntents.openClock();
          break;
        case 'openSettings':
          result = await AndroidIntents.openSettings();
          break;
        case 'openPlayStore':
          result = await AndroidIntents.openPlayStore(args.packageName);
          break;
        default:
          result = { error: `Intent ${name} not found or unsupported.` };
          break;
      }
    } catch (e: any) {
      result = { error: e.message || 'Intent launch failed.' };
    }

    // Send tool response back to Gemini Live
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'toolResponse',
        id,
        name,
        response: result,
      }));
    }
  }
}
export default GeminiLiveService;
