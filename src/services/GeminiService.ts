import { VoiceType } from '../types';
import { SUPPORTED_VOICES } from '../utils/constants';

export class GeminiService {
  /**
   * Returns details of the voice model
   */
  public static getVoiceDetails(voiceId: VoiceType) {
    return SUPPORTED_VOICES.find((v) => v.id === voiceId) || SUPPORTED_VOICES[0];
  }

  /**
   * Simple connectivity helper to check if backend API holds a key
   */
  public static async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        return { ok: true, message: data.status || 'Backend connected.' };
      }
      return { ok: false, message: 'Server responded with error status.' };
    } catch (e: any) {
      return { ok: false, message: e.message || 'Could not connect to backend server.' };
    }
  }
}

export default GeminiService;
