import { useState, useEffect, useCallback } from 'react';
import audioStreamer from '../services/AudioStreamer';

export function useAudio() {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);

  // Synchronize state with audioStreamer
  useEffect(() => {
    audioStreamer.setMute(muted);
  }, [muted]);

  useEffect(() => {
    audioStreamer.setVolume(volume);
  }, [volume]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const changeVolume = useCallback((val: number) => {
    setVolume(val);
  }, []);

  // Return helper methods
  const getPlayerFrequency = useCallback(() => {
    return audioStreamer.getPlayerFrequencyData();
  }, []);

  const getMicFrequency = useCallback(() => {
    return audioStreamer.getMicFrequencyData();
  }, []);

  return {
    muted,
    volume,
    toggleMute,
    changeVolume,
    getPlayerFrequency,
    getMicFrequency
  };
}

export default useAudio;
