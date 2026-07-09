import { create } from 'zustand';
import { AppState, Message, MemoryEntry, UserSettings, UserProfile } from '../types';
import { SQLiteMemoryService } from '../services/SQLiteMemoryService';
import { FirebaseSyncService } from '../services/FirebaseSyncService';
import { GeminiLiveService } from '../services/GeminiLiveService';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface LiveSessionStore {
  appState: AppState;
  messages: Message[];
  memories: MemoryEntry[];
  settings: UserSettings;
  profile: UserProfile;
  visualizerLevel: number;
  
  // App Controls
  setAppState: (state: AppState) => void;
  setVisualizerLevel: (level: number) => void;
  
  // Chat History
  loadChatHistory: () => Promise<void>;
  addMessage: (msg: Message) => Promise<void>;
  clearChat: () => Promise<void>;
  
  // Memories
  loadMemories: () => Promise<void>;
  addMemory: (key: string, value: string, category: MemoryEntry['category']) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  
  // Settings & Profile
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  
  // Sync
  syncCloud: () => Promise<{ success: boolean; message: string }>;
  
  // Session Voice controls
  startVoiceSession: () => Promise<void>;
  stopVoiceSession: () => Promise<void>;
}

const DEFAULT_SETTINGS: UserSettings = {
  voice: 'Zephyr',
  language: 'English',
  sensitivity: 'medium',
  assistantName: 'BABU AI',
  offlineMode: false,
  firebaseSync: true,
  volume: 80,
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Babu Guest',
  email: 'aayanishkumar@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  streak: 5,
  joinedDate: new Date().toLocaleDateString(),
};

// Load initial values from MMKV
const initialSettings: UserSettings = storage.getString('settings') 
  ? JSON.parse(storage.getString('settings')!) 
  : DEFAULT_SETTINGS;

const initialProfile: UserProfile = storage.getString('profile') 
  ? JSON.parse(storage.getString('profile')!) 
  : DEFAULT_PROFILE;

export const useLiveSession = create<LiveSessionStore>((set, get) => {
  
  // Initialize GeminiLiveService callbacks
  GeminiLiveService.initialize({
    onStateChange: (state) => set({ appState: state }),
    onMessageReceived: (msg) => {
      set((store) => ({ messages: [...store.messages, msg] }));
    },
    onAudioVisualizerData: (level) => set({ visualizerLevel: level }),
  });

  return {
    appState: 'idle',
    messages: [],
    memories: [],
    settings: initialSettings,
    profile: initialProfile,
    visualizerLevel: 0,

    setAppState: (state) => set({ appState: state }),
    setVisualizerLevel: (level) => set({ visualizerLevel: level }),

    loadChatHistory: async () => {
      const history = await SQLiteMemoryService.getChatHistory();
      set({ messages: history });
    },

    addMessage: async (msg) => {
      await SQLiteMemoryService.saveMessage(msg);
      set((store) => ({ messages: [...store.messages, msg] }));
      
      // If voice is active, also stream to Live API
      if (get().appState !== 'disconnected') {
        GeminiLiveService.sendTextMessage(msg.text);
      }
    },

    clearChat: async () => {
      await SQLiteMemoryService.clearChatHistory();
      set({ messages: [] });
    },

    loadMemories: async () => {
      const memories = await SQLiteMemoryService.getMemories();
      set({ memories });
    },

    addMemory: async (key, value, category) => {
      const newEntry: MemoryEntry = {
        id: Math.random().toString(),
        key,
        value,
        category,
        timestamp: new Date().toISOString(),
        synced: 0,
      };
      await SQLiteMemoryService.saveMemory(newEntry);
      set((store) => ({ memories: [newEntry, ...store.memories] }));
      
      if (get().settings.firebaseSync) {
        await get().syncCloud();
      }
    },

    deleteMemory: async (id) => {
      await SQLiteMemoryService.deleteMemory(id);
      set((store) => ({ memories: store.memories.filter((m) => m.id !== id) }));
    },

    updateSettings: (newSettings) => {
      const updated = { ...get().settings, ...newSettings };
      storage.set('settings', JSON.stringify(updated));
      set({ settings: updated });
    },

    updateProfile: (newProfile) => {
      const updated = { ...get().profile, ...newProfile };
      storage.set('profile', JSON.stringify(updated));
      set({ profile: updated });
    },

    syncCloud: async () => {
      const email = get().profile.email;
      return await FirebaseSyncService.syncWithCloud(email);
    },

    startVoiceSession: async () => {
      const { voice, language, sensitivity, assistantName } = get().settings;
      await GeminiLiveService.connect({ voice, language, sensitivity, assistantName });
    },

    stopVoiceSession: async () => {
      await GeminiLiveService.disconnect();
    },
  };
});

export default useLiveSession;
