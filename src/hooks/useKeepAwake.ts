import { useEffect, useRef } from 'react';
import { AppState } from '../types';

declare global {
  interface Window {
    AndroidBridge?: {
      setKeepAwake?: (awake: boolean) => void;
    };
    AndroidInterface?: {
      setKeepAwake?: (awake: boolean) => void;
    };
    expo?: {
      modules?: {
        ExpoKeepAwake?: {
          activate?: (tag: string) => Promise<boolean>;
          deactivate?: (tag: string) => Promise<boolean>;
        };
      };
    };
  }
}

/**
 * Custom hook to keep device screen awake while the AI Assistant
 * is actively listening, thinking, speaking, or connected.
 * 
 * Supports:
 * 1. HTML5 Screen Wake Lock API (Chrome/Safari/Android Chrome/PWA)
 * 2. Native Android App Bridge / Capacitor Keep Awake
 * 3. Expo Web / Hybrid Webview Keep Awake
 */
export function useKeepAwake(appState: AppState) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // States where the screen should remain awake
  const isActive = 
    appState === 'listening' ||
    appState === 'thinking' ||
    appState === 'speaking' ||
    appState === 'connecting' ||
    appState === 'connected' ||
    appState === 'reconnecting';

  useEffect(() => {
    let isMounted = true;
    const tag = 'babu-ai-assistant-session';

    const acquireKeepAwake = async () => {
      if (!isActive) return;

      // 1. Trigger Web Screen Wake Lock API (supported on Android Chrome, iOS Safari 16.4+, Chrome desktop)
      if ('wakeLock' in navigator && isMounted) {
        try {
          if (!wakeLockRef.current) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
            wakeLockRef.current.addEventListener('release', () => {
              wakeLockRef.current = null;
            });
          }
        } catch (err) {
          console.debug('Screen Wake Lock request failed or not allowed:', err);
        }
      }

      // 2. Trigger Android Native Bridge if running inside Android APK container
      try {
        if (window.AndroidBridge?.setKeepAwake) {
          window.AndroidBridge.setKeepAwake(true);
        } else if (window.AndroidInterface?.setKeepAwake) {
          window.AndroidInterface.setKeepAwake(true);
        }
      } catch (e) {
        console.debug('Android bridge keep awake error:', e);
      }

      // 3. Trigger Expo native module if present in Expo container
      try {
        if (window.expo?.modules?.ExpoKeepAwake?.activate) {
          await window.expo.modules.ExpoKeepAwake.activate(tag);
        }
      } catch (e) {
        console.debug('Expo module keep awake error:', e);
      }
    };

    const releaseKeepAwake = async () => {
      // 1. Release Web Screen Wake Lock
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch (err) {
          console.debug('Wake lock release error:', err);
        } finally {
          wakeLockRef.current = null;
        }
      }

      // 2. Release Android Native Bridge
      try {
        if (window.AndroidBridge?.setKeepAwake) {
          window.AndroidBridge.setKeepAwake(false);
        } else if (window.AndroidInterface?.setKeepAwake) {
          window.AndroidInterface.setKeepAwake(false);
        }
      } catch (e) {
        console.debug('Android bridge release error:', e);
      }

      // 3. Release Expo native module
      try {
        if (window.expo?.modules?.ExpoKeepAwake?.deactivate) {
          await window.expo.modules.ExpoKeepAwake.deactivate(tag);
        }
      } catch (e) {
        console.debug('Expo module release error:', e);
      }
    };

    if (isActive) {
      acquireKeepAwake();
    } else {
      releaseKeepAwake();
    }

    // Re-acquire wake lock if tab/app comes back into foreground while active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        acquireKeepAwake();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseKeepAwake();
    };
  }, [isActive, appState]);
}
