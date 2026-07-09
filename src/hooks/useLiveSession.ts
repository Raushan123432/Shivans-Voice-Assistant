import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, VoiceType } from '../types';
import liveSession from '../services/LiveSession';
import audioStreamer from '../services/AudioStreamer';
import { detectEmotion, UserEmotion } from '../utils/emotionDetector';

// Mobile haptic vibration helper
const triggerHaptic = (pattern: number | number[] = 15) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
};

export function useLiveSession() {
  const [appState, setAppState] = useState<AppState>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<{ text: string; isUser: boolean } | null>(null);
  const [voice, setVoiceState] = useState<VoiceType>('Zephyr');
  const [language, setLanguageState] = useState<string>('English');
  const [sensitivity, setSensitivityState] = useState<string>('medium');
  const [speakingRate, setSpeakingRateState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jarvis_speaking_rate');
      return stored ? parseFloat(stored) : 1.0;
    }
    return 1.0;
  });
  const [emotion, setEmotion] = useState<UserEmotion>('Calm');
  const [assistantName, setAssistantNameState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jarvis_assistant_name') || 'Jarvis';
    }
    return 'Jarvis';
  });

  // We use refs for callback state to avoid stale closures in events
  const transcriptRef = useRef<{ text: string; isUser: boolean } | null>(null);

  useEffect(() => {
    // Register our React callbacks into the singleton liveSession
    liveSession.registerCallbacks(
      (state) => {
        setAppState(state);
        // Trigger soft haptic pulses on major state transitions
        if (state === 'listening') {
          triggerHaptic([10, 30, 10]);
        } else if (state === 'speaking') {
          triggerHaptic(8);
        } else if (state === 'error') {
          triggerHaptic([50, 50, 50]);
        }
        
        // Clear error if successfully connected
        if (state === 'connected' || state === 'listening') {
          setErrorMessage(null);
        }
      },
      (text, isUser) => {
        const payload = { text, isUser };
        transcriptRef.current = payload;
        setTranscript(payload);

        // Detect emotion from the text spoken by user or assistant
        const detected = detectEmotion(text);
        if (detected) {
          setEmotion(detected);
        }
        
        // Auto-clear transcript after a short period if not speaking/listening
        if (!isUser) {
          // Keep AI speech transcript on screen a bit longer, then clear
          setTimeout(() => {
            if (transcriptRef.current?.text === text) {
              setTranscript(null);
            }
          }, 6000);
        } else {
          // User text
          setTimeout(() => {
            if (transcriptRef.current?.text === text) {
              setTranscript(null);
            }
          }, 4000);
        }
      },
      (errorMsg) => {
        setErrorMessage(errorMsg);
      }
    );

    // Initial sync
    liveSession.setVoice(voice);
    liveSession.setLanguage(language);
    liveSession.setSensitivity(sensitivity);
    liveSession.setAssistantName(assistantName);
    liveSession.setSpeakingRate(speakingRate);

    return () => {
      // Cleanup on unmount
      liveSession.disconnect();
    };
  }, []);

  const startSession = useCallback(() => {
    setErrorMessage(null);
    triggerHaptic(30);
    audioStreamer.playStartupChime();
    liveSession.connect();
  }, []);

  const stopSession = useCallback(() => {
    triggerHaptic([20, 15, 20]);
    audioStreamer.playShutdownChime();
    liveSession.disconnect();
  }, []);

  const changeAssistantName = useCallback((newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAssistantNameState(trimmed);
    localStorage.setItem('jarvis_assistant_name', trimmed);
    liveSession.setAssistantName(trimmed);
  }, []);

  const changeVoice = useCallback((newVoice: VoiceType) => {
    setVoiceState(newVoice);
    liveSession.setVoice(newVoice);
  }, []);

  const changeLanguage = useCallback((newLang: string) => {
    setLanguageState(newLang);
    liveSession.setLanguage(newLang);
  }, []);

  const changeSensitivity = useCallback((newSens: string) => {
    setSensitivityState(newSens);
    liveSession.setSensitivity(newSens);
  }, []);

  const changeSpeakingRate = useCallback((newRate: number) => {
    setSpeakingRateState(newRate);
    localStorage.setItem('jarvis_speaking_rate', newRate.toString());
    liveSession.setSpeakingRate(newRate);
  }, []);

  const changeEmotion = useCallback((newEmotion: UserEmotion) => {
    setEmotion(newEmotion);
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    liveSession.sendTextMessage(text);
  }, []);

  const isConnected = appState !== 'disconnected' && appState !== 'error' && appState !== 'connecting' && appState !== 'reconnecting';

  return {
    appState,
    errorMessage,
    transcript,
    voice,
    language,
    sensitivity,
    speakingRate,
    assistantName,
    emotion,
    isConnected,
    startSession,
    stopSession,
    changeVoice,
    changeLanguage,
    changeSensitivity,
    changeSpeakingRate,
    changeAssistantName,
    changeEmotion,
    sendTextMessage
  };
}

export default useLiveSession;
