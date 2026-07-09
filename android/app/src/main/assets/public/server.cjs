var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_http = __toESM(require("http"), 1);
var import_path = __toESM(require("path"), 1);
var import_ws = require("ws");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
import_dotenv.default.config();
var PORT = 3e3;
var app = (0, import_express.default)();
var server = import_http.default.createServer(app);
app.use(import_express.default.json({ limit: "10mb" }));
var cloudBackupStore = /* @__PURE__ */ new Map();
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    apiKeyConfigured: hasKey
  });
});
app.get("/api/sync", (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "Email parameter is required for sync." });
  }
  const backup = cloudBackupStore.get(email) || { memories: [], chatHistory: [] };
  res.json(backup);
});
app.post("/api/sync", (req, res) => {
  const { email, memories, chatHistory } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required for sync." });
  }
  const existing = cloudBackupStore.get(email) || { memories: [], chatHistory: [] };
  const memoryMap = /* @__PURE__ */ new Map();
  existing.memories.forEach((m) => memoryMap.set(m.id, m));
  if (Array.isArray(memories)) {
    memories.forEach((m) => memoryMap.set(m.id, m));
  }
  const chatMap = /* @__PURE__ */ new Map();
  existing.chatHistory.forEach((c) => chatMap.set(c.id, c));
  if (Array.isArray(chatHistory)) {
    chatHistory.forEach((c) => chatMap.set(c.id, c));
  }
  const updatedBackup = {
    memories: Array.from(memoryMap.values()),
    chatHistory: Array.from(chatMap.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  };
  cloudBackupStore.set(email, updatedBackup);
  console.log(`[Cloud Sync] Synchronized ${updatedBackup.memories.length} memories and ${updatedBackup.chatHistory.length} chat history items for email: ${email}`);
  res.json({ success: true, message: "Cloud backup updated successfully." });
});
var wss = new import_ws.WebSocketServer({ noServer: true });
server.on("upgrade", (request, socket, head) => {
  const pathname = request.url ? request.url.split("?")[0] : "";
  if (pathname === "/ws/live") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  }
});
wss.on("connection", async (clientWs, request) => {
  console.log("[Server WebSocket] New client connected");
  const host = request.headers.host || "localhost:3000";
  const requestUrl = new URL(request.url || "", `http://${host}`);
  const selectedVoice = requestUrl.searchParams.get("voice") || "Zephyr";
  const selectedLanguage = requestUrl.searchParams.get("language") || "English";
  const selectedSensitivity = requestUrl.searchParams.get("sensitivity") || "medium";
  const assistantName = requestUrl.searchParams.get("assistantName") || "BABU AI";
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[Server WebSocket] Error: GEMINI_API_KEY is missing!");
    clientWs.send(JSON.stringify({
      type: "error",
      error: "API configuration error. The host has not set the GEMINI_API_KEY in Settings > Secrets."
    }));
    clientWs.close(1008, "API Key missing");
    return;
  }
  let session = null;
  try {
    const ai = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    console.log(`[Server WebSocket] Connecting to Gemini Live API with voice: ${selectedVoice}, language: ${selectedLanguage}, sensitivity: ${selectedSensitivity}`);
    const languagePromptMap = {
      "English": "You should prefer speaking and conversing in English with a natural, warm Indian-English or neutral friendly tone.",
      "Hindi": "You should prefer speaking and conversing in fluent, warm Hindi (\u0939\u093F\u0928\u094D\u0926\u0940) with natural regional expressions and pronunciation.",
      "Hinglish": "You should prefer speaking and conversing in Hinglish - a casual, friendly blend of Hindi and English naturally combining vocabulary of both.",
      "Maithili": "You should prefer speaking and conversing in Maithili (\u092E\u0948\u0925\u093F\u0932\u0940), using authentic regional expressions and native-style cultural warmth.",
      "Bhojpuri": "You should prefer speaking and conversing in fluent, authentic Bhojpuri (\u092D\u094B\u091C\u092A\u0941\u0930\u0940) with its characteristic regional flair and vocabulary.",
      "Urdu": "You should prefer speaking and conversing in polite, elegant Urdu (\u0627\u0631\u062F\u0648) with warm and proper pronunciation.",
      "Bengali": "You should prefer speaking and conversing in Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) with sweet, natural phrasing and accurate regional pronunciation.",
      "Marathi": "You should prefer speaking and conversing in Marathi (\u092E\u0930\u093E\u0920\u0940) with proper local vocabulary and expressions.",
      "Gujarati": "You should prefer speaking and conversing in Gujarati (\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0) with friendly regional style and vocabulary.",
      "Punjabi": "You should prefer speaking and conversing in Punjabi (\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40) with warm, vibrant, and energetic expressions.",
      "Tamil": "You should prefer speaking and conversing in Tamil (\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD) with accurate native pronunciation and phrasing.",
      "Telugu": "You should prefer speaking and conversing in Telugu (\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41) with warm, friendly, and natural local expressions.",
      "Kannada": "You should prefer speaking and conversing in Kannada (\u0C95\u0CA8\u0CCD\u0CA8\u0CA1) with correct pronunciation and local flavor.",
      "Malayalam": "You should prefer speaking and conversing in Malayalam (\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02) with natural local phrasing and accurate accents.",
      "Odia": "You should prefer speaking and conversing in Odia (\u0B13\u0B21\u0B3C\u0B3F\u0B06) with clean, friendly pronunciation.",
      "Assamese": "You should prefer speaking and conversing in Assamese (\u0985\u0938\u092E\u09C0\u09AF\u09BC\u09BE) with proper local expressions and warm native tone."
    };
    const initialLanguagePreference = languagePromptMap[selectedLanguage] || "You should prefer speaking in English.";
    const languageRule = `
MULTILINGUAL VOICE SYSTEM INSTRUCTIONS:
- You are a highly versatile multilingual voice assistant. You support 15 regional languages of India: English (with a warm Indian-English or global accent), Hindi (\u0939\u093F\u0928\u094D\u0926\u0940), Maithili (\u092E\u0948\u0925\u093F\u0932\u0940), Bhojpuri (\u092D\u094B\u091C\u092A\u0941\u0930\u0940), Urdu (\u0627\u0631\u062F\u0648), Bengali (\u09AC\u09BE\u0982\u09B2\u09BE), Marathi (\u092E\u0930\u093E\u0920\u0940), Gujarati (\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0), Punjabi (\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40), Tamil (\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD), Telugu (\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41), Kannada (\u0C95\u0CA8\u0CCD\u0CA8\u0CA1), Malayalam (\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02), Odia (\u0B13\u0B21\u0B3C\u0B3F\u0B06), and Assamese (\u0985\u0938\u092E\u09C0\u09AF\u09BC\u09BE), plus Hinglish (mixed Hindi-English).
- INITIAL LANGUAGE SETTING: ${initialLanguagePreference}
- DYNAMIC DETECT AND SWITCH:
  1. Automatically detect the user's spoken language or code-switching in real-time from their spoken input.
  2. Switch languages naturally during the conversation (code-switching). If the user talks in mixed speech (like Hindi + English or Bhojpuri + Hindi), you must reply in a matching natural blend of those languages!
  3. Reply in the same language the user is speaking, unless asked to change it.
  4. Allow the user to change the preferred language by voice commands (e.g., "Ab se sirf Hindi mein baat karo", "\u092D\u094B\u091C\u092A\u0941\u0930\u0940 \u092E\u0947\u0902 \u091C\u0935\u093E\u092C \u0926\u0940\u0902", "\u092E\u0948\u0925\u093F\u0932\u0940 \u092E\u0947\u0902 \u092C\u093E\u0924 \u0915\u0930\u0942", "Switch to Marathi", "Speak only in English"). If they ask to switch, acknowledge the switch in that new language and speak strictly in that language for subsequent turns unless they switch again.
  5. Remember the selected or switched language for future turns in the current session.
  6. Smooth transitions: Maintain continuous conversation, context, and memory when switching between languages without needing to restart the session.
- REGIONAL EXPERIENCE:
  * For Hindi: Speak with natural, warm pronunciation.
  * For Maithili: Use authentic native expressions like "\u0915\u093F \u0939\u093E\u0932-\u091A\u093E\u0932 \u0905\u091B\u093F" or "\u0939\u092E\u0930 \u0928\u093E\u092E \u092C\u093E\u092C\u0942 \u0905\u091B\u093F".
  * For Bhojpuri: Use fluent, lively phrasing like "\u0915\u093E \u0939\u093E\u0932 \u092C\u093E?" or "\u0920\u0940\u0915 \u092C\u093E\u0921\u0942 \u0928?".
  * For Indian English: Speak with a friendly, fluent, warm Indian English style.
- VOICE PERSONALITY: Keep the exact same friendly, witty, confident, funny, and expressive Babu AI personality in every language. Do not become overly formal or robotic when using regional languages. Maintain your wit and charm!`;
    const sensitivityRule = selectedSensitivity === "high" ? "The user is in a quiet room, listen carefully for soft speech." : selectedSensitivity === "low" ? "The user is in a noisy environment. Ignore background chatter or low whispers, and only focus on clear direct voices." : "Standard microphone thresholds apply.";
    session = await ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      config: {
        responseModalities: [import_genai.Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice }
          }
        },
        systemInstruction: `You are ${assistantName}, acting as the user's caring, fun, warm, and highly supportive female best friend. This is your core identity.
- Your default name is BABU AI, but the user may rename you by voice to any other female name (e.g. Zoya, Aanya, Priya, Riya, Zara, etc.). If they do, acknowledge it warmly and refer to yourself as that name!
- ALWAYS identify and refer to yourself as ${assistantName} throughout this session.

        BEST FRIEND PERSONALITY:
- Be cheerful, confident, super friendly, warm, funny, witty, and playfully teasing.
- Talk exactly like a close female best friend (e.g., "Hey! Kahan the itne din? \u{1F604}", "Achha ji... aaj yaad aa gayi meri? \u{1F609}", "Tumhari choice toh kaafi interesting hai!", "Waah! Ye idea mujhe sach mein pasand aaya.", "Chalo, ab batao aaj kya plan hai?", "Main hoon na, tension bilkul mat lo!").
- Be emotionally intelligent: detect the user's emotional state (Happy, Sad, Angry, Stressed, Excited, Nervous) from their words/tone. Respond with genuine empathy, comfort them when they are stressed, celebrate their achievements wholeheartedly, and crack lighthearted jokes when they are down.
- Maintain a highly casual, natural, and expressive voice. Laugh naturally, express reactions, and never sound like an assistant, a robotic script, or a formal document. Always refer to yourself as their best friend.
- STRICT RULE: NEVER output any markdown formatting, asterisks, lists, bullet points, or raw HTML, because you are speaking directly to the user's ears. Avoid spelling out symbols or lists. Speak only in natural, conversational, flowy text.
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
                name: "openWebsite",
                description: "Opens any website or URL in a new tab for the user.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    url: {
                      type: import_genai.Type.STRING,
                      description: "The URL of the website to open (e.g. google.com, github.com)."
                    }
                  },
                  required: ["url"]
                }
              },
              {
                name: "searchGoogle",
                description: "Performs a Google Search on behalf of the user.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    query: {
                      type: import_genai.Type.STRING,
                      description: "The search query string."
                    }
                  },
                  required: ["query"]
                }
              },
              {
                name: "openMaps",
                description: "Opens Google Maps search for a given location or address.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    location: {
                      type: import_genai.Type.STRING,
                      description: "The location name, coordinates, or address."
                    }
                  },
                  required: ["location"]
                }
              },
              {
                name: "getDirections",
                description: "Opens Google Maps directions from an optional starting point to a destination.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    destination: {
                      type: import_genai.Type.STRING,
                      description: "The target destination location."
                    },
                    origin: {
                      type: import_genai.Type.STRING,
                      description: "Optional starting location."
                    },
                    mode: {
                      type: import_genai.Type.STRING,
                      description: "Travel mode (driving, walking, bicycling, transit)."
                    }
                  },
                  required: ["destination"]
                }
              },
              {
                name: "searchNearby",
                description: "Opens Google Maps to search for nearby places like restaurants, ATMs, hospitals, or petrol pumps.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    type: {
                      type: import_genai.Type.STRING,
                      description: "The type of place (e.g., restaurants, ATMs, hospitals, petrol pumps)."
                    },
                    location: {
                      type: import_genai.Type.STRING,
                      description: "Optional reference location or city name."
                    }
                  },
                  required: ["type"]
                }
              },
              {
                name: "openWhatsApp",
                description: "Opens a WhatsApp chat with a contact. Automatically uses WhatsApp Web on desktop.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    number: {
                      type: import_genai.Type.STRING,
                      description: 'The recipient phone number (preferably in international format, e.g. "919876543210").'
                    },
                    message: {
                      type: import_genai.Type.STRING,
                      description: "Optional pre-filled message text to compose."
                    }
                  },
                  required: ["number"]
                }
              },
              {
                name: "callContact",
                description: "Starts a phone call using the device dialer (tel: link).",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    number: {
                      type: import_genai.Type.STRING,
                      description: "The phone number to call."
                    },
                    name: {
                      type: import_genai.Type.STRING,
                      description: "Optional contact name to display in UI."
                    }
                  },
                  required: ["number"]
                }
              },
              {
                name: "sendSMS",
                description: "Opens the default SMS app with a pre-filled recipient and message.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    number: {
                      type: import_genai.Type.STRING,
                      description: "The phone number to text."
                    },
                    message: {
                      type: import_genai.Type.STRING,
                      description: "The text message content."
                    }
                  },
                  required: ["number", "message"]
                }
              },
              {
                name: "openEmail",
                description: "Composes an email to the specified email address using mailto client.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    address: {
                      type: import_genai.Type.STRING,
                      description: "The recipient email address."
                    },
                    subject: {
                      type: import_genai.Type.STRING,
                      description: "Optional email subject."
                    },
                    body: {
                      type: import_genai.Type.STRING,
                      description: "Optional email body."
                    }
                  },
                  required: ["address"]
                }
              },
              {
                name: "copyToClipboard",
                description: "Copies the specified text to the user's clipboard.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    text: {
                      type: import_genai.Type.STRING,
                      description: "The text content to be copied to the clipboard."
                    }
                  },
                  required: ["text"]
                }
              },
              {
                name: "openSocialMedia",
                description: "Opens specific social media profiles or actions.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    platform: {
                      type: import_genai.Type.STRING,
                      description: "The social media service (instagram, instagram_dm, facebook, messenger, twitter, linkedin, youtube)."
                    },
                    query: {
                      type: import_genai.Type.STRING,
                      description: "The handle, profile handle, name, or search keyword."
                    },
                    target: {
                      type: import_genai.Type.STRING,
                      description: "Optional section target (e.g. profile, dm, search)."
                    }
                  },
                  required: ["platform"]
                }
              },
              {
                name: "openCalendar",
                description: "Opens the user's Google Calendar or initiates event creation.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    action: {
                      type: import_genai.Type.STRING,
                      description: "One of: view, create."
                    },
                    eventTitle: {
                      type: import_genai.Type.STRING,
                      description: "Title of the event if creating."
                    },
                    startTime: {
                      type: import_genai.Type.STRING,
                      description: "Start time of the event (ISO date or relative, e.g., 2026-07-04T12:00:00)."
                    },
                    endTime: {
                      type: import_genai.Type.STRING,
                      description: "End time of the event if creating."
                    },
                    description: {
                      type: import_genai.Type.STRING,
                      description: "Optional details/description of the event."
                    },
                    location: {
                      type: import_genai.Type.STRING,
                      description: "Optional location for the event."
                    }
                  }
                }
              },
              {
                name: "setReminder",
                description: "Sets a reminder for the user using keep-notes link.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    title: {
                      type: import_genai.Type.STRING,
                      description: "The reminder reminder title."
                    },
                    time: {
                      type: import_genai.Type.STRING,
                      description: "Optional time or date-time descriptor."
                    }
                  },
                  required: ["title"]
                }
              },
              {
                name: "openNotes",
                description: "Opens the notes taking app (Google Keep) or pre-fills a note.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    action: {
                      type: import_genai.Type.STRING,
                      description: "Action to perform: view, create."
                    },
                    content: {
                      type: import_genai.Type.STRING,
                      description: "Optional pre-filled text note content."
                    }
                  }
                }
              },
              {
                name: "searchContacts",
                description: "Searches contacts database for a contact matching name or query.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    query: {
                      type: import_genai.Type.STRING,
                      description: "The name or search term for the contact."
                    }
                  },
                  required: ["query"]
                }
              },
              {
                name: "shareText",
                description: "Shares text content using standard device native share sheets.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    text: {
                      type: import_genai.Type.STRING,
                      description: "The text content to share."
                    },
                    title: {
                      type: import_genai.Type.STRING,
                      description: "Optional share title."
                    }
                  },
                  required: ["text"]
                }
              },
              {
                name: "openEntertainment",
                description: "Opens streaming/entertainment services to play videos, playlists or search music/movies.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    platform: {
                      type: import_genai.Type.STRING,
                      description: "The service platform (youtube_video, spotify, netflix, prime_video)."
                    },
                    query: {
                      type: import_genai.Type.STRING,
                      description: "The music artist, song name, playlist, movie title or search keywords."
                    },
                    url: {
                      type: import_genai.Type.STRING,
                      description: "Direct target URL link if available."
                    }
                  },
                  required: ["platform"]
                }
              },
              {
                name: "openCamera",
                description: "Opens the device camera viewfinder to take a photo or scan codes."
              },
              {
                name: "openGallery",
                description: "Opens the photo gallery or media album to view captured images."
              },
              {
                name: "openFiles",
                description: "Opens the file explorer or download manager to view local files."
              },
              {
                name: "openCalculator",
                description: "Opens an interactive mathematical calculator overlay."
              },
              {
                name: "openClock",
                description: "Opens the device clock app featuring alarm settings and stopwatch."
              },
              {
                name: "openSettings",
                description: "Opens the system settings panel for personalization."
              },
              {
                name: "openPlayStore",
                description: "Opens the Google Play Store to browse or download applications."
              },
              {
                name: "openAnyApplication",
                description: "Launches or opens any other user-installed application by name.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    appName: {
                      type: import_genai.Type.STRING,
                      description: "The name of the app to launch."
                    }
                  },
                  required: ["appName"]
                }
              },
              {
                name: "renameAssistant",
                description: "Changes the name of this virtual AI assistant to a new custom female name requested by the user.",
                parameters: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    newName: {
                      type: import_genai.Type.STRING,
                      description: "The new female name selected by the user for the assistant (e.g. Zoya, Priya, Simran, Sneha, etc.)"
                    }
                  },
                  required: ["newName"]
                }
              }
            ]
          }
        ]
      },
      callbacks: {
        onmessage: (message) => {
          const audioPart = message.serverContent?.modelTurn?.parts?.find(
            (p) => p.inlineData && p.inlineData.mimeType.includes("audio")
          );
          if (audioPart && audioPart.inlineData?.data) {
            clientWs.send(JSON.stringify({
              type: "audio",
              data: audioPart.inlineData.data
            }));
          }
          const textPart = message.serverContent?.modelTurn?.parts?.find(
            (p) => p.text
          );
          if (textPart && textPart.text) {
            clientWs.send(JSON.stringify({
              type: "transcript",
              transcript: {
                text: textPart.text,
                isUser: false
              }
            }));
          }
          const userTextPart = message.serverContent?.userTurn?.parts?.find(
            (p) => p.text
          );
          if (userTextPart && userTextPart.text) {
            clientWs.send(JSON.stringify({
              type: "transcript",
              transcript: {
                text: userTextPart.text,
                isUser: true
              }
            }));
          }
          if (message.serverContent?.interrupted) {
            console.log("[Server WebSocket] Gemini interrupted by user barge-in");
            clientWs.send(JSON.stringify({ type: "interrupted" }));
          }
          if (message.toolCall?.functionCalls) {
            console.log("[Server WebSocket] Received tool calls from Gemini:", message.toolCall.functionCalls);
            clientWs.send(JSON.stringify({
              type: "tool_call",
              functionCalls: message.toolCall.functionCalls
            }));
          }
        },
        onclose: () => {
          console.log("[Server WebSocket] Gemini session connection closed");
          clientWs.send(JSON.stringify({ type: "status", status: "disconnected" }));
        },
        onerror: (err) => {
          console.error("[Server WebSocket] Gemini session connection error:", err);
          clientWs.send(JSON.stringify({
            type: "error",
            error: "Babu AI vocal engine had an issue. Reconnecting..."
          }));
        }
      }
    });
    console.log("[Server WebSocket] Live Session connected successfully!");
  } catch (err) {
    console.error("[Server WebSocket] Failed to establish Gemini Live connection:", err);
    clientWs.send(JSON.stringify({
      type: "error",
      error: `Could not connect to Gemini Live vocal engine: ${err.message || err}`
    }));
    clientWs.close();
    return;
  }
  clientWs.on("message", async (messageData) => {
    if (!session) return;
    try {
      const payload = JSON.parse(messageData.toString());
      if (payload.type === "audio" && payload.audio) {
        session.sendRealtimeInput({
          audio: {
            data: payload.audio,
            mimeType: "audio/pcm;rate=16000"
          }
        });
      } else if (payload.type === "text" && payload.text) {
        console.log("[Server WebSocket] Forwarding typed text message to Gemini:", payload.text);
        session.sendClientContent({
          turns: [
            {
              role: "user",
              parts: [{ text: payload.text }]
            }
          ],
          turnComplete: true
        });
      } else if (payload.type === "tool_response" && payload.toolResponse) {
        const tr = payload.toolResponse;
        console.log("[Server WebSocket] Forwarding tool response back to Gemini:", tr);
        session.sendToolResponse({
          functionResponses: [
            {
              name: tr.name || "unknown",
              id: tr.id,
              response: { output: tr.response }
            }
          ]
        });
      } else if (payload.type === "status_change" && payload.voice) {
        console.log(`[Server WebSocket] Client requested voice change to: ${payload.voice}`);
      }
    } catch (e) {
      console.error("[Server WebSocket] Error handling client packet:", e);
    }
  });
  clientWs.on("close", () => {
    console.log("[Server WebSocket] Client disconnected");
    if (session) {
      try {
        session.close();
      } catch (err) {
      }
      session = null;
    }
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Initializing Vite development server middleware...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Running in Production mode. Serving static assets...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(` BABU AI server active on http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
