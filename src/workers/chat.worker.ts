// Web Worker for high-performance offscreen chat history and text parsing
// Prevents IndexedDB and heavy string concatenation from blocking the main UI/Audio thread

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered';
}

const DB_NAME = 'babu_ai_chat_db';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

let dbInstance: IDBDatabase | null = null;
let messagesInMemory: ChatMessage[] = [];
let isDbInitialized = false;

// Initialize IndexedDB in Worker thread
const initDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in Worker environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('[Chat Worker DB] Failed to open IndexedDB:', event);
      reject(event);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      dbInstance = db;
      isDbInitialized = true;
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

// Save a single message to IndexedDB
const saveMessageToDb = async (message: ChatMessage): Promise<void> => {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(message);
      request.onsuccess = () => resolve();
      request.onerror = (err) => reject(err);
    });
  } catch (err) {
    console.error('[Chat Worker DB] Failed to save message to database:', err);
  }
};

// Clear all messages from IndexedDB
const clearDb = async (): Promise<void> => {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = (err) => reject(err);
    });
  } catch (err) {
    console.error('[Chat Worker DB] Failed to clear database:', err);
  }
};

// Listen for messages from the main React thread
self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'LOAD_HISTORY': {
      try {
        const db = await initDb();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const fetched = request.result as ChatMessage[];
          fetched.sort((a, b) => a.timestamp - b.timestamp);
          messagesInMemory = fetched;
          self.postMessage({ type: 'HISTORY_LOADED', payload: messagesInMemory });
        };

        request.onerror = () => {
          self.postMessage({ type: 'HISTORY_LOADED', payload: messagesInMemory });
        };
      } catch (err) {
        console.warn('[Chat Worker] DB load error, using in-memory store:', err);
        self.postMessage({ type: 'HISTORY_LOADED', payload: messagesInMemory });
      }
      break;
    }

    case 'ADD_TRANSCRIPT': {
      const { transcript } = payload;
      if (!transcript || !transcript.text || !transcript.text.trim()) return;

      const now = Date.now();
      const lastMsg = messagesInMemory[messagesInMemory.length - 1];

      // Perform text concatenation / chunk accumulation and timestamp checks
      if (lastMsg && lastMsg.isUser === transcript.isUser && (now - lastMsg.timestamp < 15000)) {
        // Appending streamed real-time text chunk to existing block (high frequency)
        const updatedMsg: ChatMessage = {
          ...lastMsg,
          text: lastMsg.text + transcript.text,
          timestamp: now
        };
        messagesInMemory[messagesInMemory.length - 1] = updatedMsg;
        
        // Write to database instantly in background (worker doesn't block UI thread!)
        saveMessageToDb(updatedMsg);
      } else {
        // Create a new separate chat message node
        const newMsg: ChatMessage = {
          id: `msg-${transcript.isUser ? 'user' : 'ai'}-${now}-${Math.random().toString(36).slice(2, 6)}`,
          text: transcript.text,
          isUser: transcript.isUser,
          timestamp: now,
          status: 'delivered'
        };
        messagesInMemory.push(newMsg);
        saveMessageToDb(newMsg);
      }

      // Return fully parsed messages back to main thread
      self.postMessage({ type: 'MESSAGES_UPDATED', payload: messagesInMemory });
      break;
    }

    case 'ADD_TEXT_MESSAGE': {
      const { text, messageId } = payload;
      const now = Date.now();
      const newMsg: ChatMessage = {
        id: messageId,
        text: text,
        isUser: true,
        timestamp: now,
        status: 'sending'
      };

      messagesInMemory.push(newMsg);
      saveMessageToDb(newMsg);

      self.postMessage({ type: 'MESSAGES_UPDATED', payload: messagesInMemory });
      break;
    }

    case 'UPDATE_MESSAGE_STATUS': {
      const { id, status } = payload;
      const idx = messagesInMemory.findIndex(m => m.id === id);
      if (idx !== -1) {
        messagesInMemory[idx] = {
          ...messagesInMemory[idx],
          status: status
        };
        saveMessageToDb(messagesInMemory[idx]);
        self.postMessage({ type: 'MESSAGES_UPDATED', payload: messagesInMemory });
      }
      break;
    }

    case 'CLEAR_HISTORY': {
      await clearDb();
      messagesInMemory = [];
      self.postMessage({ type: 'HISTORY_CLEARED' });
      break;
    }

    default:
      console.warn('[Chat Worker] Unhandled message type:', type);
  }
};
