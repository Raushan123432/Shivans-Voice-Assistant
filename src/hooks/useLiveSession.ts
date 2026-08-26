import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, VoiceType } from '../types';
import liveSession from '../services/LiveSession';
import audioStreamer from '../services/AudioStreamer';
import clapDetector, { ClapSensitivity, ClapMode } from '../services/ClapDetector';
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
  const [appState, setAppState] = useState<AppState>('idle');
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
      return localStorage.getItem('jarvis_assistant_name') || 'Shivansh AI';
    }
    return 'Shivansh AI';
  });

  // Clap-to-Talk and Background Assistant State
  const [clapEnabled, setClapEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jarvis_clap_enabled');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });
  const [clapMode, setClapModeState] = useState<ClapMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('jarvis_clap_mode') as ClapMode) || 'single';
    }
    return 'single';
  });
  const [clapSensitivity, setClapSensitivityState] = useState<ClapSensitivity>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('jarvis_clap_sensitivity') as ClapSensitivity) || 'medium';
    }
    return 'medium';
  });
  const [backgroundModeEnabled, setBackgroundModeEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jarvis_bg_mode_enabled');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });

  const [clapNotice, setClapNotice] = useState<string | null>(null);

  // We use refs for callback state to avoid stale closures in events
  const transcriptRef = useRef<{ text: string; isUser: boolean } | null>(null);
  const appStateRef = useRef<AppState>('idle');
  appStateRef.current = appState;

  // Sync clap detector parameters
  useEffect(() => {
    clapDetector.setEnabled(clapEnabled);
    clapDetector.setMode(clapMode);
    clapDetector.setSensitivity(clapSensitivity);
  }, [clapEnabled, clapMode, clapSensitivity]);

  // AudioStreamer playback status sync -> suppress clap detection while AI is speaking
  useEffect(() => {
    audioStreamer.setPlaybackStatusCallback((isPlaying) => {
      clapDetector.setSpeaking(isPlaying);
    });
  }, []);

  // Background Mode & Visibility change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (backgroundModeEnabled) {
          console.log('[BackgroundMode] App tab minimized/hidden. Keeping background voice service active.');
        }
      } else {
        console.log('[BackgroundMode] App tab focused.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [backgroundModeEnabled]);

  // Main LiveSession and Clap callbacks registration
  useEffect(() => {
    // 1. Register LiveSession Callbacks
    liveSession.registerCallbacks(
      (state) => {
        setAppState(state);
        // Trigger soft haptic pulses on major state transitions
        if (state === 'listening') {
          triggerHaptic([10, 30, 10]);
          clapDetector.setSpeaking(false);
        } else if (state === 'speaking') {
          triggerHaptic(8);
          clapDetector.setSpeaking(true);
        } else if (state === 'error') {
          triggerHaptic([50, 50, 50]);
          clapDetector.setSpeaking(false);
        } else if (state === 'idle' || state === 'connected') {
          clapDetector.setSpeaking(false);
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

    // 2. Register ClapDetector Callbacks
    clapDetector.setCallbacks(
      (modeDetected) => {
        console.log(`[useLiveSession] 👏 Clap detected (${modeDetected})! Waking assistant...`);
        triggerHaptic([40, 20, 40]);
        setClapNotice(modeDetected === 'double' ? 'Double Clap Detected!' : 'Clap Detected!');
        setAppState('clap_detected');

        // Play wake chime
        audioStreamer.playListeningChime();

        setTimeout(() => {
          setClapNotice(null);
          // Connect or activate mic streaming
          if (!liveSession.getIsConnected()) {
            liveSession.connect();
          } else {
            liveSession.startMicStreaming();
          }
        }, 350);
      },
      (step) => {
        if (step === 'first_clap') {
          setClapNotice('First clap detected... clap again!');
          triggerHaptic(15);
        } else if (step === 'verified_clap') {
          setClapNotice('Double clap verified!');
        }
      }
    );

    // Start background clap detector listening
    if (clapEnabled) {
      clapDetector.start().catch((err) => {
        console.warn('[useLiveSession] Clap detector background start note:', err);
      });
    }

    // Initial sync
    liveSession.setVoice(voice);
    liveSession.setLanguage(language);
    liveSession.setSensitivity(sensitivity);
    liveSession.setAssistantName(assistantName);
    liveSession.setSpeakingRate(speakingRate);

    return () => {
      liveSession.disconnect();
      clapDetector.stop();
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

  const toggleClapEnabled = useCallback((enabled?: boolean) => {
    setClapEnabledState((prev) => {
      const nextVal = enabled !== undefined ? enabled : !prev;
      localStorage.setItem('jarvis_clap_enabled', String(nextVal));
      clapDetector.setEnabled(nextVal);
      if (nextVal) {
        clapDetector.start().catch(() => {});
      } else {
        clapDetector.stop();
      }
      return nextVal;
    });
  }, []);

  const changeClapMode = useCallback((mode: ClapMode) => {
    setClapModeState(mode);
    localStorage.setItem('jarvis_clap_mode', mode);
    clapDetector.setMode(mode);
  }, []);

  const changeClapSensitivity = useCallback((sens: ClapSensitivity) => {
    setClapSensitivityState(sens);
    localStorage.setItem('jarvis_clap_sensitivity', sens);
    clapDetector.setSensitivity(sens);
  }, []);

  const toggleBackgroundMode = useCallback((enabled?: boolean) => {
    setBackgroundModeEnabledState((prev) => {
      const nextVal = enabled !== undefined ? enabled : !prev;
      localStorage.setItem('jarvis_bg_mode_enabled', String(nextVal));
      return nextVal;
    });
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

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const retryMic = useCallback(() => {
    setErrorMessage(null);
    liveSession.startMicStreaming();
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
    clapEnabled,
    clapMode,
    clapSensitivity,
    clapNotice,
    backgroundModeEnabled,
    isConnected,
    startSession,
    stopSession,
    toggleClapEnabled,
    changeClapMode,
    changeClapSensitivity,
    toggleBackgroundMode,
    changeVoice,
    changeLanguage,
    changeSensitivity,
    changeSpeakingRate,
    changeAssistantName,
    changeEmotion,
    sendTextMessage,
    clearError,
    retryMic
  };
}

export default useLiveSession;
