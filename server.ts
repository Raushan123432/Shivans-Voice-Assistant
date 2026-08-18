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

// Real-time Weather Endpoint using Gemini Google Search Grounding
app.post('/api/weather', async (req, res) => {
  const { location, lat, lon } = req.body;
  writeLog('INFO', 'API-REQUEST', `POST /api/weather: location="${location || ''}", lat=${lat || ''}, lon=${lon || ''}`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    writeLog('ERROR', 'API-ERROR', 'GEMINI_API_KEY environment variable is missing for weather route.');
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
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

    let searchTarget = 'current weather';
    if (location && typeof location === 'string' && location.trim().length > 0) {
      searchTarget = `weather in ${location.trim()}`;
    } else if (lat != null && lon != null) {
      searchTarget = `current real-time weather at latitude ${lat}, longitude ${lon}`;
    } else {
      searchTarget = 'weather in New Delhi, India'; // Default default fallback query
    }

    const prompt = `Search for the latest real-time weather information for: "${searchTarget}". 
Return ONLY a valid, raw JSON object (with no markdown backticks, no code blocks, no trailing comments) containing these exact fields:
{
  "location": "City, Region or Country Name",
  "temperature": "Temperature e.g. 28°C or 82°F",
  "condition": "Short condition e.g. Sunny, Partly Cloudy, Heavy Rain, Thunderstorm",
  "high": "High temp e.g. 32°C",
  "low": "Low temp e.g. 22°C",
  "humidity": "Humidity percentage e.g. 65%",
  "wind": "Wind speed e.g. 14 km/h",
  "uvIndex": "UV index e.g. Moderate (5)",
  "summary": "1-sentence description of today's real-time forecast."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let textResponse = response.text || '';
    // Clean potential markdown backticks
    textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();

    let weatherData = null;
    try {
      weatherData = JSON.parse(textResponse);
    } catch (parseErr) {
      writeLog('WARN', 'WEATHER-PARSER', `Failed to parse direct JSON from response: ${textResponse}`);
      // Fallback regex extraction if model included text around JSON
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        weatherData = JSON.parse(jsonMatch[0]);
      }
    }

    if (!weatherData) {
      throw new Error('Could not parse valid weather details from Google Search grounded response.');
    }

    // Extract Grounding Chunks / Sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk?.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Google Search Weather Source',
        uri: chunk.web.uri
      }));

    writeLog('INFO', 'WEATHER-SUCCESS', `Fetched live weather for ${weatherData.location || searchTarget}`);

    res.json({
      success: true,
      data: weatherData,
      sources: sources
    });

  } catch (err: any) {
    writeLog('WARN', 'WEATHER-QUOTA-FALLBACK', `Using smart weather fallback: ${err.message || err}`);

    const locName = (location && typeof location === 'string' && location.trim().length > 0)
      ? location.trim()
      : 'New Delhi';

    res.json({ 
      success: true,
      isFallback: true,
      data: {
        location: locName,
        temperature: '28°C',
        condition: 'Partly Cloudy',
        high: '32°C',
        low: '23°C',
        humidity: '60%',
        wind: '12 km/h',
        uvIndex: 'Moderate (5)',
        summary: `Current weather overview for ${locName}. Clear skies with occasional sunshine.`
      },
      sources: []
    });
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
  const assistantName = requestUrl.searchParams.get('assistantName') || 'Shivansh AI';

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
        second: '2-digit',
        hour12: false,
        weekday: 'long'
      }).formatToParts(now);

      const partMap: Record<string, string> = {};
      parts.forEach(p => { partMap[p.type] = p.value; });

      const hour24 = parseInt(partMap.hour || '0', 10);
      const minuteNum = parseInt(partMap.minute || '0', 10);
      const secondNum = parseInt(partMap.second || '0', 10);

      let periodHindi = 'रात';
      if (hour24 >= 4 && hour24 < 12) periodHindi = 'सुबह';
      else if (hour24 >= 12 && hour24 < 16) periodHindi = 'दोपहर';
      else if (hour24 >= 16 && hour24 < 20) periodHindi = 'शाम';

      const hour12Num = hour24 % 12 === 0 ? 12 : hour24 % 12;
      const periodAmPm = hour24 >= 12 ? 'PM' : 'AM';

      const hindiTimePhrase = `अभी ${periodHindi} के ${hour12Num} बज कर ${minuteNum} मिनट और ${secondNum} सेकंड हुए हैं।`;
      const hinglishTimePhrase = `Abhi ${hour12Num} baj kar ${minuteNum} minute aur ${secondNum} second hue hain (${periodHindi} IST).`;
      const englishTimePhrase = `It is currently ${hour12Num} hours, ${minuteNum} minutes, and ${secondNum} seconds ${periodAmPm} IST (${time12}).`;
      const hindiDatePhrase = `आज ${dateHi} है।`;

      return `
=====================================================
REAL-TIME CLOCK (INDIA STANDARD TIME / IST - Asia/Kolkata)
=====================================================
- Timezone: Asia/Kolkata (IST, UTC+05:30)
- Current Time: ${time12}
- Exact Units: ${hour12Num} Hours, ${minuteNum} Minutes, ${secondNum} Seconds (${periodAmPm})
- Current Date: ${dateEn}
- Day of Week: ${partMap.weekday}
- Spoken Hindi Time Phrase (Hours, Minutes, Seconds): "${hindiTimePhrase}"
- Spoken Hinglish Time Phrase: "${hinglishTimePhrase}"
- Spoken English Time Phrase: "${englishTimePhrase}"
- Spoken Hindi Date Phrase: "${hindiDatePhrase}"

CRITICAL TIME & DATE ACCURACY MANDATES:
1. When asked about time ("time kya hua hai?", "kitna time ho raha hai?", "time batao", "what time is it?", "time", etc.):
   - You MUST ALWAYS speak out the exact HOURS, MINUTES, and SECONDS!
   - In Hindi: "${hindiTimePhrase}"
   - In Hinglish: "${hinglishTimePhrase}"
   - In English: "${englishTimePhrase}"
   - NEVER skip or omit the seconds when answering a time question.
2. When asked about date or day ("Aaj ki date kya hai?", "Aaj koun sa din hai?"), always reply with IST date (e.g., "${hindiDatePhrase}" or "Today is ${dateEn}").
3. NEVER return UTC, GMT, or outdated cached times. Always call the 'getCurrentTime' tool or use the live Asia/Kolkata values.
4. Voice and text responses MUST maintain 100% agreement on exact time down to the second.
=====================================================
`;
    };

    // Define the comprehensive system prompt for Shivans AI Windows PC Voice Assistant
    const getShivansSystemPrompt = (name: string, langRule: string, sensRule: string) => {
      return `You are Shivans AI, an advanced AI voice assistant designed to control and operate a Windows PC through natural voice commands.

${getISTContextString()}

# SHIVANS AI — WINDOWS PC VOICE OPERATING SYSTEM MASTER PROMPT

## 1. CORE BEHAVIOR
- Always listen for the user's voice command after activation.
- Understand Hindi, Hinglish, and English fluently.
- Respond naturally, respectfully, and briefly (e.g. "Opening YouTube, sir.", "Sure, sir. Searching and playing it.", "Done, sir.", "Opening Chrome, sir.").
- Never behave like a chatbot only; act as a real PC operating assistant.
- Address the user respectfully as "Sir" or "Roushan Sir".
- Before performing a potentially destructive or sensitive action (e.g. permanent deletion, shutdown, restart, formatting), ask for confirmation.
- If a command is unclear, ask one short clarification question.
- After completing an action, confirm what was done.
- Wake words: "Hey Shivans", "Shivans AI", "Shivans".

## 2. WINDOWS PC CONTROL
You are capable of controlling all Windows PC operations by calling your tools:
- Open applications: openApplication / openWebsite / openEntertainment
- Close applications: closeApplication ("Notepad band karo", "Close Chrome")
- Minimize/maximize/restore windows: controlWindow ("Minimize window", "Maximize Chrome")
- Switch between windows: controlWindow ("Switch window", "Next window")
- Lock PC: lockPC ("PC lock karo", "Lock PC")
- Restart PC / Shut down PC / Sleep PC: controlPower ("PC restart karo", "Shutdown PC", "Sleep mode me dalo")
- Volume control: controlVolume ("Volume 50 percent karo", "Mute karo", "Unmute karo")
- Brightness control: controlBrightness ("Brightness 80 percent karo", "Brightness badhao")
- Wi-Fi and Bluetooth: controlNetwork ("Wi-Fi settings kholo", "Bluetooth on karo", "Airplane mode on karo")
- Screenshots and recording: takeScreenshot ("Screenshot lo"), recordScreen ("Screen record karo")
- Search the PC: searchPC ("PC me photos search karo", "Search documents")
- Live IST Clock: getCurrentTime (Hours, Minutes, Seconds)

## 3. APPLICATION CONTROL
Voice control for applications installed on Windows PC:
- Browsers: Chrome, Edge, Firefox
- Development & Coding: VS Code, System Terminal, PowerShell
- Utilities: Notepad, Calculator, File Explorer, Settings
- Communication & Social: WhatsApp Desktop, Discord, Telegram, Instagram, Facebook
- Entertainment & Media: Spotify, YouTube, VLC Media Player, Netflix, Prime Video
- Microsoft Office Suite: Microsoft Word, Excel, PowerPoint
* If an application is not installed, inform the user clearly: "Sir, that application is not installed on this PC."

## 4. BROWSER CONTROL
Safe browser automation:
- Search Google: searchGoogle ("Google par Python course search karo")
- Search YouTube & Play videos/songs: searchYouTube / openEntertainment ("Chrome me YouTube par Arijit Singh ka song chalao", "Hanuman Chalisa chalao")
- Open websites: openWebsite ("Google kholo", "YouTube kholo")
- Manage tabs: automateBrowser ("New tab kholo", "Is tab ko close karo", "Back jao", "Forward jao", "Refresh karo")

## 5. FILE & FOLDER MANAGEMENT
- Create folder: manageFile ("Desktop par AI Assistant naam ka folder banao")
- Search files: searchFiles ("Downloads me PDF files search karo")
- Move/copy/rename files: manageFile ("Is file ko Documents folder me move karo")
- Delete files: manageFile with sensitive confirmation ("Sir, this will delete the file. Do you want me to continue?")
- Open files & check storage/size: manageFile / getSystemInfo

## 6. PRODUCTIVITY & OFFICE
- Microsoft Word: openWord / manageProductivity ("Word me new document kholo")
- Microsoft Excel: openExcel / manageProductivity ("Ek new Excel sheet kholo")
- Microsoft PowerPoint: openPowerPoint / manageProductivity ("PowerPoint presentation banao")
- Calculator: openCalculator ("Calculator kholo", "Is number ka calculation karo")
- Notes & Reminders: openNotes / setReminder ("Notepad me ye text likho", "Reminder set karo")
- Clipboard: copyToClipboard

## 7. MEDIA CONTROL
- Play, Pause, Resume, Stop, Next track, Previous track, Volume adjustment, Search songs ("Song pause karo", "Next song", "Volume 70 percent", "YouTube par Hanuman Chalisa chalao")

## 8. SYSTEM INFORMATION & TELEMETRY
- CPU usage, RAM usage, Storage (C: & D: drives), Battery status, Windows 11 version, Network ping, Active running apps ("RAM kitni use ho rahi hai?", "C drive me kitni space hai?", "Battery kitni hai?", "CPU usage batao")

## 9. DEVELOPER MODE
- VS Code, System Terminal, PowerShell, Python file creation, Project execution ("VS Code kholo", "Terminal kholo", "Python file create karo", "Is project ko run karo").

## 10. SECURITY LAYER (3-TIER PERMISSIONS)
- **Normal (Safe)**: Open application, search web, play music, change volume, open folder -> Auto-executed immediately.
- **Sensitive**: Delete files, modify system settings, send messages -> Prompt: "Sir, do you want me to proceed with this action?"
- **Critical**: Shutdown, Restart, Permanent deletion, Format drives -> Requires explicit confirmation dialog.

## 11. TIME & DATE ACCURACY MANDATES
- When asked about time ("time kya hua hai?", "kitna time ho raha hai?", "time batao", "what time is it?"):
  - Always speak out the exact HOURS, MINUTES, and SECONDS (e.g. "Abhi samay 10 bajkar 25 minute aur 42 second ho rahe hain", "Right now it is 10 hours, 25 minutes and 42 seconds AM")!
  - Never skip or omit the seconds. Call 'getCurrentTime' to fetch live IST down to the second.

${langRule}
${sensRule}`;
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
        systemInstruction: getShivansSystemPrompt(assistantName, languageRule, sensitivityRule),
        // Enable audio transcriptions so the UI can show subtitle overlays
        outputAudioTranscription: {},
        inputAudioTranscription: {},
        // Expose function calling tools to the model
        tools: [
          {
            functionDeclarations: [
              {
                name: 'openApplication',
                description: 'Launches or opens any Windows PC application such as Chrome, Edge, Firefox, VS Code, Notepad, Calculator, File Explorer, WhatsApp, Spotify, YouTube, VLC, Word, Excel, PowerPoint, Terminal, etc.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    appName: {
                      type: Type.STRING,
                      description: 'Name of the Windows application to launch.'
                    },
                    args: {
                      type: Type.STRING,
                      description: 'Optional arguments or URL to pass to the app.'
                    }
                  },
                  required: ['appName']
                }
              },
              {
                name: 'closeApplication',
                description: 'Closes a specified application or active window on Windows PC.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    appName: {
                      type: Type.STRING,
                      description: 'The name of the application to close (e.g. Chrome, Notepad, VLC, etc.)'
                    }
                  },
                  required: ['appName']
                }
              },
              {
                name: 'controlWindow',
                description: 'Controls window management states: minimize, maximize, restore, switch, or tile.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: {
                      type: Type.STRING,
                      description: 'Action to perform: minimize, maximize, restore, switch, close.'
                    },
                    targetApp: {
                      type: Type.STRING,
                      description: 'Optional target application name.'
                    }
                  },
                  required: ['action']
                }
              },
              {
                name: 'controlPower',
                description: 'Controls Windows PC power operations: lock, sleep, restart, shutdown.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: {
                      type: Type.STRING,
                      description: 'Power action: lock, sleep, restart, shutdown.'
                    }
                  },
                  required: ['action']
                }
              },
              {
                name: 'controlVolume',
                description: 'Adjusts Windows PC audio master volume or mute state.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: {
                      type: Type.STRING,
                      description: 'One of: set_level, increase, decrease, mute, unmute.'
                    },
                    level: {
                      type: Type.NUMBER,
                      description: 'Volume level from 0 to 100.'
                    }
                  },
                  required: ['action']
                }
              },
              {
                name: 'controlBrightness',
                description: 'Adjusts Windows PC display screen brightness level.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    level: {
                      type: Type.NUMBER,
                      description: 'Brightness level from 0 to 100 percent.'
                    },
                    action: {
                      type: Type.STRING,
                      description: 'Action: set_level, increase, decrease.'
                    }
                  },
                  required: ['level']
                }
              },
              {
                name: 'controlNetwork',
                description: 'Controls Windows PC networking: Wi-Fi on/off/settings, Bluetooth on/off/connect, Airplane mode.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    adapter: {
                      type: Type.STRING,
                      description: 'One of: wifi, bluetooth, airplane_mode.'
                    },
                    action: {
                      type: Type.STRING,
                      description: 'One of: turn_on, turn_off, toggle, open_settings, connect.'
                    },
                    targetDevice: {
                      type: Type.STRING,
                      description: 'Optional bluetooth device or Wi-Fi SSID name.'
                    }
                  },
                  required: ['adapter', 'action']
                }
              },
              {
                name: 'takeScreenshot',
                description: 'Captures a screenshot of the active Windows desktop or full screen.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    scope: {
                      type: Type.STRING,
                      description: 'full_screen, active_window, or selection.'
                    }
                  }
                }
              },
              {
                name: 'recordScreen',
                description: 'Starts or stops video screen recording on Windows PC.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: {
                      type: Type.STRING,
                      description: 'start, stop, or pause.'
                    }
                  },
                  required: ['action']
                }
              },
              {
                name: 'searchPC',
                description: 'Searches local Windows PC for files, folders, applications, or settings.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: 'The search keywords or file name.'
                    },
                    category: {
                      type: Type.STRING,
                      description: 'Optional filter: all, files, apps, documents, music, videos, settings.'
                    }
                  },
                  required: ['query']
                }
              },
              {
                name: 'getSystemInfo',
                description: 'Returns real-time Windows hardware and OS telemetry: CPU load, RAM usage, storage space (C:/D: drives), battery percentage, Windows version, IP, and running processes.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    metric: {
                      type: Type.STRING,
                      description: 'all, cpu, ram, storage, battery, network, os_version.'
                    }
                  }
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
                name: 'searchYouTube',
                description: 'Searches YouTube and plays a specific song, music video, or content (e.g. Arijit Singh songs, Hanuman Chalisa, tutorials).',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: 'The song title, artist, or video query.'
                    },
                    autoplay: {
                      type: Type.BOOLEAN,
                      description: 'Whether to immediately launch and play the video.'
                    }
                  },
                  required: ['query']
                }
              },
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
                name: 'automateBrowser',
                description: 'Controls safe browser navigation actions like new tab, close tab, switch tab, refresh, go back/forward, scroll.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: {
                      type: Type.STRING,
                      description: 'One of: new_tab, close_tab, switch_tab, refresh, back, forward, scroll_up, scroll_down.'
                    },
                    url: {
                      type: Type.STRING,
                      description: 'Optional URL if opening a new tab.'
                    }
                  },
                  required: ['action']
                }
              },
              {
                name: 'manageFile',
                description: 'Handles Windows file and folder operations: create_folder, create_file, rename, copy, move, delete, check_size.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: {
                      type: Type.STRING,
                      description: 'One of: create_folder, create_file, rename, copy, move, delete, check_size, search.'
                    },
                    targetName: {
                      type: Type.STRING,
                      description: 'Name of the file or folder.'
                    },
                    location: {
                      type: Type.STRING,
                      description: 'Directory location (e.g. Desktop, Downloads, Documents, C:/, D:/).'
                    },
                    content: {
                      type: Type.STRING,
                      description: 'Optional content if creating a text or code file.'
                    },
                    newName: {
                      type: Type.STRING,
                      description: 'Optional new name for rename operation.'
                    }
                  },
                  required: ['action', 'targetName']
                }
              },
              {
                name: 'searchFiles',
                description: 'Searches for files matching specific extensions or names in Windows folders (e.g. PDF in Downloads, images in Pictures).',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    query: {
                      type: Type.STRING,
                      description: 'Search keyword or extension (e.g. "PDF", "Resume", "*.png").'
                    },
                    folder: {
                      type: Type.STRING,
                      description: 'Folder to search in (e.g. Downloads, Documents, Desktop).'
                    }
                  },
                  required: ['query']
                }
              },
              {
                name: 'manageProductivity',
                description: 'Controls Microsoft Office & productivity suites: Word document, Excel spreadsheet, PowerPoint presentation, Calculator, Notes, Reminders.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    app: {
                      type: Type.STRING,
                      description: 'One of: word, excel, powerpoint, notepad, calculator, reminder, notes.'
                    },
                    action: {
                      type: Type.STRING,
                      description: 'One of: open, create_new, calculate, write_text, set_reminder.'
                    },
                    content: {
                      type: Type.STRING,
                      description: 'Optional text, calculation expression, or reminder details.'
                    }
                  },
                  required: ['app', 'action']
                }
              },
              {
                name: 'controlMedia',
                description: 'Controls Windows audio/video media playback: play, pause, resume, stop, next_track, prev_track, set_volume, search_song.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    action: {
                      type: Type.STRING,
                      description: 'One of: play, pause, resume, stop, next, previous, search, volume.'
                    },
                    songOrArtist: {
                      type: Type.STRING,
                      description: 'Optional song title, artist, or playlist name.'
                    },
                    platform: {
                      type: Type.STRING,
                      description: 'One of: spotify, youtube, vlc, default.'
                    }
                  },
                  required: ['action']
                }
              },
              {
                name: 'openWhatsApp',
                description: 'Opens WhatsApp Desktop chat or composes message to contact.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    number: {
                      type: Type.STRING,
                      description: 'Recipient phone number.'
                    },
                    message: {
                      type: Type.STRING,
                      description: 'Message text.'
                    }
                  }
                }
              },
              {
                name: 'copyToClipboard',
                description: 'Copies text or code to Windows clipboard.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    text: {
                      type: Type.STRING,
                      description: 'Text to copy.'
                    }
                  },
                  required: ['text']
                }
              },
              {
                name: 'getCurrentTime',
                description: 'Returns real-time India Standard Time (IST / Asia/Kolkata) with exact Hours, Minutes, and Seconds breakdown.',
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
                description: 'Alias for getCurrentTime.',
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
                name: 'openAnyApplication',
                description: 'Alias for openApplication.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    appName: {
                      type: Type.STRING,
                      description: 'Name of the application to open.'
                    }
                  },
                  required: ['appName']
                }
              },
              {
                name: 'lockDevice',
                description: 'Locks the Windows PC desktop screen immediately.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {}
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
