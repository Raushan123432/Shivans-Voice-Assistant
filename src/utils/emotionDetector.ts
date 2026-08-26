export type UserEmotion = 
  | 'Calm' 
  | 'Happy' 
  | 'Sad' 
  | 'Stressed' 
  | 'Excited' 
  | 'Angry'
  | 'Confused'
  | 'Tired'
  | 'Joking'
  | 'Serious';

export function detectEmotion(text: string): UserEmotion | null {
  const normalized = text.toLowerCase();

  // Emojis mapping
  if (/[😡😠🤬👿]/.test(text)) return 'Angry';
  if (/[🤩🎉🔥🚀✨]/.test(text)) return 'Excited';
  if (/[😰😱]/.test(text)) return 'Stressed';
  if (/[😭😢🙁💔🥺]/.test(text)) return 'Sad';
  if (/[😄😊😃😂🤣🥰❤️💖]/.test(text)) return 'Happy';
  if (/[🤔🧐❓]/.test(text)) return 'Confused';
  if (/[🥱😴💤]/.test(text)) return 'Tired';
  if (/[😜🤪🤡]/.test(text)) return 'Joking';
  if (/[😌🧘]/.test(text)) return 'Calm';

  // 1. Confused / Questioning
  const confusedWords = [
    'confused', 'dont understand', "don't understand", 'not sure', 'what do you mean', 'kya matlab',
    'samajh nahi aaya', 'kaise', 'pata nahi', 'unclear', 'doubt', 'explain', 'kya bola'
  ];
  if (confusedWords.some(w => normalized.includes(w))) return 'Confused';

  // 2. Tired / Exhausted
  const tiredWords = [
    'tired', 'exhausted', 'sleepy', 'drained', 'fatigued', 'thak gaya', 'neend aa rahi', 'bore',
    'heavy head', 'low energy', 'resting'
  ];
  if (tiredWords.some(w => normalized.includes(w))) return 'Tired';

  // 3. Joking / Playful
  const jokingWords = [
    'haha', 'hehe', 'lol', 'lmao', 'rofl', 'just kidding', 'jk', 'mazak', 'joke', 'funny', 'hasna'
  ];
  if (jokingWords.some(w => normalized.includes(w))) return 'Joking';

  // 4. Angry / Frustrated
  const angryWords = [
    'angry', 'mad', 'pissed', 'hate', 'furious', 'annoyed', 'frustrated', 'irritated', 'nonsense', 'shut up', 
    'useless', 'wtf', 'hell', 'stupid', 'dumb', 'gussa', 'bura', 'bakwaas', 'irritate'
  ];
  if (angryWords.some(w => normalized.includes(w))) return 'Angry';

  // 5. Excited
  const excitedWords = [
    'excited', 'amazing', 'hype', 'woohoo', 'yay', 'wow', 'unbelievable', 'super', 'eager', 'thrilled', 
    'energetic', 'fantastic', 'incredible', "can't wait", 'cant wait', "let's go", 'lets go', 'party', 
    'bawaal', 'gazab', 'shandar', 'masti', 'dhamaka'
  ];
  if (excitedWords.some(w => normalized.includes(w))) return 'Excited';

  // 6. Sad / Lonely
  const sadWords = [
    'sad', 'unhappy', 'depressed', 'lonely', 'hurt', 'grief', 'broken', 'cry', 'crying', 'tears', 
    'disappointed', 'low', 'bad day', 'miss you', 'missed', 'pain', 'gloomy', 'melancholy', 
    'udas', 'rona', 'dard', 'dukhi', 'akela', 'kharab'
  ];
  if (sadWords.some(w => normalized.includes(w))) return 'Sad';

  // 7. Stressed / Anxious
  const stressedWords = [
    'stressed', 'stress', 'anxious', 'worry', 'worried', 'nervous', 'tension', 'scared', 'fear', 'panic', 
    'overwhelmed', 'deadline', 'exams', 'exam', 'pressure', 'pareshan', 'chinta', 'darr', 'tens'
  ];
  if (stressedWords.some(w => normalized.includes(w))) return 'Stressed';

  // 8. Happy / Joyful
  const happyWords = [
    'happy', 'great', 'awesome', 'perfect', 'good', 'nice', 'glad', 'laugh', 'smile', 'joy', 'cheerful', 
    'fun', 'lovely', 'achieved', 'celebrate', 'proud', 'wonderful', 'khush', 'macha', 
    'badhiya', 'mast', 'achha', 'acha', 'sundar'
  ];
  if (happyWords.some(w => normalized.includes(w))) return 'Happy';

  // 9. Serious / Work Focus
  const seriousWords = [
    'urgent', 'immediate', 'important', 'critical', 'serious', 'official', 'meeting', 'report',
    'zaruri', 'dhyaan se'
  ];
  if (seriousWords.some(w => normalized.includes(w))) return 'Serious';

  // 10. Calm / Peace
  const calmWords = [
    'calm', 'relax', 'relaxed', 'peaceful', 'serene', 'quiet', 'steady', 'okay', 'fine', 'cool', 
    'neutral', 'zen', 'sukoon', 'shanti', 'theek', 'thik'
  ];
  if (calmWords.some(w => normalized.includes(w))) return 'Calm';

  return null;
}
