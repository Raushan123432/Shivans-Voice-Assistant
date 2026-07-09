import * as SQLite from 'expo-sqlite';
import { Message, MemoryEntry } from '../types';

export class SQLiteMemoryService {
  private static dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  private static getDB(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = SQLite.openDatabaseAsync('babu_memory.db').then(async (db) => {
        // Initialize tables
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS chat_history (
            id TEXT PRIMARY KEY,
            sender TEXT,
            text TEXT,
            timestamp TEXT,
            status TEXT
          );
          
          CREATE TABLE IF NOT EXISTS memories (
            id TEXT PRIMARY KEY,
            key TEXT,
            value TEXT,
            category TEXT,
            timestamp TEXT,
            synced INTEGER DEFAULT 0
          );
        `);
        return db;
      });
    }
    return this.dbPromise;
  }

  // --- CHAT HISTORY CONTROLS ---

  public static async saveMessage(msg: Message): Promise<void> {
    const db = await this.getDB();
    await db.runAsync(
      'INSERT OR REPLACE INTO chat_history (id, sender, text, timestamp, status) VALUES (?, ?, ?, ?, ?)',
      [msg.id, msg.sender, msg.text, msg.timestamp, msg.status || 'sent']
    );
  }

  public static async getChatHistory(limit = 100): Promise<Message[]> {
    const db = await this.getDB();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM chat_history ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    return rows.reverse().map((r) => ({
      id: r.id,
      sender: r.sender as any,
      text: r.text,
      timestamp: r.timestamp,
      status: r.status as any,
    }));
  }

  public static async clearChatHistory(): Promise<void> {
    const db = await this.getDB();
    await db.runAsync('DELETE FROM chat_history');
  }

  // --- MEMORY ENTRIES ---

  public static async saveMemory(entry: MemoryEntry): Promise<void> {
    const db = await this.getDB();
    await db.runAsync(
      'INSERT OR REPLACE INTO memories (id, key, value, category, timestamp, synced) VALUES (?, ?, ?, ?, ?, ?)',
      [entry.id, entry.key, entry.value, entry.category, entry.timestamp, entry.synced]
    );
  }

  public static async getMemories(): Promise<MemoryEntry[]> {
    const db = await this.getDB();
    const rows = await db.getAllAsync<any>('SELECT * FROM memories ORDER BY timestamp DESC');
    return rows.map((r) => ({
      id: r.id,
      key: r.key,
      value: r.value,
      category: r.category as any,
      timestamp: r.timestamp,
      synced: r.synced,
    }));
  }

  public static async deleteMemory(id: string): Promise<void> {
    const db = await this.getDB();
    await db.runAsync('DELETE FROM memories WHERE id = ?', [id]);
  }

  public static async getUnsyncedMemories(): Promise<MemoryEntry[]> {
    const db = await this.getDB();
    const rows = await db.getAllAsync<any>('SELECT * FROM memories WHERE synced = 0');
    return rows.map((r) => ({
      id: r.id,
      key: r.key,
      value: r.value,
      category: r.category as any,
      timestamp: r.timestamp,
      synced: r.synced,
    }));
  }

  public static async markAsSynced(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await this.getDB();
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(
      `UPDATE memories SET synced = 1 WHERE id IN (${placeholders})`,
      ids
    );
  }
}
export default SQLiteMemoryService;
