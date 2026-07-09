import { Message, MemoryEntry } from '../types';
import { SQLiteMemoryService } from './SQLiteMemoryService';

export class FirebaseSyncService {
  private static backendUrl = 'https://ais-dev-2cj3t5surtdsecvywu3p4u-602578311229.asia-east1.run.app'; // Fallback to current dev URL

  public static setBackendUrl(url: string) {
    this.backendUrl = url;
  }

  /**
   * Synchronize local unsynced memories and complete chat history to the cloud securely
   */
  public static async syncWithCloud(userEmail: string): Promise<{ success: boolean; message: string }> {
    if (!userEmail) {
      return { success: false, message: 'No user email configured for cloud sync.' };
    }

    try {
      // 1. Fetch unsynced memories
      const unsyncedMemories = await SQLiteMemoryService.getUnsyncedMemories();
      const chatHistory = await SQLiteMemoryService.getChatHistory(100);

      const payload = {
        email: userEmail,
        memories: unsyncedMemories,
        chatHistory: chatHistory
      };

      const response = await fetch(`${this.backendUrl}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();

      // 2. Mark memories as successfully synced in local SQLite database
      if (unsyncedMemories.length > 0) {
        const syncedIds = unsyncedMemories.map(m => m.id);
        await SQLiteMemoryService.markAsSynced(syncedIds);
      }

      return {
        success: true,
        message: `Sync successful. Uploaded ${unsyncedMemories.length} memories and history.`
      };

    } catch (error: any) {
      console.error('[FirebaseSyncService] Cloud sync failed:', error);
      return {
        success: false,
        message: error.message || 'Network error occurred during sync.'
      };
    }
  }

  /**
   * Fetch complete memories and history from the cloud to seed the local DB on fresh install
   */
  public static async fetchCloudBackup(userEmail: string): Promise<{ success: boolean; memories: MemoryEntry[]; chatHistory: Message[] }> {
    try {
      const response = await fetch(`${this.backendUrl}/api/sync?email=${encodeURIComponent(userEmail)}`);
      if (!response.ok) {
        throw new Error('Could not fetch cloud backup.');
      }
      const data = await response.json();
      
      // Save to local SQLite
      if (data.chatHistory && Array.isArray(data.chatHistory)) {
        for (const msg of data.chatHistory) {
          await SQLiteMemoryService.saveMessage(msg);
        }
      }
      if (data.memories && Array.isArray(data.memories)) {
        for (const entry of data.memories) {
          await SQLiteMemoryService.saveMemory({ ...entry, synced: 1 });
        }
      }

      return {
        success: true,
        memories: data.memories || [],
        chatHistory: data.chatHistory || []
      };
    } catch (e: any) {
      console.error('[FirebaseSyncService] Failed to pull cloud backup:', e);
      return { success: false, memories: [], chatHistory: [] };
    }
  }
}
export default FirebaseSyncService;
