export type UserEmotion = 'Calm' | 'Happy' | 'Sad' | 'Stressed' | 'Excited' | 'Angry';

export function detectEmotion(text: string): UserEmotion | null {
  const normalized = text.toLowerCase();

  // Word collections for precise mood classification (including Hinglish nuances for Babu AI)
  const angryWords = [
    'angry', 'mad', 'pissed', 'hate', 'furious', 'annoyed', 'frustrated', 'irritated', 'nonsense', 'shut up', 
    'useless', 'wtf', 'hell', 'stupid', 'dumb', 'gussa', 'bura', 'bakwaas', 'irritate'
  ];

  const excitedWords = [
    'excited', 'amazing', 'hype', 'woohoo', 'yay', 'wow', 'unbelievable', 'super', 'eager', 'thrilled', 
    'energetic', 'fantastic', 'incredible', "can't wait", 'cant wait', "let's go", 'lets go', 'party', 
    'bawaal', 'gazab', 'shandar', 'masti', 'dhamaka'
  ];

  const stressedWords = [
    'stressed', 'stress', 'anxious', 'worry', 'worried', 'nervous', 'tension', 'scared', 'fear', 'panic', 
    'overwhelmed', 'deadline', 'exams', 'exam', 'pressure', 'tired', 'exhausted', 'sleepy', 'heavy', 
    'pareshan', 'thak', 'chinta', 'darr', 'tens'
  ];

  const sadWords = [
    'sad', 'unhappy', 'depressed', 'lonely', 'hurt', 'grief', 'broken', 'cry', 'crying', 'tears', 
    'disappointed', 'low', 'bad day', 'miss you', 'missed', 'pain', 'gloomy', 'melancholy', 
    'udas', 'rona', 'dard', 'dukhi', 'akela'
  ];

  const happyWords = [
    'happy', 'great', 'awesome', 'perfect', 'good', 'nice', 'glad', 'laugh', 'smile', 'joy', 'cheerful', 
    'haha', 'hehe', 'fun', 'lovely', 'achieved', 'celebrate', 'proud', 'wonderful', 'khush', 'macha', 
    'badhiya', 'mast', 'achha', 'acha', 'sundar'
  ];

  const calmWords = [
    'calm', 'relax', 'relaxed', 'peaceful', 'serene', 'quiet', 'steady', 'okay', 'fine', 'cool', 
    'neutral', 'zen', 'sukoon', 'shanti', 'theek', 'thik'
  ];

  // Emojis mapping
  if (/[😡😠🤬👿]/.test(text)) return 'Angry';
  if (/[🤩🎉🔥🚀✨]/.test(text)) return 'Excited';
  if (/[😰😱]/.test(text)) return 'Stressed';
  if (/[😭😢🙁💔]/.test(text)) return 'Sad';
  if (/[😄😊😃😂🥰❤️💖]/.test(text)) return 'Happy';
  if (/[😌🧘]/.test(text)) return 'Calm';

  // Check categories with weights
  if (angryWords.some(word => normalized.includes(word))) return 'Angry';
  if (excitedWords.some(word => normalized.includes(word))) return 'Excited';
  if (stressedWords.some(word => normalized.includes(word))) return 'Stressed';
  if (sadWords.some(word => normalized.includes(word))) return 'Sad';
  if (happyWords.some(word => normalized.includes(word))) return 'Happy';
  if (calmWords.some(word => normalized.includes(word))) return 'Calm';

  return null;
}
