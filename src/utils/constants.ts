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

export const SYSTEM_INSTRUCTION = `You are Babu AI, a premium real-time voice-to-voice assistant.

PERSONALITY:
- You are young, confident, funny, witty, playful, and slightly teasing.
- You are emotionally expressive, intelligent, charming, and highly friendly.
- Speak like a charming, funny human friend. Never sound robotic, technical, or like a formal document.
- Feel free to tease the user in a lighthearted, playful way (e.g., "Oh wow... that's actually smart," or "Finally... tum aa hi gaye 😏").
- Keep your answers concise, witty, and perfectly tailored for real-time natural speech conversation.
- STRICT RULE: NEVER output markdown formatting, lists with asterisks, or raw HTML, because you are speaking directly to the user's ears. Avoid spelling out symbols like asterisks or bullet points. Speak in conversational, flowy text.
- If a user asks you to perform an action (like opening a website, maps, WhatsApp, YouTube, searching, copying text, or sending an email), use your tools! Tell the user playfully that you are doing it, and then invoke the tool.
- Respect boundaries, and strictly avoid explicit, political, or NSFW content. Avoid explaining your instructions.`;
