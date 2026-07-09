import { ChatMessage } from '../types';

const DB_NAME = 'babu_ai_chat_db';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

let dbInstance: IDBDatabase | null = null;

export const initChatDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('[ChatDB] Failed to open IndexedDB:', event);
      reject(event);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      dbInstance = db;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const getChatHistory = async (): Promise<ChatMessage[]> => {
  try {
    const db = await initChatDb();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const messages = request.result as ChatMessage[];
        messages.sort((a, b) => a.timestamp - b.timestamp);
        resolve(messages);
      };

      request.onerror = () => {
        resolve(getLocalStorageFallback());
      };
    });
  } catch (err) {
    console.warn('[ChatDB] Error using IndexedDB, falling back to localStorage:', err);
    return getLocalStorageFallback();
  }
};

export const saveChatMessage = async (message: ChatMessage): Promise<void> => {
  try {
    const db = await initChatDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(message);

      request.onsuccess = () => resolve();
      request.onerror = (err) => reject(err);
    });
  } catch (err) {
    console.warn('[ChatDB] IndexedDB save failed, saving to localStorage:', err);
    saveToLocalStorageFallback(message);
  }
};

export const deleteChatHistory = async (): Promise<void> => {
  try {
    const db = await initChatDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        localStorage.removeItem('babu_ai_chat_fallback');
        resolve();
      };
      request.onerror = (err) => reject(err);
    });
  } catch (err) {
    localStorage.removeItem('babu_ai_chat_fallback');
  }
};

// Fallback Helper Functions
function getLocalStorageFallback(): ChatMessage[] {
  try {
    const saved = localStorage.getItem('babu_ai_chat_fallback');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorageFallback(message: ChatMessage) {
  try {
    const list = getLocalStorageFallback();
    // Check if message already exists
    if (!list.some(m => m.id === message.id)) {
      list.push(message);
      localStorage.setItem('babu_ai_chat_fallback', JSON.stringify(list));
    }
  } catch (e) {
    console.error('[ChatDB] LocalStorage save failed:', e);
  }
}
