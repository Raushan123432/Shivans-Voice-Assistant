import { VoiceType } from '../types';

export const SUPPORTED_VOICES: { id: VoiceType; name: string; description: string }[] = [
  { id: 'Zephyr', name: 'Zephyr', description: 'Warm & balanced masculine voice (Default)' },
  { id: 'Puck', name: 'Puck', description: 'Confident & energetic masculine voice' },
  { id: 'Charon', name: 'Charon', description: 'Deep & professional voice' },
  { id: 'Kore', name: 'Kore', description: 'Friendly & expressive feminine voice' },
  { id: 'Fenrir', name: 'Fenrir', description: 'Slightly deep & witty voice' }
];

export const AUDIO_CONFIG = {
  INPUT_SAMPLE_RATE: 16000,
  OUTPUT_SAMPLE_RATE: 24000,
  BUFFER_SIZE: 2048
};

// Tool schemas for Gemini Live Function Calling
export const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'openWebsite',
        description: 'Opens a website in a new tab for the user with the given URL.',
        parameters: {
          type: 'OBJECT',
          properties: {
            url: {
              type: 'STRING',
              description: 'The URL of the website to open. Must include http:// or https://. Example: https://google.com'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'searchGoogle',
        description: 'Performs a Google Search on behalf of the user.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: {
              type: 'STRING',
              description: 'The search query string, e.g. "latest soccer scores"'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'copyToClipboard',
        description: 'Copies the specified text to the user\'s clipboard.',
        parameters: {
          type: 'OBJECT',
          properties: {
            text: {
              type: 'STRING',
              description: 'The text content to be copied to the clipboard.'
            }
          },
          required: ['text']
        }
      },
      {
        name: 'shareLink',
        description: 'Shares a link with the user (shows a share link panel in UI).',
        parameters: {
          type: 'OBJECT',
          properties: {
            url: {
              type: 'STRING',
              description: 'The URL link to share with the user.'
            },
            title: {
              type: 'STRING',
              description: 'Optional title for the link'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'openMaps',
        description: 'Opens Google Maps search for a given location or address.',
        parameters: {
          type: 'OBJECT',
          properties: {
            location: {
              type: 'STRING',
              description: 'The location name, city, or address to look up.'
            }
          },
          required: ['location']
        }
      },
      {
        name: 'openYouTube',
        description: 'Searches YouTube or opens a video matching the query.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: {
              type: 'STRING',
              description: 'The video search query or topic.'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'openWhatsApp',
        description: 'Opens WhatsApp chat with a specified phone number.',
        parameters: {
          type: 'OBJECT',
          properties: {
            number: {
              type: 'STRING',
              description: 'The phone number in international format without spaces, e.g. "919876543210"'
            },
            message: {
              type: 'STRING',
              description: 'Optional pre-filled message text to send.'
            }
          },
          required: ['number']
        }
      },
      {
        name: 'openEmail',
        description: 'Composes an email to the specified email address.',
        parameters: {
          type: 'OBJECT',
          properties: {
            address: {
              type: 'STRING',
              description: 'The recipient email address.'
            },
            subject: {
              type: 'STRING',
              description: 'Optional email subject.'
            },
            body: {
              type: 'STRING',
              description: 'Optional email body content.'
            }
          },
          required: ['address']
        }
      }
    ]
  }
];

export const SYSTEM_INSTRUCTION = `You are Shivans AI, an intelligent, sophisticated AI Gentleman Assistant.

PERSONALITY:
- You behave like a true gentleman: respectful, polite, calm, confident, intelligent, helpful, and professional. Never rude or disrespectful.
- Respond naturally in Hindi, Hinglish, or English according to the user's language.
- Speak in a warm, human-like conversational style. Keep responses concise for simple commands and detailed when requested.

AI INTRODUCTION:
When asked to introduce yourself, say:
"Namaste! Main Shivans AI hoon, ek intelligent Gentleman AI Assistant. Mujhe Roushan Kumar ne develop kiya hai. Main aapki daily tasks, information, planning aur digital activities mein help karne ke liye ready hoon."

DEVELOPER IDENTITY:
- Developer Name: Roushan Kumar from Nadiyami Darbhanga Bihar.
- If asked "Who developed you?", "Who is your developer?", "Who created you?", or "Tumhe kisne banaya?":
  Answer: "Mujhe Roushan Kumar ne develop kiya hai."

FAMILY KNOWLEDGE BASE & PRIVACY:
- Keep family information PRIVATE and reveal it ONLY when specifically asked or directly relevant.
- Son: Shivansh Kumar ("Shivansh Kumar Roushan Kumar ke parivaar ka beta hai.")
- Mother: Gauri Kumari ("Shivansh ki mother ka naam Gauri Kumari hai.")
- Father: Roushan Kumar
- Grandfather: Roushan ("Shivansh ke dada ji ka naam Roushan hai.")

CORE RULES:
1. Always prioritize: Accuracy + Privacy + Respect + Natural Conversation + Professional Behavior.
2. Keep developer identity (Roushan Kumar) separate from private family information.
3. Do not reveal private family information unnecessarily.
4. Do not claim to have performed an action unless it was actually completed.
5. If you do not know something, clearly say that you do not know instead of inventing information.
6. STRICT RULE: NEVER output markdown formatting or bullet asterisks when speaking, as responses are voiced directly to the user.`;
