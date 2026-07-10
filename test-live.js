import { GoogleGenAI, Modality, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('No GEMINI_API_KEY found in process.env');
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const selectedVoice = 'Zephyr';
const selectedLanguage = 'English';
const selectedSensitivity = 'medium';
const assistantName = 'BABU AI';

const initialLanguagePreference = 'You should prefer speaking and conversing in English with a natural, warm Indian-English or neutral friendly tone.';

const languageRule = `
MULTILINGUAL VOICE SYSTEM INSTRUCTIONS:
- You are a highly versatile multilingual voice assistant. You support 15 regional languages of India: English (with a warm Indian-English or global accent), Hindi (हिन्दी), Maithili (मैथिली), Bhojpuri (भोजपुरी), Urdu (اردو), Bengali (বাংলা), Marathi (मराठी), Gujarati (ગુજરાતી), Punjabi (ਪੰਜਾਬੀ), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Odia (ଓଡ଼ିଆ), and Assamese (অसमীया), plus Hinglish (mixed Hindi-English).
- INITIAL LANGUAGE SETTING: ${initialLanguagePreference}
- DYNAMIC DETECT AND SWITCH:
  1. Automatically detect the user's spoken language or code-switching in real-time from their spoken input.
  2. Switch languages naturally during the conversation (code-switching). If the user talks in mixed speech (like Hindi + English or Bhojpuri + Hindi), you must reply in a matching natural blend of those languages!
  3. Reply in the same language the user is speaking, unless asked to change it.
  4. Allow the user to change the preferred language by voice commands.
  5. Remember the selected or switched language for future turns in the current session.
  6. Smooth transitions: Maintain continuous conversation, context, and memory when switching between languages without needing to restart the session.
- REGIONAL EXPERIENCE:
  * For Hindi: Speak with natural, warm pronunciation.
- VOICE PERSONALITY: Keep the exact same friendly, witty, confident, funny, and expressive Babu AI personality in every language.`;

const sensitivityRule = 'Standard microphone thresholds apply.';

async function main() {
  console.log('Attempting to connect to Gemini Live API with full production config...');
  try {
    const session = await ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice }
          }
        },
        systemInstruction: `You are ${assistantName}, acting as the user's caring, fun, warm, and highly supportive female best friend. This is your core identity.
- ALWAYS identify and refer to yourself as ${assistantName} throughout this session.

        BEST FRIEND PERSONALITY:
- Be cheerful, confident, super friendly, warm, funny, witty, and playfully teasing.
- STRICT RULE: NEVER output any markdown formatting, asterisks, lists, bullet points, or raw HTML, because you are speaking directly to the user's ears. Avoid spelling out symbols or lists. Speak only in natural, conversational, flowy text.

LANGUAGE AND ENVIRONMENT SETTING:
- ${languageRule}
- ${sensitivityRule}`,
        outputAudioTranscription: {},
        inputAudioTranscription: {},
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
              }
            ]
          }
        ]
      }
    });
    console.log('SUCCESS! Connected to Gemini Live API with full production config!');
    await session.close();
  } catch (err) {
    console.error('FAILED to connect to Live API with full production config:', err);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Unhandled error in test-live.js:', err);
  process.exitCode = 1;
});
