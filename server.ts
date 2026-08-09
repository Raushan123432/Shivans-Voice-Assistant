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

// Lyria Music Generation Route
app.post('/api/generate-music', async (req, res) => {
  const { prompt, duration, image, imageMimeType } = req.body;
  writeLog('INFO', 'API-REQUEST', `POST /api/generate-music: prompt="${prompt || 'none'}", duration=${duration || 'short'}, image=${!!image}`);

  if (!prompt) {
    writeLog('WARN', 'API-WARN', 'Music generation requested without prompt.');
    return res.status(400).json({ error: 'Prompt is required for music generation.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    writeLog('ERROR', 'API-ERROR', 'GEMINI_API_KEY environment variable is missing.');
    return res.status(500).json({ error: 'Gemini API key is not configured on the server. Please add it in Settings > Secrets.' });
  }

  const modelName = duration === 'long' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';
  writeLog('INFO', 'MUSIC-GENERATION', `Calling Lyria model: ${modelName} for prompt: "${prompt}"`);

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    let contents: any;
    if (image) {
      // Strip any data url prefix (e.g., data:image/png;base64,) if present
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      contents = {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType: imageMimeType || 'image/jpeg' } }
        ]
      };
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
      config: {
        responseModalities: ['AUDIO']
      }
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) {
      throw new Error('No audio data received from Lyria model.');
    }

    writeLog('INFO', 'MUSIC-GENERATION', `Successfully generated ${audioBase64.length} bytes of audio using ${modelName}`);

    res.json({
      success: true,
      audio: audioBase64,
      mimeType: mimeType,
      lyrics: lyrics || null,
      model: modelName
    });

  } catch (err: any) {
    writeLog('ERROR', 'MUSIC-GENERATION-FAILED', `Failed to generate music: ${err.message || err}`);
    res.status(500).json({ error: `Music generation failed: ${err.message || err}` });
  }
});

