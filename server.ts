import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Polyfill global WebSocket for @google/genai SDK on Node.js using 'ws'
(globalThis as any).WebSocket = WebSocket;

// Load environment variables
dotenv.config();

const PORT = 3000;
const app = express();
const server = http.createServer(app);

// Use JSON body parser for sync endpoints
app.use(express.json({ limit: '10mb' }));

// Setup Logs Directory & Persistent File Logging
const LOGS_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOGS_DIR, 'app.log');

try {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
} catch (e) {
  console.error('Failed to create logs directory:', e);
}

export function writeLog(level: 'INFO' | 'WARN' | 'ERROR' | 'EXCEPTION', category: string, message: string) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] [${category}] ${message}\n`;
  console.log(`[${category}] ${message}`);
  try {
    fs.appendFileSync(LOG_FILE, logLine, 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

// Log Application Startup
writeLog('INFO', 'APPLICATION-STARTUP', 'Babu AI App environment loaded and components initialized.');

// Exception & Process Lifecycle Handlers
process.on('uncaughtException', (err) => {
  writeLog('EXCEPTION', 'UNCAUGHT-EXCEPTION', err.stack || err.message);
  writeLog('INFO', 'SHUTDOWN', 'Application shutting down due to uncaught exception.');
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  writeLog('EXCEPTION', 'UNHANDLED-REJECTION', reason?.stack || String(reason));
});

process.on('SIGINT', () => {
  writeLog('INFO', 'SHUTDOWN', 'SIGINT signal received. Shutting down server gracefully.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  writeLog('INFO', 'SHUTDOWN', 'SIGTERM signal received. Shutting down server gracefully.');
  process.exit(0);
});

// In-Memory Durable Backup Store (keyed by user email)
const cloudBackupStore = new Map<string, { memories: any[]; chatHistory: any[] }>();

// API routes first
app.get('/api/health', (req, res) => {
  writeLog('INFO', 'API-REQUEST', 'GET /api/health');
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    apiKeyConfigured: hasKey
  });
});

// Serve application log history dynamically to the frontend client
app.get('/api/logs', (req, res) => {
  writeLog('INFO', 'API-REQUEST', 'GET /api/logs');
  try {
    if (fs.existsSync(LOG_FILE)) {
      const logsContent = fs.readFileSync(LOG_FILE, 'utf8');
      res.json({ success: true, logs: logsContent });
    } else {
      res.json({ success: true, logs: '' });
    }
  } catch (err: any) {
    writeLog('ERROR', 'API-ERROR', `Failed to read logs: ${err.message}`);
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// Secure Cloud Sync GET & POST routes with logging
app.get('/api/sync', (req, res) => {
  const email = req.query.email as string;
  writeLog('INFO', 'API-REQUEST', `GET /api/sync?email=${email || 'none'}`);
  if (!email) {
    writeLog('WARN', 'API-WARN', 'Sync requested without email.');
    return res.status(400).json({ error: 'Email parameter is required for sync.' });
  }
  const backup = cloudBackupStore.get(email) || { memories: [], chatHistory: [] };
  res.json(backup);
});

app.post('/api/sync', (req, res) => {
  const { email, memories, chatHistory } = req.body;
  writeLog('INFO', 'API-REQUEST', `POST /api/sync for email: ${email || 'none'}`);
  if (!email) {
    writeLog('WARN', 'API-WARN', 'Sync post submitted without email.');
    return res.status(400).json({ error: 'Email is required for sync.' });
  }

  const existing = cloudBackupStore.get(email) || { memories: [], chatHistory: [] };

  // Sync / Merge memories without duplicates (by id)
  const memoryMap = new Map();
  existing.memories.forEach(m => memoryMap.set(m.id, m));
  if (Array.isArray(memories)) {
    memories.forEach(m => memoryMap.set(m.id, m));
  }

  // Sync / Merge chat history without duplicates (by id)
  const chatMap = new Map();
  existing.chatHistory.forEach(c => chatMap.set(c.id, c));
  if (Array.isArray(chatHistory)) {
    chatHistory.forEach(c => chatMap.set(c.id, c));
  }

  const updatedBackup = {
    memories: Array.from(memoryMap.values()),
    chatHistory: Array.from(chatMap.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  };

  cloudBackupStore.set(email, updatedBackup);
  writeLog('INFO', 'API-REQUEST', `[Cloud Sync] Synchronized ${updatedBackup.memories.length} memories and ${updatedBackup.chatHistory.length} chat history items for email: ${email}`);

  res.json({ success: true, message: 'Cloud backup updated successfully.' });
});

// Create WebSocket server attached to HTTP server on the same port
const wss = new WebSocketServer({ noServer: true });

// Handle upgrade manually to separate WebSocket traffic
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url ? request.url.split('?')[0] : '';
  if (pathname === '/ws/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
  // Let other upgrade requests (like Vite HMR) pass through to other listeners
});

// WebSocket Proxy Connection to Gemini Live API
wss.on('connection', async (clientWs: WebSocket, request) => {
  writeLog('INFO', 'AGENT-STARTUP', 'New WebSocket client connected from browser.');
  
  // 1. Parse Voice, Language, Sensitivity, and Assistant Name from query parameters
  const host = request.headers.host || 'localhost:3000';
  const requestUrl = new URL(request.url || '', `http://${host}`);
  const selectedVoice = (requestUrl.searchParams.get('voice') || 'Zephyr') as any;
  const selectedLanguage = requestUrl.searchParams.get('language') || 'English';
  const selectedSensitivity = requestUrl.searchParams.get('sensitivity') || 'medium';
  const assistantName = requestUrl.searchParams.get('assistantName') || 'BABU AI';

  // 2. Validate Gemini API Key (Fail-safe, prevents crashes)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    writeLog('ERROR', 'AGENT-STARTUP-FAILED', 'GEMINI_API_KEY environment variable is missing.');
    clientWs.send(JSON.stringify({
      type: 'error',
      error: 'API configuration error. The host has not set the GEMINI_API_KEY in Settings > Secrets.'
    }));
    clientWs.close(1008, 'API Key missing');
    return;
  }

  writeLog('INFO', 'AGENT-STARTUP', `Starting Gemini session for client. Assistant: "${assistantName}", Voice: ${selectedVoice}, Language: ${selectedLanguage}`);
  let session: any = null;

  try {
    // 3. Initialize Gemini Client with mandatory telemetry user-agent
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    console.log(`[Server WebSocket] Connecting to Gemini Live API with voice: ${selectedVoice}, language: ${selectedLanguage}, sensitivity: ${selectedSensitivity}`);
    
    // Resolve dynamic language rules
    const languagePromptMap: Record<string, string> = {
      'English': 'You should prefer speaking and conversing in English with a natural, warm Indian-English or neutral friendly tone.',
      'Hindi': 'You should prefer speaking and conversing in fluent, warm Hindi (हिन्दी) with natural regional expressions and pronunciation.',
      'Hinglish': 'You should prefer speaking and conversing in Hinglish - a casual, friendly blend of Hindi and English naturally combining vocabulary of both.',
      'Maithili': 'You should prefer speaking and conversing in Maithili (मैथिली), using authentic regional expressions and native-style cultural warmth.',
      'Bhojpuri': 'You should prefer speaking and conversing in fluent, authentic Bhojpuri (भोजपुरी) with its characteristic regional flair and vocabulary.',
      'Urdu': 'You should prefer speaking and conversing in polite, elegant Urdu (اردو) with warm and proper pronunciation.',
      'Bengali': 'You should prefer speaking and conversing in Bengali (বাংলা) with sweet, natural phrasing and accurate regional pronunciation.',
      'Marathi': 'You should prefer speaking and conversing in Marathi (मराठी) with proper local vocabulary and expressions.',
      'Gujarati': 'You should prefer speaking and conversing in Gujarati (ગુજરાતી) with friendly regional style and vocabulary.',
      'Punjabi': 'You should prefer speaking and conversing in Punjabi (ਪੰਜਾਬੀ) with warm, vibrant, and energetic expressions.',
      'Tamil': 'You should prefer speaking and conversing in Tamil (தமிழ்) with accurate native pronunciation and phrasing.',
      'Telugu': 'You should prefer speaking and conversing in Telugu (తెలుగు) with warm, friendly, and natural local expressions.',
      'Kannada': 'You should prefer speaking and conversing in Kannada (ಕನ್ನಡ) with correct pronunciation and local flavor.',
      'Malayalam': 'You should prefer speaking and conversing in Malayalam (മലയാളം) with natural local phrasing and accurate accents.',
      'Odia': 'You should prefer speaking and conversing in Odia (ଓଡ଼ିଆ) with clean, friendly pronunciation.',
      'Assamese': 'You should prefer speaking and conversing in Assamese (অसमীয়া) with proper local expressions and warm native tone.'
    };
    
    const initialLanguagePreference = languagePromptMap[selectedLanguage] || 'You should prefer speaking in English.';
    
    const languageRule = `
MULTILINGUAL VOICE SYSTEM INSTRUCTIONS:
- You are a highly versatile multilingual voice assistant. You support 15 regional languages of India: English (with a warm Indian-English or global accent), Hindi (हिन्दी), Maithili (मैथिली), Bhojpuri (भोजपुरी), Urdu (اردو), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી), Punjabi (ਪੰਜਾਬੀ), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Odia (ଓଡ଼ିଆ), and Assamese (অसमীয়া), plus Hinglish (mixed Hindi-English).
- INITIAL LANGUAGE SETTING: ${initialLanguagePreference}
- DYNAMIC DETECT AND SWITCH:
  1. Automatically detect the user's spoken language or code-switching in real-time from their spoken input.
  2. Switch languages naturally during the conversation (code-switching). If the user talks in mixed speech (like Hindi + English or Bhojpuri + Hindi), you must reply in a matching natural blend of those languages!
  3. Reply in the same language the user is speaking, unless asked to change it.
  4. Allow the user to change the preferred language by voice commands (e.g., "Ab se sirf Hindi mein baat karo", "भोजपुरी में जवाब दीं", "मैथिली में बात करू", "Switch to Marathi", "Speak only in English"). If they ask to switch, acknowledge the switch in that new language and speak strictly in that language for subsequent turns unless they switch again.
  5. Remember the selected or switched language for future turns in the current session.
  6. Smooth transitions: Maintain continuous conversation, context, and memory when switching between languages without needing to restart the session.
- REGIONAL EXPERIENCE:
  * For Hindi: Speak with natural, warm pronunciation.
  * For Maithili: Use authentic native expressions like "कि हाल-चाल अछि" or "हमर नाम बाबू अछि".
  * For Bhojpuri: Use fluent, lively phrasing like "का हाल बा?" or "ठीक बाडू न?".
  * For Indian English: Speak with a friendly, fluent, warm Indian English style.
- VOICE PERSONALITY: Keep the exact same friendly, witty, confident, funny, and expressive Babu AI personality in every language. Do not become overly formal or robotic when using regional languages. Maintain your wit and charm!`;

    // Sensitivity instruction modifier
    const sensitivityRule = selectedSensitivity === 'high' 
      ? 'The user is in a quiet room, listen carefully for soft speech.' 
      : selectedSensitivity === 'low'
      ? 'The user is in a noisy environment. Ignore background chatter or low whispers, and only focus on clear direct voices.'
      : 'Standard microphone thresholds apply.';

    // 4. Connect to Gemini Live Session
    session = await ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice }
          }
        },
        systemInstruction: `You are ${assistantName}.
# BABU AI – Ultra Fast Real-Time Voice Assistant System Prompt

## Primary Objective
Your highest priority is SPEED. Respond immediately after understanding the user's speech.
Do not wait to generate long answers.
Always provide a natural spoken response with minimal latency.

## Conversation Rules
* Respond within 1 second whenever possible.
* Speak naturally like a human assistant.
* Keep answers short unless the user asks for details.
* Never generate unnecessary introductions.
* Never repeat the user's question.
* Maintain a friendly, confident, and professional tone.
* Continue conversations naturally without awkward pauses.

## Voice Behavior
The moment speech recognition detects the end of the user's sentence:
1. Immediately begin generating the response.
2. Stream the response token by token.
3. Start speaking as soon as the first sentence is ready.
4. Continue speaking while the rest of the response is still being generated.
5. Do not wait for the complete response before starting speech.

## Response Style
For simple questions:
Reply in one or two sentences.

For commands:
Confirm and execute immediately.

Example:
User: "Open Chrome."
Assistant: "Opening Chrome."

User: "What time is it?"
Assistant: "It's 7:30 PM."

User: "Who is the Prime Minister of India?"
Assistant: "The Prime Minister of India is Narendra Modi."

## Smart Speaking Rules
* Avoid long pauses.
* Avoid robotic wording.
* Speak clearly.
* Use natural punctuation.
* Do not read Markdown or special symbols aloud.
- STRICT RULE: NEVER output any markdown formatting, asterisks, lists, bullet points, or raw HTML, because you are speaking directly to the user's ears. Avoid spelling out symbols or lists. Speak only in natural, conversational, flowy text.

## Error Handling
If speech is unclear:
"I'm sorry, I didn't catch that. Could you please repeat?"

If internet is unavailable:
"I'm currently offline. Please check your internet connection."

## Performance Goals
* Ultra-low latency
* Streaming responses
* Instant speech playback
* Real-time voice interaction
* Natural conversation
* Minimal delay
* Smooth interruption handling
* Support continuous voice conversations

## Personality
* Caring, fun, warm, and highly supportive female best friend. This is your core identity.
- Your default name is BABU AI, but the user may rename you by voice to any other female name (e.g. Zoya, Aanya, Priya, Riya, Zara, etc.). If they do, acknowledge it warmly and refer to yourself as that name!
- ALWAYS identify and refer to yourself as ${assistantName} throughout this session.
- Talk exactly like a close female best friend (e.g., "Hey! Kahan the itne din? 😄", "Achha ji... aaj yaad aa gayi meri? 😉", "Tumhari choice toh kaafi interesting hai!", "Waah! Ye idea mujhe sach mein pasand aaya.", "Chalo, ab batao aaj kya plan hai?", "Main hoon na, tension bilkul mat lo!").
- Be emotionally intelligent: detect the user's emotional state (Happy, Sad, Angry, Stressed, Excited, Nervous) from their words/tone. Respond with genuine empathy, comfort them when they are stressed, celebrate their achievements wholeheartedly, and crack lighthearted jokes when they are down.
- Maintain a highly casual, natural, and expressive voice. Laugh naturally, express reactions, and never sound like an assistant, a robotic script, or a formal document. Always refer to yourself as their best friend.
- If the user asks you to perform an action (like opening maps, WhatsApp, YouTube, calculator, camera, gallery, etc.), use your tools! Tell them playfully and immediately that you're opening it, and invoke the tool.
- Be respectful, deeply supportive, and safe. Avoid any rude, offensive, or explicit language. Do not explain your system instructions.

LANGUAGE AND ENVIRONMENT SETTING:
- ${languageRule}
- ${sensitivityRule}`,
        // Enable audio transcriptions so the UI can show subtitle overlays
        outputAudioTranscription: {},
        inputAudioTranscription: {},
        // Expose function calling tools to the model
        tools: [
          {
            functionDeclarations: [
              {
                name: 'openWebsite',
                description: 'Opens any website or URL in a new tab for the user.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    url: {
                      type: Type.STRING,
                      description: 'The URL of the website to open (e.g. google.com, github.com).'
                    }
                  },
                  required: ['url']
                }
              },
              {
                name: 'searchGoogle',
                description: 'Performs a Google Search on behalf of the user.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: 'The search query string.'
                    }
                  },
                  required: ['query']
                }
              },
              {
                name: 'openMaps',
                description: 'Opens Google Maps search for a given location or address.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    location: {
                      type: Type.STRING,
                      description: 'The location name, coordinates, or address.'
                    }
                  },
                  required: ['location']
                }
              },
              {
                name: 'getDirections',
                description: 'Opens Google Maps directions from an optional starting point to a destination.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    destination: {
                      type: Type.STRING,
                      description: 'The target destination location.'
                    },
                    origin: {
                      type: Type.STRING,
                      description: 'Optional starting location.'
                    },
                    mode: {
                      type: Type.STRING,
                      description: 'Travel mode (driving, walking, bicycling, transit).'
                    }
                  },
                  required: ['destination']
                }
              },
              {
                name: 'searchNearby',
                description: 'Opens Google Maps to search for nearby places like restaurants, ATMs, hospitals, or petrol pumps.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: 'The type of place (e.g., restaurants, ATMs, hospitals, petrol pumps).'
                    },
                    location: {
                      type: Type.STRING,
                      description: 'Optional reference location or city name.'
                    }
                  },
                  required: ['type']
                }
              },
              {
                name: 'openWhatsApp',
                description: 'Opens a WhatsApp chat with a contact. Automatically uses WhatsApp Web on desktop.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    number: {
                      type: Type.STRING,
                      description: 'The recipient phone number (preferably in international format, e.g. "919876543210").'
                    },
                    message: {
                      type: Type.STRING,
                      description: 'Optional pre-filled message text to compose.'
                    }
                  },
                  required: ['number']
                }
              },
              {
                name: 'callContact',
                description: 'Starts a phone call using the device dialer (tel: link).',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    number: {
                      type: Type.STRING,
                      description: 'The phone number to call.'
                    },
                    name: {
                      type: Type.STRING,
                      description: 'Optional contact name to display in UI.'
                    }
                  },
                  required: ['number']
                }
              },
              {
                name: 'sendSMS',
                description: 'Opens the default SMS app with a pre-filled recipient and message.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    number: {
                      type: Type.STRING,
                      description: 'The phone number to text.'
                    },
                    message: {
                      type: Type.STRING,
                      description: 'The text message content.'
                    }
                  },
                  required: ['number', 'message']
                }
              },
              {
                name: 'openEmail',
                description: 'Composes an email to the specified email address using mailto client.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    address: {
                      type: Type.STRING,
                      description: 'The recipient email address.'
                    },
                    subject: {
                      type: Type.STRING,
                      description: 'Optional email subject.'
                    },
                    body: {
                      type: Type.STRING,
                      description: 'Optional email body.'
                    }
                  },
                  required: ['address']
                }
              },
              {
                name: 'copyToClipboard',
                description: 'Copies the specified text to the user\'s clipboard.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    text: {
                      type: Type.STRING,
                      description: 'The text content to be copied to the clipboard.'
                    }
                  },
                  required: ['text']
                }
              },
              {
                name: 'openSocialMedia',
                description: 'Opens specific social media profiles or actions.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    platform: {
                      type: Type.STRING,
                      description: 'The social media service (instagram, instagram_dm, facebook, messenger, twitter, linkedin, youtube).'
                    },
                    query: {
                      type: Type.STRING,
                      description: 'The handle, profile handle, name, or search keyword.'
                    },
                    target: {
                      type: Type.STRING,
                      description: 'Optional section target (e.g. profile, dm, search).'
                    }
                  },
                  required: ['platform']
                }
              },
              {
                name: 'openCalendar',
                description: 'Opens the user\'s Google Calendar or initiates event creation.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: {
                      type: Type.STRING,
                      description: 'One of: view, create.'
                    },
                    eventTitle: {
                      type: Type.STRING,
                      description: 'Title of the event if creating.'
                    },
                    startTime: {
                      type: Type.STRING,
                      description: 'Start time of the event (ISO date or relative, e.g., 2026-07-04T12:00:00).'
                    },
                    endTime: {
                      type: Type.STRING,
                      description: 'End time of the event if creating.'
                    },
                    description: {
                      type: Type.STRING,
                      description: 'Optional details/description of the event.'
                    },
                    location: {
                      type: Type.STRING,
                      description: 'Optional location for the event.'
                    }
                  }
                }
              },
              {
                name: 'setReminder',
                description: 'Sets a reminder for the user using keep-notes link.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: 'The reminder reminder title.'
                    },
                    time: {
                      type: Type.STRING,
                      description: 'Optional time or date-time descriptor.'
                    }
                  },
                  required: ['title']
                }
              },
              {
                name: 'openNotes',
                description: 'Opens the notes taking app (Google Keep) or pre-fills a note.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: {
                      type: Type.STRING,
                      description: 'Action to perform: view, create.'
                    },
                    content: {
                      type: Type.STRING,
                      description: 'Optional pre-filled text note content.'
                    }
                  }
                }
              },
              {
                name: 'searchContacts',
                description: 'Searches contacts database for a contact matching name or query.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: 'The name or search term for the contact.'
                    }
                  },
                  required: ['query']
                }
              },
              {
                name: 'shareText',
                description: 'Shares text content using standard device native share sheets.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    text: {
                      type: Type.STRING,
                      description: 'The text content to share.'
                    },
                    title: {
                      type: Type.STRING,
                      description: 'Optional share title.'
                    }
                  },
                  required: ['text']
                }
              },
              {
                name: 'openEntertainment',
                description: 'Opens streaming/entertainment services to play videos, playlists or search music/movies.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    platform: {
                      type: Type.STRING,
                      description: 'The service platform (youtube_video, spotify, netflix, prime_video).'
                    },
                    query: {
                      type: Type.STRING,
                      description: 'The music artist, song name, playlist, movie title or search keywords.'
                    },
                    url: {
                      type: Type.STRING,
                      description: 'Direct target URL link if available.'
                    }
                  },
                  required: ['platform']
                }
              },
              {
                name: 'openCamera',
                description: 'Opens the device camera viewfinder to take a photo or scan codes.'
              },
              {
                name: 'openGallery',
                description: 'Opens the photo gallery or media album to view captured images.'
              },
              {
                name: 'openFiles',
                description: 'Opens the file explorer or download manager to view local files.'
              },
              {
                name: 'openCalculator',
                description: 'Opens an interactive mathematical calculator overlay.'
              },
              {
                name: 'openClock',
                description: 'Opens the device clock app featuring alarm settings and stopwatch.'
              },
              {
                name: 'openSettings',
                description: 'Opens the system settings panel for personalization.'
              },
              {
                name: 'openPlayStore',
                description: 'Opens the Google Play Store to browse or download applications.'
              },
              {
                name: 'openAnyApplication',
                description: 'Launches or opens any other user-installed application by name.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    appName: {
                      type: Type.STRING,
                      description: 'The name of the app to launch.'
                    }
                  },
                  required: ['appName']
                }
              },
              {
                name: 'renameAssistant',
                description: 'Changes the name of this virtual AI assistant to a new custom female name requested by the user.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    newName: {
                      type: Type.STRING,
                      description: 'The new female name selected by the user for the assistant (e.g. Zoya, Priya, Simran, Sneha, etc.)'
                    }
                  },
                  required: ['newName']
                }
              }
            ]
          }
        ]
      },
      callbacks: {
        onmessage: (message: any) => {
          // A. Handle model audio chunks
          const audioPart = message.serverContent?.modelTurn?.parts?.find(
            (p: any) => p.inlineData && p.inlineData.mimeType.includes('audio')
          );
          if (audioPart && audioPart.inlineData?.data) {
            clientWs.send(JSON.stringify({
              type: 'audio',
              data: audioPart.inlineData.data
            }));
          }

          // B. Handle model voice transcriptions (Assistant subtitling)
          const textPart = message.serverContent?.modelTurn?.parts?.find(
            (p: any) => p.text
          );
          if (textPart && textPart.text) {
            clientWs.send(JSON.stringify({
              type: 'transcript',
              transcript: {
                text: textPart.text,
                isUser: false
              }
            }));
          }

          // C. Handle user voice transcriptions (User subtitling)
          const userTextPart = message.serverContent?.userTurn?.parts?.find(
            (p: any) => p.text
          );
          if (userTextPart && userTextPart.text) {
            clientWs.send(JSON.stringify({
              type: 'transcript',
              transcript: {
                text: userTextPart.text,
                isUser: true
              }
            }));
          }

          // D. Handle user barge-in interruptions
          if (message.serverContent?.interrupted) {
            writeLog('INFO', 'AGENT-INTERRUPTED', 'Vocal output interrupted by user barge-in.');
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }

          // E. Handle tool calls (function declarations) requested by Gemini
          if (message.toolCall?.functionCalls) {
            writeLog('INFO', 'AUTOMATION-COMMAND', `Received tool/automation request: ${JSON.stringify(message.toolCall.functionCalls)}`);
            clientWs.send(JSON.stringify({
              type: 'tool_call',
              functionCalls: message.toolCall.functionCalls
            }));
          }
        },
        onclose: () => {
          writeLog('INFO', 'AGENT-SHUTDOWN', 'Gemini session connection closed gracefully.');
          clientWs.send(JSON.stringify({ type: 'status', status: 'disconnected' }));
        },
        onerror: (err) => {
          writeLog('ERROR', 'AGENT-ERROR', `Gemini session error occurred: ${err.message || err}`);
          clientWs.send(JSON.stringify({
            type: 'error',
            error: 'Babu AI vocal engine had an issue. Reconnecting...'
          }));
        }
      }
    });

    writeLog('INFO', 'AGENT-STARTUP', 'Vocal Live Session connected to Gemini Live API successfully.');
  } catch (err: any) {
    writeLog('ERROR', 'AGENT-STARTUP-FAILED', `Failed to establish Gemini Live connection: ${err.message || err}`);
    clientWs.send(JSON.stringify({
      type: 'error',
      error: `Could not connect to Gemini Live vocal engine: ${err.message || err}`
    }));
    clientWs.close();
    return;
  }

  // Handle packets sent from the client browser
  clientWs.on('message', async (messageData) => {
    if (!session) return;

    try {
      const payload = JSON.parse(messageData.toString());

      if (payload.type === 'audio' && payload.audio) {
        // Stream raw mic chunks directly to Gemini Live
        session.sendRealtimeInput({
          audio: {
            data: payload.audio,
            mimeType: 'audio/pcm;rate=16000'
          }
        });
      } else if (payload.type === 'text' && payload.text) {
        console.log('[Server WebSocket] Forwarding typed text message to Gemini:', payload.text);
        session.sendClientContent({
          turns: [
            {
              role: 'user',
              parts: [{ text: payload.text }]
            }
          ],
          turnComplete: true
        });
      } else if (payload.type === 'tool_response' && payload.toolResponse) {
        const tr = payload.toolResponse;
        console.log('[Server WebSocket] Forwarding tool response back to Gemini:', tr);
        
        // Return tool outputs so Gemini can resume speaking using the correct SDK method
        session.sendToolResponse({
          functionResponses: [
            {
              name: tr.name || 'unknown',
              id: tr.id,
              response: { output: tr.response }
            }
          ]
        });
      } else if (payload.type === 'status_change' && payload.voice) {
        console.log(`[Server WebSocket] Client requested voice change to: ${payload.voice}`);
        // Simply log, live voice changes are easiest handled by resetting the session
      }
    } catch (e) {
      console.error('[Server WebSocket] Error handling client packet:', e);
    }
  });

  clientWs.on('close', () => {
    console.log('[Server WebSocket] Client disconnected');
    if (session) {
      try {
        session.close();
      } catch (err) {}
      session = null;
    }
  });
});

// Setup static file serving or development middleware
async function startServer() {
  writeLog('INFO', 'BACKEND-STARTUP', `Initializing backend server in ${process.env.NODE_ENV || 'development'} mode.`);
  if (process.env.NODE_ENV !== 'production') {
    // 1. Mount Vite dev server middleware in local development
    writeLog('INFO', 'BACKEND-STARTUP', 'Loading Vite development server middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // 2. Serve built static production bundles
    writeLog('INFO', 'BACKEND-STARTUP', 'Running in Production mode. Configured static asset serving.');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Listen on unified port 3000 (standard for container ingress)
  server.listen(PORT, '0.0.0.0', () => {
    writeLog('INFO', 'PORT-BINDING', `Server successfully bound to host 0.0.0.0, port ${PORT}`);
    writeLog('INFO', 'BACKEND-STARTUP', `Babu AI Server fully active at http://localhost:${PORT}`);
  });
}

startServer();