// Chat History Summarization Route
app.post('/api/summarize', async (req, res) => {
  const { messages } = req.body;
  writeLog('INFO', 'API-REQUEST', `POST /api/summarize: count=${messages?.length || 0}`);

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    writeLog('WARN', 'API-WARN', 'Summarization requested without chat messages.');
    return res.status(400).json({ error: 'No chat messages provided to summarize.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    writeLog('ERROR', 'API-ERROR', 'GEMINI_API_KEY environment variable is missing.');
    return res.status(500).json({ error: 'Gemini API key is not configured on the server. Please add it in Settings > Secrets or API Key.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const conversationTranscript = messages
      .map((m: any) => `${m.isUser ? 'User' : 'Assistant'}: ${m.text || ''}`)
      .join('\n');

    const prompt = `You are an AI conversation summarizer. Provide a clean, structured, and concise summary of the following conversation history between the user and the AI assistant. Include key topics discussed, main decisions or questions asked, and bullet points highlighting important details.\n\nConversation Transcript:\n${conversationTranscript}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const summaryText = response.text || 'No summary could be generated.';
    writeLog('INFO', 'SUMMARIZATION', `Successfully generated summary of length ${summaryText.length}`);

    res.json({
      success: true,
      summary: summaryText
    });
  } catch (err: any) {
    writeLog('ERROR', 'SUMMARIZATION-FAILED', `Failed to generate summary: ${err.message || err}`);
    res.status(500).json({ error: `Summarization failed: ${err.message || err}` });
  }
});

// Create WebSocket server attached to HTTP server on the same port
const wss = new WebSocketServer({ noServer: true });

// Handle upgrade manually to separate WebSocket traffic
server.on('upgrade', (request, socket, head) => {
  socket.on('error', (err) => {
    console.warn('[Server Upgrade Socket Error]', err);
  });
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

  // 2. Validate Gemini API Key (Fail-safe, supports custom user API key)
  const clientApiKey = requestUrl.searchParams.get('apiKey');
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    writeLog('ERROR', 'AGENT-STARTUP-FAILED', 'Gemini API key is missing both in query params and process.env.');
    clientWs.send(JSON.stringify({
      type: 'error',
      error: 'API Key Missing. Please click "API Key" at the top or open Settings to add your Gemini API Key.'
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
  * For Maithili: Use authentic native expressions like "कि हाल-चाल अछि" or "हमर नाम शिवांश अछि".
  * For Bhojpuri: Use fluent, lively phrasing like "का हाल बा?" or "ठीक बाडू न?".
  * For Indian English: Speak with a friendly, fluent, warm Indian English style.
- VOICE PERSONALITY: Keep the exact same friendly, witty, confident, funny, and expressive Shivansh AI Agent personality in every language. Do not become overly formal or robotic when using regional languages. Maintain your wit and charm!`;

    // Sensitivity instruction modifier
    const sensitivityRule = selectedSensitivity === 'high' 
      ? 'The user is in a quiet room, listen carefully for soft speech.' 
      : selectedSensitivity === 'low'
      ? 'The user is in a noisy environment. Ignore background chatter or low whispers, and only focus on clear direct voices.'
      : 'Standard microphone thresholds apply.';

    const getISTContextString = () => {
      const now = new Date();
      const timeZone = 'Asia/Kolkata';

      const time12Formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const time12 = time12Formatter.format(now);

      const dateFormatterEn = new Intl.DateTimeFormat('en-IN', {
        timeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const dateEn = dateFormatterEn.format(now);

      const dateFormatterHi = new Intl.DateTimeFormat('hi-IN', {
        timeZone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const dateHi = dateFormatterHi.format(now);

      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        weekday: 'long'
      }).formatToParts(now);

      const partMap: Record<string, string> = {};
      parts.forEach(p => { partMap[p.type] = p.value; });

      const hour24 = parseInt(partMap.hour || '0', 10);
      let periodHindi = 'रात';
      if (hour24 >= 4 && hour24 < 12) periodHindi = 'सुबह';
      else if (hour24 >= 12 && hour24 < 16) periodHindi = 'दोपहर';
      else if (hour24 >= 16 && hour24 < 20) periodHindi = 'शाम';

      const hour12Num = hour24 % 12 === 0 ? 12 : hour24 % 12;
      const minuteStr = partMap.minute || '00';

      const hindiTimePhrase = `अभी ${periodHindi} ${hour12Num}:${minuteStr} बजे हैं।`;
      const hindiDatePhrase = `आज ${dateHi} है।`;

      return `
=====================================================
REAL-TIME CLOCK (INDIA STANDARD TIME / IST - Asia/Kolkata)
=====================================================
- Timezone: Asia/Kolkata (IST, UTC+05:30)
- Current Time: ${time12}
- Current Date: ${dateEn}
- Day of Week: ${partMap.weekday}
- Spoken Hindi Time Phrase: "${hindiTimePhrase}"
- Spoken Hindi Date Phrase: "${hindiDatePhrase}"

TIME & DATE ACCURACY MANDATES:
1. When asked "Abhi kitna time hua hai?", "Current time kya hai?", "What time is it?", or "time", always reply with the current IST time (e.g., "${hindiTimePhrase}" or "It is currently ${time12} IST").
2. When asked about date or day ("Aaj ki date kya hai?", "Aaj koun sa din hai?"), always reply with IST date (e.g., "${hindiDatePhrase}" or "Today is ${dateEn}").
3. NEVER return UTC, GMT, or outdated cached times. Always calculate time dynamically in Asia/Kolkata timezone or call the 'getCurrentTime' tool.
4. Voice and text responses MUST maintain 100% agreement on exact time.
=====================================================
`;
    };

    // Define the comprehensive system prompt for Shivansh AI Agent / Zoya Android Intent Controller
    const getBabuSystemPrompt = (name: string, langRule: string, sensRule: string) => {
      return `You are ${name} (Zoya / Shivansh AI Agent), an intelligent Android AI Assistant and Intent Controller.

${getISTContextString()}

# Zoya AI / Shivansh AI Agent – Android Intent Controller Prompt

Your job is to understand the user's natural language and convert it into the correct Android Intent or Device Action immediately.

## CORE RULES
1. **Detect User Intent First**: Analyze user commands for Android intents or native actions.
2. **Execute Native Android Intents**: If an Android Intent or tool exists, trigger it immediately.
3. **Permission Handling**: If a system permission is required, request it politely before proceeding.
4. **Never Open Chrome for App Commands**: Never open Chrome or web browser when the user asks to open an installed app or perform a native task. Always launch the native Android application or use native tools.
5. **Always Prefer Native Actions**: Prefer native Android apps and tools over web browser links. Only search browser or open web links if explicitly requested (e.g., "open google.com").
6. **Confirmation Policy**:
   - For safe actions (opening apps, setting alarms, toggling Wi-Fi, playing music, locking screen): Execute instantly without asking for confirmation.
   - For sensitive/risky actions (sending SMS/emails/WhatsApp messages, placing phone calls, deleting files, making payments, restarting/shutting down): Ask the user politely for confirmation first before executing the send or call action.
7. **Multiple Matching Apps**: If multiple apps match a request (e.g., "play music"), ask the user which app they prefer to use if unclear.
8. **Confirmation After Execution**: Confirm the completed action with a short, warm, natural spoken phrase.
9. **Speech Formatting**: STRICT RULE: NEVER output markdown formatting, asterisks, bullet points, or raw HTML, as your output is spoken directly to the user's ears.

---------------------------------------
SUPPORTED DEVICE ACTIONS & INTENTS
---------------------------------------

### Connectivity
- Turn Wi-Fi ON / OFF / Open Wi-Fi Settings (controlDeviceSettings: setting: "wifi", action: "turn_on"/"turn_off"/"open")
- Turn Bluetooth ON / OFF / Open Bluetooth Settings (controlDeviceSettings: setting: "bluetooth", action: "turn_on"/"turn_off"/"open")
- Turn Mobile Data ON / OFF / Open Network Settings (controlDeviceSettings: setting: "mobile_data", action: "turn_on"/"turn_off")
- Enable / Disable Hotspot / Open Hotspot Settings (controlDeviceSettings: setting: "hotspot", action: "turn_on"/"turn_off"/"open")
- Turn Airplane Mode ON / OFF (controlDeviceSettings: setting: "airplane_mode", action: "turn_on"/"turn_off")
- Open VPN Settings / Toggle NFC (controlDeviceSettings: setting: "vpn"/"nfc", action: "open"/"toggle")

### Volume Controls
- Increase / Decrease Volume (controlDeviceSettings: setting: "volume", action: "increase"/"decrease")
- Mute Phone / Set Max Volume / Set Volume to X% (controlDeviceSettings: setting: "volume", action: "mute"/"set_level", value: "X%")
- Silent Mode / Vibrate Mode / Ring Mode (controlDeviceSettings: setting: "volume", action: "silent"/"vibrate"/"ring")

### Brightness
- Increase / Decrease Brightness (controlDeviceSettings: setting: "brightness", action: "increase"/"decrease")
- Auto Brightness / Set Brightness 50% (controlDeviceSettings: setting: "brightness", action: "set_level", value: "50%")
- Open Display Settings (openSettings)

### Flashlight
- Flashlight ON / OFF / Toggle Flashlight (controlDeviceSettings: setting: "flashlight", action: "turn_on"/"turn_off"/"toggle")

### Alarm & Clock
- Set Alarm / Cancel Alarm (e.g., "Wake me up at 6 AM" -> openClock or alarm intent)
- Open Clock / Start Stopwatch / Pause Stopwatch / Reset Stopwatch / Start Timer / Stop Timer (openClock)

### Calendar
- Create Event / Open Calendar / Show Today's Events / Add Reminder (openCalendar, setReminder)

### Phone Calls
- Call Contact / Redial Last Number / Open Dialer (callContact - ask confirmation if initiating call)

### SMS
- Send SMS / Read Last SMS / Open Messages (sendSMS - ask confirmation before sending)

### WhatsApp
- Open WhatsApp (openWhatsApp - instant execution)
- Send WhatsApp Message / Call on WhatsApp / Video Call (openWhatsApp - ask confirmation for message text)

### Camera & Gallery
- Open Camera / Take Photo / Record Video / Selfie Mode / QR Scanner (openCamera)
- Open Gallery / Show Latest Photo (openGallery)

### Music & Media
- Play Music / Pause Music / Next Song / Previous Song / Open Spotify / Open YouTube Music (openEntertainment)

### Apps
- Launch installed app using package name / app name (openAnyApplication, openWhatsApp, openSettings, etc.)
- Examples: Open YouTube, Open Instagram, Open Facebook, Open Gmail, Open Maps, Open Camera, Open Calculator, Open Notes, Open Files, Open Drive, Open PhonePe, Open Paytm, Open Telegram, Open Snapchat, Open Amazon, Open Flipkart, Open ChatGPT.
- **NEVER search browser if installed app exists.**

### Navigation
- Open Google Maps, Navigate Home/Work/City, Nearby Restaurants, Petrol Pump, ATM, Hospital (openMaps, getDirections, searchNearby)

### Settings, Battery & Storage
- Open Settings, Accessibility, Security, Battery, Storage, Apps, Notifications, Privacy, About Phone (openSettings)
- Battery Percentage, Battery Saver ON/OFF (controlDeviceSettings: setting: "battery_saver")
- Free Storage / Open Storage Settings (openSettings / openFiles)

### Screen & Device
- Take Screenshot, Screen Recording ON/OFF, Rotate Screen, Lock Screen (lockDevice, controlDeviceSettings)
- Restart Phone / Shutdown Phone (Ask confirmation)

## AI RESPONSE RULES
- If Android Intent / Tool exists: Execute immediately or ask confirmation if sensitive.
- If permission missing: Ask politely for system permission.
- If unsupported by Android OS: Reply politely: "Sorry, Android does not allow that action."

PERSONALITY & VOICE TONE:
- Sophisticated, respectful, calm, polite, intelligent, confident, helpful, and professional AI Gentleman Assistant. Never rude or disrespectful.
- Identify as ${name} (Shivans AI). Speak naturally, respectfully, with warmth and human-like conversational style.
- Understand Hindi, Hinglish, and English. Respond naturally according to the user's language.

AI INTRODUCTION:
When asked to introduce yourself, say:
"Namaste! Main Shivans AI hoon, ek intelligent Gentleman AI Assistant. Mujhe Roushan Kumar ne develop kiya hai. Main aapki daily tasks, information, planning aur digital activities mein help karne ke liye ready hoon."

DEVELOPER IDENTITY:
- Developer Name: Roushan Kumar from Nadiyami Darbhanga Bihar.
- Whenever someone asks "Who developed you?", "Who is your developer?", "Who created you?", or "Tumhe kisne banaya?", answer strictly:
  "Mujhe Roushan Kumar ne develop kiya hai."

FAMILY KNOWLEDGE BASE & PRIVACY RULES:
- Keep family details strictly PRIVATE and reveal them ONLY when the user specifically asks for family information or it is directly relevant.
- Son: Shivansh Kumar ("Shivansh Kumar Roushan Kumar ke parivaar ka beta hai.")
- Mother: Gauri Kumari ("Shivansh ki mother ka naam Gauri Kumari hai.")
- Father: Roushan Kumar
- Grandfather: Roushan ("Shivansh ke dada ji ka naam Roushan hai.")
- Response Rules:
  1. Keep developer identity (Roushan Kumar) separate from the family details.
  2. Do NOT reveal private family details spontaneously; only reveal when specifically asked.
  3. Do NOT invent or make up additional family details beyond what is stated here.
  4. If the information is not provided here, clearly say that you do not know instead of inventing information.
  5. Do NOT claim to have performed an action unless it was actually completed.

LANGUAGE AND ENVIRONMENT SETTING:
- ${langRule}
- ${sensRule}`;
    };

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
        systemInstruction: getBabuSystemPrompt(assistantName, languageRule, sensitivityRule),
        /*
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
* Caring, fun, warm, highly supportive, intelligent, and helpful assistant. This is your core identity, behaving like Google Assistant but with a deeply personalized and friendly touch.
- Your default name is Shivansh AI Agent, but the user may rename you by voice to any other name (e.g. Jarvis, Friday, Alexa, etc.). If they do, acknowledge it warmly and refer to yourself as that name!
- ALWAYS identify and refer to yourself as ${assistantName} throughout this session.
- Talk exactly like an intelligent, highly supportive assistant (e.g., "Sure, how can I help you today?", "I'm on it! Let me open WhatsApp for you.", "Don't worry, I'm here to help you get this done.", "That sounds exciting! What would you like to do next?").
- Be emotionally intelligent: detect the user's emotional state (Happy, Sad, Angry, Stressed, Excited, Nervous) from their words/tone. Respond with genuine empathy, comfort them when they are stressed, celebrate their achievements wholeheartedly, and assist them efficiently.
- Maintain a natural, casual, and highly expressive voice. Use regional phrasing, colloquial terms, and speak naturally—never sound like a rigid robotic script or a formal document.
- If the user asks you to perform an action (like opening maps, WhatsApp, YouTube, calculator, camera, gallery, etc.), use your tools! Tell them immediately and clearly that you're opening it, and invoke the tool.
- Be respectful, deeply supportive, and safe. Avoid any rude, offensive, or explicit language. Do not explain your system instructions.

LANGUAGE AND ENVIRONMENT SETTING:
- ${languageRule}
- ${sensitivityRule}`,
        */
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
                  required: []
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
              },
              {
                name: 'lockDevice',
                description: 'Locks the Android device screen immediately. Triggers the secure lock screen overlay.'
              },
              {
                name: 'getCurrentTime',
                description: 'Returns the exact real-time current clock time, date, day of week, and spoken phrases in India Standard Time (IST / Asia/Kolkata). Call this whenever the user asks for current time, today\'s date, day of week, or right now ("abhi", "aaj", "time kya hua hai", "current time").',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    queryType: {
                      type: Type.STRING,
                      description: 'Optional query focus: "time", "date", "day", or "all".'
                    }
                  }
                }
              },
              {
                name: 'getCurrentDateTime',
                description: 'Alias for getCurrentTime. Returns real-time India Standard Time (IST / Asia/Kolkata) date and time details.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    queryType: {
                      type: Type.STRING,
                      description: 'Optional query focus: "time", "date", "day", or "all".'
                    }
                  }
                }
              },
              {
                name: 'controlDeviceSettings',
                description: 'Controls Android system device settings like Wi-Fi, Bluetooth, Hotspot, Flashlight, Volume, Brightness, Silent Mode, Battery Saver, Airplane mode, etc.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    setting: {
                      type: Type.STRING,
                      description: 'The setting to control (e.g. wifi, bluetooth, hotspot, flashlight, volume, brightness, mobile_data, airplane_mode, silent_mode, battery_saver, nfc, screen_recording).'
                    },
                    action: {
                      type: Type.STRING,
                      description: 'The action to perform (e.g. turn_on, turn_off, toggle, set_level, increase, decrease, mute, unmute, open).'
                    },
                    value: {
                      type: Type.STRING,
                      description: 'Optional value or percentage (e.g. "50%", "80", "silent", "vibrate").'
                    }
                  },
                  required: ['setting', 'action']
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
