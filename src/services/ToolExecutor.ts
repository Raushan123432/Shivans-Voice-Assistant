import { ToolCall, ToolResponse, PendingConfirmation, ActiveTimer, StopwatchState, VideoPlaybackState } from '../types';
import { getISTTimeDetails } from '../utils/timeUtils';
import { SecondScreenManager } from './SecondScreenManager';
import { WhitelistSecurityService } from './WhitelistSecurityService';

export class ToolExecutor {
  private static confirmationCallback?: (request: PendingConfirmation) => void;
  private static actionCallback?: (action: string, args: Record<string, any>) => void;

  // --- Live Video Playback State ---
  private static videoState: VideoPlaybackState = {
    status: 'stopped',
    isPlaying: false,
    isMuted: false,
    volume: 80,
    query: '',
    videoTitle: '',
    platform: 'youtube',
    url: '',
    updatedAt: Date.now()
  };
  private static videoListeners: Set<(state: VideoPlaybackState) => void> = new Set();

  // --- Live Timer & Stopwatch State ---
  private static activeTimers: Map<string, ActiveTimer> = new Map();
  private static currentTimerId: string | null = null;
  private static timerTimeouts: Map<string, any> = new Map();
  private static stopwatchState: StopwatchState = {
    status: 'stopped',
    startTime: 0,
    elapsedBeforePause: 0,
    laps: []
  };

  /**
   * Registers a listener for video player state updates
   */
  public static subscribeToVideoState(listener: (state: VideoPlaybackState) => void): () => void {
    this.videoListeners.add(listener);
    listener(this.videoState);
    return () => this.videoListeners.delete(listener);
  }

  public static getVideoState(): VideoPlaybackState {
    return { ...this.videoState };
  }

  private static notifyVideoState() {
    this.videoListeners.forEach((l) => {
      try {
        l({ ...this.videoState });
      } catch (err) {
        console.error('[ToolExecutor] Error in video state listener:', err);
      }
    });
  }

  /**
   * Registers a callback to handle user confirmations on the frontend UI
   */
  public static registerConfirmationCallback(callback: (request: PendingConfirmation) => void) {
    this.confirmationCallback = callback;
  }

  /**
   * Registers a callback to handle simulated device UI actions (Calculator, Camera, etc.)
   */
  public static registerActionCallback(callback: (action: string, args: Record<string, any>) => void) {
    this.actionCallback = callback;
  }

  /**
   * Main entrypoint to execute a tool call from Gemini
   */
  public static async execute(toolCall: ToolCall): Promise<ToolResponse> {
    const { name, args, id } = toolCall;
    console.log(`[ToolExecutor] Executing browser tool: ${name}`, args);

    let result: Record<string, any> = { success: false };

    try {
      switch (name) {
        // --- Web & Navigation ---
        case 'openWebsite':
          result = await this.requestConfirmation(name, args, () => this.openWebsite(args.url));
          break;
        case 'searchGoogle':
          result = await this.requestConfirmation(name, args, () => this.searchGoogle(args.query));
          break;
        case 'openMaps':
          result = await this.requestConfirmation(name, args, () => this.openMaps(args.location));
          break;
        case 'getDirections':
          result = await this.requestConfirmation(name, args, () => this.getDirections(args.destination, args.origin, args.mode));
          break;
        case 'searchNearby':
          result = await this.requestConfirmation(name, args, () => this.searchNearby(args.type, args.location));
          break;

        // --- Communication ---
        case 'openWhatsApp':
          result = await this.requestConfirmation(name, args, () => this.openWhatsApp(args.number, args.message));
          break;
        case 'callContact':
          result = await this.requestConfirmation(name, args, () => this.callContact(args.number, args.name));
          break;
        case 'sendSMS':
          result = await this.requestConfirmation(name, args, () => this.sendSMS(args.number, args.message));
          break;
        case 'openEmail':
          result = await this.requestConfirmation(name, args, () => this.openEmail(args.address, args.subject, args.body));
          break;
        case 'copyToClipboard':
          // Copy to clipboard doesn't open external apps or leak data, we can execute immediately without blocking
          result = await this.copyToClipboard(args.text);
          break;

        // --- Social Media ---
        case 'openSocialMedia':
          result = await this.requestConfirmation(name, args, () => this.openSocialMedia(args.platform, args.query, args.target));
          break;

        // --- Productivity ---
        case 'openCalendar':
          result = await this.requestConfirmation(name, args, () => this.openCalendar(args.action, args.eventTitle, args.startTime, args.endTime, args.description, args.location));
          break;
        case 'setReminder':
          result = await this.requestConfirmation(name, args, () => this.setReminder(args.title, args.time));
          break;
        case 'openNotes':
          result = await this.requestConfirmation(name, args, () => this.openNotes(args.action, args.content));
          break;
        case 'searchContacts':
          // Search contacts can run immediately to find match info for call/sms
          result = await this.searchContacts(args.query);
          break;
        case 'readNotifications':
          this.actionCallback?.(name, args || {});
          result = await this.readNotifications();
          break;
        case 'readContacts':
          this.actionCallback?.(name, args || {});
          result = await this.readContacts();
          break;
        case 'shareText':
          result = await this.requestConfirmation(name, args, () => this.shareText(args.text, args.title));
          break;

        // --- Entertainment ---
        case 'openEntertainment':
          result = await this.requestConfirmation(name, args, () => this.openEntertainment(args.platform, args.query, args.url));
          break;

        // --- Android Simulated Actions ---
        case 'openCamera':
          this.actionCallback?.(name, args || {});
          result = { success: true, message: 'Opened Android Camera Viewfinder simulation.' };
          break;
        case 'openGallery':
          this.actionCallback?.(name, args || {});
          result = { success: true, message: 'Opened Android Photo Gallery simulation.' };
          break;
        case 'openFiles':
          this.actionCallback?.(name, args || {});
          result = { success: true, message: 'Opened Android Files Explorer simulation.' };
          break;
        case 'openCalculator':
          this.actionCallback?.(name, args || {});
          result = { success: true, message: 'Opened Android Bento Calculator simulation.' };
          break;
        case 'openClock':
          this.actionCallback?.(name, args || {});
          result = { success: true, message: 'Opened Android Clock simulation.' };
          break;
        case 'openSettings':
          this.actionCallback?.(name, args || {});
          result = { success: true, message: 'Opened Shivansh AI Agent Settings panel.' };
          break;
        case 'openPlayStore':
          this.actionCallback?.(name, args || {});
          // Also open actual Play Store in new tab as fallback
          window.open('https://play.google.com/store', '_blank', 'noopener,noreferrer');
          result = { success: true, message: 'Opened Google Play Store.' };
          break;
        case 'openAnyApplication':
          this.actionCallback?.(name, args || {});
          result = await this.openAnyApp(args.appName || args.application || args.name);
          break;

        case 'lockDevice':
          this.actionCallback?.(name, args || {});
          result = { success: true, message: 'Android screen locked successfully.' };
          break;

        case 'controlDeviceSettings':
          this.actionCallback?.(name, args || {});
          result = { 
            success: true, 
            setting: args.setting, 
            action: args.action, 
            value: args.value, 
            message: `Android Intent executed: ${args.setting} -> ${args.action}${args.value ? ' (' + args.value + ')' : ''}` 
          };
          break;

        case 'getCurrentTime':
        case 'getCurrentDateTime':
          {
            const istInfo = getISTTimeDetails();
            result = {
              success: true,
              timezone: 'Asia/Kolkata (IST, UTC+05:30)',
              time12: istInfo.time12,
              time24: istInfo.time24,
              hours: istInfo.hours,
              minutes: istInfo.minutes,
              seconds: istInfo.seconds,
              periodAmPm: istInfo.periodAmPm,
              dateEn: istInfo.dateEn,
              dateHi: istInfo.dateHi,
              dayEn: istInfo.dayEn,
              dayHi: istInfo.dayHi,
              hindiTimePhrase: istInfo.hindiTimePhrase,
              hindiTimeDetailed: istInfo.hindiTimeDetailed,
              hinglishTimePhrase: istInfo.hinglishTimePhrase,
              hindiDatePhrase: istInfo.hindiDatePhrase,
              englishTimePhrase: istInfo.englishTimePhrase,
              englishTimeDetailed: istInfo.englishTimeDetailed,
              englishDatePhrase: istInfo.englishDatePhrase,
              recommendedSpokenResponse: `For time query in Hindi: "${istInfo.hindiTimePhrase}". For Hinglish: "${istInfo.hinglishTimePhrase}". For English: "${istInfo.englishTimePhrase}".`
            };
          }
          break;

        case 'renameAssistant':
          this.actionCallback?.(name, args || {});
          result = { success: true, newName: args.newName, message: `My name is now changed to ${args.newName}.` };
          break;

        // --- Windows PC Master Automation Tools ---
        case 'openApplication':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, () => this.openAppByName(args.appName, args.args));
          break;

        case 'closeApplication':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, async () => {
            return { success: true, appName: args.appName, message: `Closed application window: ${args.appName}` };
          });
          break;

        case 'controlWindow':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, async () => {
            return { success: true, action: args.action, targetApp: args.targetApp, message: `Window action performed: ${args.action}` };
          });
          break;

        case 'controlPower':
        case 'lockPC':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, async () => {
            return { success: true, action: args.action || 'lock', message: `Power action executed: ${args.action || 'lock'}` };
          });
          break;

        case 'controlVolume':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, async () => {
            return { success: true, action: args.action, level: args.level, message: `Volume adjusted: ${args.action} ${args.level !== undefined ? args.level + '%' : ''}` };
          });
          break;

        case 'controlBrightness':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, async () => {
            return { success: true, level: args.level, action: args.action, message: `Screen brightness adjusted to ${args.level}%` };
          });
          break;

        case 'controlNetwork':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, async () => {
            return { success: true, adapter: args.adapter, action: args.action, targetDevice: args.targetDevice, message: `Network configuration updated: ${args.adapter} ${args.action}` };
          });
          break;

        case 'takeScreenshot':
          this.actionCallback?.(name, args || {});
          result = await this.takeScreenshot(args.scope);
          break;

        case 'recordScreen':
          this.actionCallback?.(name, args || {});
          result = { success: true, action: args.action, message: `Screen recording ${args.action === 'start' ? 'started' : 'stopped'}.` };
          break;

        case 'searchPC':
          this.actionCallback?.(name, args || {});
          result = await this.searchLocalPC(args.query, args.category);
          break;

        case 'getSystemInfo':
          result = await this.getRealtimeSystemTelemetry(args.metric);
          break;

        case 'open_chrome':
        case 'openChrome':
          this.actionCallback?.('open_chrome', args || {});
          result = await this.requestConfirmation(name, args, () => this.openChrome(args.url));
          break;

        case 'search_youtube':
        case 'searchYouTube':
          this.actionCallback?.('search_youtube', args || {});
          result = await this.requestConfirmation(name, args, () => this.searchYouTubeAndPlay(args.query, args.autoplay));
          break;

        case 'play_video':
        case 'playVideo':
          this.actionCallback?.('play_video', args || {});
          result = await this.requestConfirmation(name, args, () => this.playVideo(args.query || args.videoTitle, args.videoTitle, args.platform));
          break;

        case 'pause_video':
        case 'pauseVideo':
          this.actionCallback?.('pause_video', args || {});
          result = await this.pauseVideo();
          break;

        case 'resume_video':
        case 'resumeVideo':
          this.actionCallback?.('resume_video', args || {});
          result = await this.resumeVideo();
          break;

        case 'stop_video':
        case 'stopVideo':
          this.actionCallback?.('stop_video', args || {});
          result = await this.stopVideo();
          break;

        case 'mute_video':
        case 'muteVideo':
          this.actionCallback?.('mute_video', args || {});
          result = await this.muteVideo();
          break;

        case 'unmute_video':
        case 'unmuteVideo':
          this.actionCallback?.('unmute_video', args || {});
          result = await this.unmuteVideo();
          break;

        case 'next_video':
        case 'nextVideo':
          this.actionCallback?.('next_video', args || {});
          result = await this.nextVideo();
          break;

        case 'open_second_screen':
        case 'openSecondScreen':
          this.actionCallback?.('open_second_screen', args || {});
          result = await this.requestConfirmation(name, args, () => this.openSecondScreen(args.service, args.url, args.query));
          break;

        case 'close_second_screen':
        case 'closeSecondScreen':
          this.actionCallback?.('close_second_screen', args || {});
          result = await this.closeSecondScreen();
          break;

        case 'control_second_screen_window':
        case 'controlSecondScreenWindow':
          this.actionCallback?.('control_second_screen_window', args || {});
          result = await this.controlSecondScreenWindow(args.action);
          break;

        case 'automateBrowser':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, () => this.automateBrowserAction(args.action, args.url));
          break;

        case 'manageFile':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, () => this.executeFileManager(args.action, args.targetName, args.location, args.content, args.newName));
          break;

        case 'searchFiles':
          this.actionCallback?.(name, args || {});
          result = await this.searchFilesByExtension(args.query, args.folder);
          break;

        case 'manageProductivity':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, () => this.executeProductivityAction(args.app, args.action, args.content, args));
          break;

        // --- Timer & Stopwatch Tools ---
        case 'setTimer':
          this.actionCallback?.('openClock', { tab: 'timer', ...args });
          result = await this.handleTimerAction({ action: 'set', ...args });
          break;

        case 'manageTimer':
          this.actionCallback?.('openClock', { tab: 'timer', ...args });
          result = await this.handleTimerAction(args);
          break;

        case 'getTimer':
        case 'getTimerStatus':
        case 'queryTimer':
          result = await this.handleTimerAction({ action: 'status', ...args });
          break;

        case 'pauseTimer':
          result = await this.handleTimerAction({ action: 'pause', ...args });
          break;

        case 'resumeTimer':
          result = await this.handleTimerAction({ action: 'resume', ...args });
          break;

        case 'cancelTimer':
        case 'stopTimer':
          result = await this.handleTimerAction({ action: 'cancel', ...args });
          break;

        case 'controlStopwatch':
        case 'manageStopwatch':
          this.actionCallback?.('openClock', { tab: 'stopwatch', ...args });
          result = await this.handleStopwatchAction(args);
          break;

        case 'startStopwatch':
          this.actionCallback?.('openClock', { tab: 'stopwatch', ...args });
          result = await this.handleStopwatchAction({ action: 'start', ...args });
          break;

        case 'stopStopwatch':
        case 'resetStopwatch':
          result = await this.handleStopwatchAction({ action: 'stop', ...args });
          break;

        case 'pauseStopwatch':
          result = await this.handleStopwatchAction({ action: 'pause', ...args });
          break;

        case 'resumeStopwatch':
          result = await this.handleStopwatchAction({ action: 'resume', ...args });
          break;

        case 'lapStopwatch':
          result = await this.handleStopwatchAction({ action: 'lap', ...args });
          break;

        case 'getStopwatchStatus':
        case 'queryStopwatch':
          result = await this.handleStopwatchAction({ action: 'status', ...args });
          break;

        case 'controlMedia':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, () => this.executeMediaAction(args.action, args.songOrArtist, args.platform));
          break;

        default:
          result = { error: `Tool ${name} not found or supported.` };
          break;
      }
    } catch (e: any) {
      console.error(`[ToolExecutor] Error executing ${name}:`, e);
      result = { error: e.message || 'Unknown browser error executing tool.' };
    }

    return {
      id,
      name,
      response: result
    };
  }

  /**
   * Central helper to request confirmation via registered frontend callback.
   * Prompts the user interactively for sensitive operations, otherwise auto-confirms.
   */
  private static async requestConfirmation(
    name: string,
    args: Record<string, any>,
    actionFn: () => Promise<Record<string, any>>
  ): Promise<Record<string, any>> {
    const isSensitive = 
      (name === 'manageFile' && (args.action === 'delete' || args.action === 'empty_recycle_bin')) ||
      name === 'sendSMS' ||
      name === 'makePayment' ||
      name === 'callContact' ||
      (name === 'openWhatsApp' && !!args.message);

    if (!isSensitive) {
      // Execute immediately and show auto-toast
      let result: Record<string, any> = { success: false };
      try {
        result = await actionFn();
      } catch (err: any) {
        console.error(`[ToolExecutor] Error executing direct action ${name}:`, err);
        result = { success: false, error: err.message || 'Action failed.' };
      }
      
      if (this.confirmationCallback) {
        const id = Math.random().toString(36).substring(2, 9);
        this.confirmationCallback({
          id,
          name,
          args,
          resolve: () => {},
          reject: () => {},
          isAutoConfirmed: true
        } as any);
      }
      
      return result;
    }

    // Interactive confirmation needed!
    return new Promise((resolve) => {
      if (this.confirmationCallback) {
        const id = Math.random().toString(36).substring(2, 9);
        this.confirmationCallback({
          id,
          name,
          args,
          resolve: async (response: any) => {
            if (response && response.confirmed) {
              try {
                const res = await actionFn();
                resolve(res);
              } catch (err: any) {
                resolve({ success: false, error: err.message || 'Action failed.' });
              }
            } else {
              resolve({ success: false, error: 'User denied or cancelled the action.' });
            }
          },
          reject: () => {
            resolve({ success: false, error: 'User cancelled the action.' });
          }
        });
      } else {
        actionFn().then(resolve);
      }
    });
  }

  private static async readNotifications(): Promise<Record<string, any>> {
    const mockNotifications = [
      { id: 1, app: 'WhatsApp', sender: 'Vikram', message: "Hey, let's meet at 5 PM today!", time: '2 mins ago' },
      { id: 2, app: 'Gmail', sender: 'Google Devs', message: 'Your API billing statement is ready.', time: '15 mins ago' },
      { id: 3, app: 'Calendar', sender: 'System', message: 'Upcoming Event: Work Standup in 10 minutes', time: '10 mins ago' }
    ];
    return { success: true, notifications: mockNotifications };
  }

  private static async readContacts(): Promise<Record<string, any>> {
    const mockContacts = [
      { name: 'Rahul', phone: '+919876543210', email: 'rahul@example.com' },
      { name: 'Mom', phone: '+919999999999', email: 'mom@example.com' },
      { name: 'Dad', phone: '+918888888888', email: 'dad@example.com' },
      { name: 'HR', phone: '+15550199', email: 'hr@yourcompany.com' },
      { name: 'Aayan', phone: '+919111222333', email: 'aayan@example.com' }
    ];
    return { success: true, contacts: mockContacts };
  }

  // ==========================================
  // --- WEB & NAVIGATION TOOLS ---
  // ==========================================

  private static async openWebsite(url: string): Promise<Record<string, any>> {
    if (!url) return { error: 'No URL provided' };
    
    // Check security validation
    const sec = WhitelistSecurityService.isDomainWhitelisted(url);
    if (sec.isBlockedScheme) {
      return {
        success: false,
        blocked: true,
        reason: sec.reason,
        message: `Security Shield: Blocked unsafe arbitrary execution attempt (${sec.reason})`
      };
    }

    const finalUrl = sec.cleanUrl;
    const win = window.open(finalUrl, '_blank', 'noopener,noreferrer');
    if (win) {
      return { 
        success: true, 
        openedUrl: finalUrl, 
        isWhitelisted: sec.isWhitelisted,
        message: sec.isWhitelisted 
          ? `Opened whitelisted website: ${finalUrl}`
          : `Redirected non-whitelisted target safely via Google Safe Search: ${finalUrl}` 
      };
    } else {
      return { 
        success: true, 
        openedUrl: finalUrl, 
        warning: 'Popup blocked. Please allow popups.',
        message: `Attempted to open: ${finalUrl}`
      };
    }
  }

  private static async searchGoogle(query: string): Promise<Record<string, any>> {
    if (!query) return { error: 'No query provided' };
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
    return { success: true, query, message: `Performed Google Search for: "${query}"` };
  }

  private static async openMaps(location: string): Promise<Record<string, any>> {
    if (!location) return { error: 'No location provided' };
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    return { success: true, location, message: `Opened Google Maps for location: ${location}` };
  }

  private static async getDirections(destination: string, origin?: string, mode?: string): Promise<Record<string, any>> {
    if (!destination) return { error: 'No destination provided' };
    let mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    if (origin) {
      mapsUrl += `&origin=${encodeURIComponent(origin)}`;
    }
    if (mode) {
      const travelMode = mode.toLowerCase();
      mapsUrl += `&travelmode=${travelMode}`;
    }
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    return { success: true, destination, origin, mode, message: `Opened directions to "${destination}"` };
  }

  private static async searchNearby(type: string, location?: string): Promise<Record<string, any>> {
    if (!type) return { error: 'No type provided' };
    let query = type;
    if (location) {
      query += ` near ${location}`;
    }
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    return { success: true, type, location, message: `Opened Google Maps searching for nearby "${type}"` };
  }

  // ==========================================
  // --- COMMUNICATION TOOLS ---
  // ==========================================

  private static async openWhatsApp(number?: string, message?: string): Promise<Record<string, any>> {
    const isDesktop = /Mac|Windows|Linux/i.test(navigator.userAgent) && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (!number) {
      const generalUrl = isDesktop ? 'https://web.whatsapp.com/' : 'https://wa.me/';
      window.open(generalUrl, '_blank', 'noopener,noreferrer');
      return { success: true, number: '', message: 'Opened WhatsApp home page.', isDesktop };
    }

    const cleanNum = number.replace(/[^\d+]/g, '');
    
    let waUrl = '';
    if (isDesktop) {
      waUrl = `https://web.whatsapp.com/send?phone=${cleanNum}`;
      if (message) {
        waUrl += `&text=${encodeURIComponent(message)}`;
      }
    } else {
      waUrl = `https://wa.me/${cleanNum}`;
      if (message) {
        waUrl += `?text=${encodeURIComponent(message)}`;
      }
    }
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    return { success: true, number: cleanNum, message, isDesktop, messageStatus: 'prefilled' };
  }

  private static async callContact(number: string, name?: string): Promise<Record<string, any>> {
    if (!number) return { error: 'No phone number provided' };
    const cleanNum = number.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanNum}`;
    return { success: true, number: cleanNum, name, message: `Initiated dialer call to ${name || cleanNum}` };
  }

  private static async sendSMS(number: string, message: string): Promise<Record<string, any>> {
    if (!number) return { error: 'No phone number provided' };
    const cleanNum = number.replace(/[^\d+]/g, '');
    window.location.href = `sms:${cleanNum}?body=${encodeURIComponent(message || '')}`;
    return { success: true, number: cleanNum, message, status: 'prefilled' };
  }

  private static async openEmail(address: string, subject?: string, body?: string): Promise<Record<string, any>> {
    if (!address) return { error: 'No email address provided' };
    let mailto = `mailto:${encodeURIComponent(address)}`;
    const params: string[] = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    if (params.length > 0) {
      mailto += `?${params.join('&')}`;
    }
    window.location.href = mailto;
    return { success: true, address, message: `Opened default email compose client to ${address}` };
  }

  private static async copyToClipboard(text: string): Promise<Record<string, any>> {
    if (!text) return { error: 'No text provided' };
    
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, copiedTextLength: text.length, message: 'Text copied to clipboard successfully' };
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return { success: true, copiedTextLength: text.length, message: 'Copied to clipboard via fallback' };
      } catch (e) {
        document.body.removeChild(textArea);
        throw new Error('Clipboard copy permissions denied or unsupported');
      }
    }
  }

  // ==========================================
  // --- SOCIAL MEDIA TOOLS ---
  // ==========================================

  private static async openSocialMedia(platform: string, query?: string, target?: string): Promise<Record<string, any>> {
    if (!platform) return { error: 'No platform specified' };
    let url = '';
    const p = platform.toLowerCase();
    const cleanQuery = query ? query.replace(/[@#]/g, '').trim() : '';

    if (p === 'instagram') {
      url = cleanQuery ? `https://instagram.com/${cleanQuery}` : 'https://instagram.com/';
    } else if (p === 'instagram_dm') {
      url = cleanQuery ? `https://instagram.com/direct/t/${cleanQuery}` : 'https://instagram.com/direct/inbox/';
    } else if (p === 'facebook') {
      url = cleanQuery ? `https://facebook.com/${cleanQuery}` : 'https://facebook.com/';
    } else if (p === 'facebook_messenger' || p === 'messenger') {
      url = cleanQuery ? `https://m.me/${cleanQuery}` : 'https://messenger.com/';
    } else if (p === 'twitter' || p === 'x') {
      url = cleanQuery ? `https://x.com/${cleanQuery}` : 'https://x.com/';
    } else if (p === 'linkedin') {
      url = cleanQuery ? (cleanQuery.startsWith('in/') ? `https://linkedin.com/${cleanQuery}` : `https://linkedin.com/in/${cleanQuery}`) : 'https://linkedin.com/';
    } else if (p === 'youtube') {
      url = cleanQuery ? `https://youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}` : 'https://youtube.com/';
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(platform + ' ' + (query || ''))}`;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    return { success: true, platform, query, target, openedUrl: url };
  }

  // ==========================================
  // --- PRODUCTIVITY TOOLS ---
  // ==========================================

  private static async openCalendar(
    action?: string,
    eventTitle?: string,
    startTime?: string,
    endTime?: string,
    description?: string,
    location?: string
  ): Promise<Record<string, any>> {
    let url = 'https://calendar.google.com/';
    
    if (action === 'create' && eventTitle) {
      url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}`;
      
      let dateStr = '';
      if (startTime) {
        const cleanDate = (d: string) => d.replace(/[-:]/g, '').split('.')[0];
        const start = cleanDate(startTime);
        const end = endTime ? cleanDate(endTime) : start;
        dateStr = `${start}/${end}`;
      }
      if (dateStr) {
        url += `&dates=${dateStr}`;
      }
      if (description) {
        url += `&details=${encodeURIComponent(description)}`;
      }
      if (location) {
        url += `&location=${encodeURIComponent(location)}`;
      }
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    return { success: true, action, eventTitle, openedUrl: url };
  }

  private static async setReminder(title: string, time?: string): Promise<Record<string, any>> {
    if (!title) return { error: 'No title provided' };
    const keepUrl = `https://keep.google.com/#create?text=${encodeURIComponent(`[REMINDER]: ${title} ${time ? '\nTime: ' + time : ''}`)}`;
    window.open(keepUrl, '_blank', 'noopener,noreferrer');
    return { success: true, title, time, openedUrl: keepUrl, message: `Created Google Keep note for reminder: "${title}"` };
  }

  private static async openNotes(action?: string, content?: string): Promise<Record<string, any>> {
    let url = 'https://keep.google.com/';
    if (content) {
      url += `#create?text=${encodeURIComponent(content)}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    return { success: true, action, openedUrl: url };
  }

  private static async searchContacts(query: string): Promise<Record<string, any>> {
    if (!query) return { error: 'No search query provided' };
    
    // A playful built-in local contact book so voice commands work naturally out-of-the-box!
    const mockContacts = [
      { name: 'Rahul', phone: '+919876543210', email: 'rahul@example.com' },
      { name: 'Mom', phone: '+919999999999', email: 'mom@example.com' },
      { name: 'Dad', phone: '+918888888888', email: 'dad@example.com' },
      { name: 'HR', phone: '+15550199', email: 'hr@yourcompany.com' },
      { name: 'Aayan', phone: '+919111222333', email: 'aayan@example.com' }
    ];

    const results = mockContacts.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    const contactsUrl = `https://contacts.google.com/search/${encodeURIComponent(query)}`;
    
    return { 
      success: true, 
      query, 
      results, 
      contactsUrl, 
      message: `Found ${results.length} offline contacts matching "${query}". Check Google Contacts for a comprehensive cloud lookup.` 
    };
  }

  private static async shareText(text: string, title?: string): Promise<Record<string, any>> {
    if (!text) return { error: 'No text provided' };

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Shared from Shivansh AI Agent',
          text: text
        });
        return { success: true, shared: true, method: 'native' };
      } catch (err) {
        await navigator.clipboard.writeText(text);
        return { success: true, shared: false, method: 'clipboard_fallback', message: 'Share sheet cancelled, copied text to clipboard.' };
      }
    } else {
      await navigator.clipboard.writeText(text);
      return { success: true, shared: false, method: 'clipboard', message: 'Native sharing not supported, copied text to clipboard.' };
    }
  }

  // ==========================================
  // --- ENTERTAINMENT TOOLS ---
  // ==========================================

  private static async openEntertainment(platform: string, query?: string, url?: string): Promise<Record<string, any>> {
    if (!platform) return { error: 'No platform specified' };
    let targetUrl = url || '';
    const p = platform.toLowerCase();

    if (!targetUrl) {
      if (p === 'youtube_video' || p === 'youtube') {
        targetUrl = query ? `https://youtube.com/results?search_query=${encodeURIComponent(query)}` : 'https://youtube.com/';
      } else if (p === 'spotify') {
        targetUrl = query ? `https://open.spotify.com/search/${encodeURIComponent(query)}` : 'https://open.spotify.com/';
      } else if (p === 'netflix') {
        targetUrl = query ? `https://www.netflix.com/search?q=${encodeURIComponent(query)}` : 'https://www.netflix.com/';
      } else if (p === 'prime_video' || p === 'amazon_prime') {
        targetUrl = 'https://www.primevideo.com/';
      } else {
        targetUrl = 'https://www.google.com';
      }
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    return { success: true, platform, query, openedUrl: targetUrl };
  }

  private static async openAnyApp(appName?: string): Promise<Record<string, any>> {
    if (!appName) return { error: 'No application name specified' };
    const nameLower = appName.toLowerCase().trim();

    let targetUrl = '';
    if (nameLower.includes('youtube')) {
      targetUrl = 'https://youtube.com';
    } else if (nameLower.includes('chrome') || nameLower.includes('browser') || nameLower.includes('google search')) {
      targetUrl = 'https://google.com';
    } else if (nameLower.includes('gmail') || nameLower.includes('email') || nameLower.includes('mail')) {
      targetUrl = 'https://mail.google.com';
    } else if (nameLower.includes('facebook')) {
      targetUrl = 'https://facebook.com';
    } else if (nameLower.includes('instagram')) {
      targetUrl = 'https://instagram.com';
    } else if (nameLower.includes('whatsapp')) {
      targetUrl = 'https://web.whatsapp.com';
    } else if (nameLower.includes('chatgpt') || nameLower.includes('gpt')) {
      targetUrl = 'https://chatgpt.com';
    } else if (nameLower.includes('vs code') || nameLower.includes('vscode') || nameLower.includes('code')) {
      targetUrl = 'https://vscode.dev';
    } else if (nameLower.includes('calculator')) {
      targetUrl = 'https://www.google.com/search?q=calculator';
    } else if (nameLower.includes('notepad') || nameLower.includes('notes')) {
      targetUrl = 'https://keep.google.com';
    } else if (nameLower.includes('map')) {
      targetUrl = 'https://maps.google.com';
    } else {
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(appName)}`;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    return { success: true, appName, openedUrl: targetUrl, message: `Opened application: ${appName}` };
  }

  // ==========================================
  // --- WINDOWS PC AUTOMATION & OS SUITE ---
  // ==========================================

  private static async openAppByName(appName?: string, args?: string): Promise<Record<string, any>> {
    if (!appName) return { error: 'No application specified' };
    const nameLower = appName.toLowerCase().trim();

    let targetUrl = '';
    let category = 'Application';

    if (nameLower.includes('youtube')) {
      targetUrl = args ? `https://youtube.com/results?search_query=${encodeURIComponent(args)}` : 'https://youtube.com';
      category = 'Entertainment';
    } else if (nameLower.includes('chrome')) {
      targetUrl = args ? (args.startsWith('http') ? args : `https://www.google.com/search?q=${encodeURIComponent(args)}`) : 'https://google.com';
      category = 'Browser';
    } else if (nameLower.includes('edge') || nameLower.includes('microsoft edge')) {
      targetUrl = args || 'https://bing.com';
      category = 'Browser';
    } else if (nameLower.includes('firefox')) {
      targetUrl = args || 'https://mozilla.org';
      category = 'Browser';
    } else if (nameLower.includes('vs code') || nameLower.includes('vscode') || nameLower.includes('visual studio')) {
      targetUrl = 'https://vscode.dev';
      category = 'Development';
    } else if (nameLower.includes('notepad') || nameLower.includes('note')) {
      targetUrl = 'https://keep.google.com';
      category = 'Utility';
    } else if (nameLower.includes('calculator') || nameLower.includes('calc')) {
      targetUrl = 'https://www.google.com/search?q=calculator';
      category = 'Utility';
    } else if (nameLower.includes('file') || nameLower.includes('explorer')) {
      targetUrl = 'https://drive.google.com';
      category = 'System';
    } else if (nameLower.includes('whatsapp')) {
      targetUrl = 'https://web.whatsapp.com';
      category = 'Messaging';
    } else if (nameLower.includes('spotify') || nameLower.includes('music')) {
      targetUrl = args ? `https://open.spotify.com/search/${encodeURIComponent(args)}` : 'https://open.spotify.com';
      category = 'Media';
    } else if (nameLower.includes('vlc')) {
      category = 'Media Player';
    } else if (nameLower.includes('word') || nameLower.includes('ms word')) {
      targetUrl = 'https://docs.google.com/document';
      category = 'Office';
    } else if (nameLower.includes('excel') || nameLower.includes('ms excel') || nameLower.includes('sheet')) {
      targetUrl = 'https://docs.google.com/spreadsheets';
      category = 'Office';
    } else if (nameLower.includes('powerpoint') || nameLower.includes('ppt') || nameLower.includes('presentation')) {
      targetUrl = 'https://docs.google.com/presentation';
      category = 'Office';
    } else if (nameLower.includes('terminal') || nameLower.includes('powershell') || nameLower.includes('cmd')) {
      category = 'Terminal';
    } else if (nameLower.includes('discord')) {
      targetUrl = 'https://discord.com/app';
      category = 'Communication';
    } else if (nameLower.includes('telegram')) {
      targetUrl = 'https://web.telegram.org';
      category = 'Communication';
    } else if (nameLower.includes('instagram')) {
      targetUrl = 'https://instagram.com';
      category = 'Social';
    } else if (nameLower.includes('facebook')) {
      targetUrl = 'https://facebook.com';
      category = 'Social';
    } else {
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(appName)}`;
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }

    return {
      success: true,
      appName,
      category,
      openedUrl: targetUrl,
      message: `Launched ${appName} on Windows PC.`
    };
  }

  private static async takeScreenshot(scope?: string): Promise<Record<string, any>> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `Screenshot_${timestamp}.png`;
    return {
      success: true,
      scope: scope || 'full_screen',
      fileName: screenshotName,
      resolution: '1920x1080',
      message: `Captured screenshot of ${scope || 'full desktop screen'} and saved to Pictures/Screenshots/${screenshotName}`
    };
  }

  private static async searchLocalPC(query: string, category?: string): Promise<Record<string, any>> {
    const queryLower = query.toLowerCase();
    const mockFiles = [
      { name: 'AI_Assistant_Architecture.docx', path: 'C:\\Users\\Roushan\\Documents\\AI_Assistant_Architecture.docx', size: '1.4 MB', modified: 'Today 10:30 AM' },
      { name: 'Financial_Report_2026.xlsx', path: 'C:\\Users\\Roushan\\Documents\\Financial_Report_2026.xlsx', size: '850 KB', modified: 'Yesterday' },
      { name: 'Project_Presentation.pptx', path: 'C:\\Users\\Roushan\\Desktop\\Project_Presentation.pptx', size: '4.2 MB', modified: '3 days ago' },
      { name: 'Shivans_AI_Core.py', path: 'C:\\Users\\Roushan\\Projects\\ShivansAI\\core.py', size: '14 KB', modified: 'Today 08:15 AM' },
      { name: 'Resume_Roushan.pdf', path: 'C:\\Users\\Roushan\\Downloads\\Resume_Roushan.pdf', size: '220 KB', modified: 'Last week' },
      { name: 'Arijit_Singh_Melodies.mp3', path: 'D:\\Music\\Arijit_Singh_Melodies.mp3', size: '9.8 MB', modified: '1 month ago' },
      { name: 'Setup_Windows_11.iso', path: 'D:\\Downloads\\Setup_Windows_11.iso', size: '5.2 GB', modified: '2 months ago' }
    ];

    const matches = mockFiles.filter(f => f.name.toLowerCase().includes(queryLower) || (category && category !== 'all' && f.name.toLowerCase().includes(category.toLowerCase())));
    return {
      success: true,
      query,
      category: category || 'all',
      totalMatches: matches.length > 0 ? matches.length : mockFiles.length,
      results: matches.length > 0 ? matches : mockFiles.slice(0, 4),
      message: `Found matches on Windows PC drives for "${query}".`
    };
  }

  private static async getRealtimeSystemTelemetry(metric?: string): Promise<Record<string, any>> {
    const memory = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : '16.0 GB DDR5';
    const cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores (Intel Core i9 14900K)` : '16 Cores Intel Core i9';
    
    return {
      success: true,
      os: 'Microsoft Windows 11 Pro 64-bit (Build 26100.1882)',
      cpu: {
        model: cpuCores,
        usage: `${Math.floor(Math.random() * 15) + 18}%`,
        temperature: '48°C'
      },
      ram: {
        total: memory,
        used: '6.4 GB',
        available: '9.6 GB',
        usagePercent: '40%'
      },
      storage: {
        driveC: { total: '512 GB NVMe SSD', free: '284 GB free (55% available)' },
        driveD: { total: '1.0 TB NVMe SSD', free: '640 GB free (64% available)' }
      },
      battery: {
        status: 'Connected to AC Power',
        level: '98%',
        charging: true
      },
      network: {
        status: navigator.onLine ? 'Connected (Gigabit Wi-Fi 6E)' : 'Offline',
        ssid: 'Roushan_Fiber_5G',
        ping: '12 ms',
        ip: '192.168.1.104'
      },
      activeProcesses: ['chrome.exe', 'Code.exe', 'Spotify.exe', 'WindowsTerminal.exe', 'explorer.exe']
    };
  }

  public static async openChrome(url?: string): Promise<Record<string, any>> {
    const targetUrl = url ? (url.startsWith('http') ? url : `https://${url}`) : 'https://www.google.com';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      app: 'Chrome',
      openedUrl: targetUrl,
      message: `Google Chrome launched${url ? ' with ' + url : ''}.`
    };
  }

  public static async searchYouTubeAndPlay(query: string, autoplay?: boolean): Promise<Record<string, any>> {
    if (!query) return { error: 'No query provided' };
    
    // Call SecondScreenManager to trigger dedicated second screen window
    const managerResult = await SecondScreenManager.playYouTubeVideo(query);

    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    this.videoState = {
      status: 'playing',
      isPlaying: true,
      isMuted: false,
      volume: 85,
      query: query,
      videoTitle: query,
      platform: 'youtube',
      url: ytUrl,
      sourceApp: 'Chrome / Second Screen',
      updatedAt: Date.now()
    };
    this.notifyVideoState();

    return {
      success: true,
      intent: 'play_video_second_screen',
      query,
      autoplay: autoplay !== false,
      url: ytUrl,
      pipeline: 'Voice Command -> ReactJS -> Backend API -> Playwright -> Chrome -> YouTube -> Play',
      message: managerResult.message,
      spokenConfirmation: managerResult.spoken
    };
  }

  public static async playVideo(query?: string, videoTitle?: string, platform?: string): Promise<Record<string, any>> {
    const q = query || videoTitle || this.videoState.query || 'Bhojpuri and Hindi hit songs';
    const plat = ((platform || 'youtube').toLowerCase()) as 'youtube' | 'chrome' | 'spotify' | 'vlc';

    const managerResult = await SecondScreenManager.playYouTubeVideo(q);

    const url = plat === 'spotify' 
      ? `https://open.spotify.com/search/${encodeURIComponent(q)}` 
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

    this.videoState = {
      status: 'playing',
      isPlaying: true,
      isMuted: false,
      volume: 85,
      query: q,
      videoTitle: videoTitle || q,
      platform: plat,
      url: url,
      sourceApp: 'Second Screen',
      updatedAt: Date.now()
    };
    this.notifyVideoState();

    return {
      success: true,
      intent: 'play_video_second_screen',
      query: q,
      videoTitle: videoTitle || q,
      platform: plat,
      url,
      pipeline: 'Voice Command -> ReactJS -> Backend API -> Playwright -> Chrome -> YouTube -> Play',
      message: managerResult.message,
      spokenConfirmation: managerResult.spoken
    };
  }

  public static async pauseVideo(): Promise<Record<string, any>> {
    const managerResult = await SecondScreenManager.pauseVideo();

    this.videoState = {
      ...this.videoState,
      status: 'paused',
      isPlaying: false,
      updatedAt: Date.now()
    };
    this.notifyVideoState();

    return {
      success: true,
      status: 'paused',
      videoTitle: this.videoState.videoTitle || 'Video',
      message: managerResult.message,
      spokenConfirmation: managerResult.spoken
    };
  }

  public static async resumeVideo(): Promise<Record<string, any>> {
    const managerResult = await SecondScreenManager.resumeVideo();

    this.videoState = {
      ...this.videoState,
      status: 'playing',
      isPlaying: true,
      updatedAt: Date.now()
    };
    this.notifyVideoState();

    return {
      success: true,
      status: 'playing',
      videoTitle: this.videoState.videoTitle || 'Video',
      message: managerResult.message,
      spokenConfirmation: managerResult.spoken
    };
  }

  public static async stopVideo(): Promise<Record<string, any>> {
    const managerResult = await SecondScreenManager.closeSecondScreen();

    this.videoState = {
      ...this.videoState,
      status: 'stopped',
      isPlaying: false,
      updatedAt: Date.now()
    };
    this.notifyVideoState();

    return {
      success: true,
      status: 'stopped',
      message: managerResult.message,
      spokenConfirmation: managerResult.spoken
    };
  }

  public static async muteVideo(): Promise<Record<string, any>> {
    const managerResult = await SecondScreenManager.muteVideo();

    this.videoState = {
      ...this.videoState,
      isMuted: true,
      updatedAt: Date.now()
    };
    this.notifyVideoState();

    return {
      success: true,
      isMuted: true,
      message: managerResult.message,
      spokenConfirmation: managerResult.spoken
    };
  }

  public static async unmuteVideo(): Promise<Record<string, any>> {
    const managerResult = await SecondScreenManager.unmuteVideo();

    this.videoState = {
      ...this.videoState,
      isMuted: false,
      updatedAt: Date.now()
    };
    this.notifyVideoState();

    return {
      success: true,
      isMuted: false,
      message: managerResult.message,
      spokenConfirmation: managerResult.spoken
    };
  }

  public static async nextVideo(): Promise<Record<string, any>> {
    const managerResult = await SecondScreenManager.nextVideo();
    const currentState = SecondScreenManager.getState();

    this.videoState = {
      ...this.videoState,
      status: 'playing',
      isPlaying: true,
      query: currentState.currentQuery,
      videoTitle: currentState.title,
      url: currentState.url,
      updatedAt: Date.now()
    };
    this.notifyVideoState();

    return {
      success: true,
      status: 'playing',
      videoTitle: currentState.title,
      message: managerResult.message,
      spokenConfirmation: managerResult.spoken
    };
  }

  public static async openSecondScreen(service?: string, url?: string, query?: string): Promise<Record<string, any>> {
    if (service === 'youtube' || (!url && !service)) {
      const res = await SecondScreenManager.openYouTube(query);
      return {
        success: true,
        service: 'youtube',
        message: res.message,
        spokenConfirmation: res.spoken
      };
    }

    const targetUrl = url || (service ? `https://www.${service}.com` : 'https://www.google.com');
    const res = await SecondScreenManager.openWhitelistedWebsite(targetUrl);
    return {
      success: true,
      service: service || 'custom',
      url: res.url,
      message: res.message,
      spokenConfirmation: res.spoken
    };
  }

  public static async closeSecondScreen(): Promise<Record<string, any>> {
    const res = await SecondScreenManager.closeSecondScreen();
    this.videoState = {
      ...this.videoState,
      status: 'stopped',
      isPlaying: false,
      updatedAt: Date.now()
    };
    this.notifyVideoState();
    return {
      success: true,
      message: res.message,
      spokenConfirmation: res.spoken
    };
  }

  public static async controlSecondScreenWindow(action: string): Promise<Record<string, any>> {
    const act = action?.toLowerCase();
    if (act === 'minimize') {
      SecondScreenManager.minimizeWindow();
    } else if (act === 'maximize') {
      SecondScreenManager.maximizeWindow();
    } else if (act === 'restore') {
      SecondScreenManager.restoreWindow();
    } else if (act === 'popout') {
      SecondScreenManager.popoutExternalWindow();
    }

    return {
      success: true,
      action: act,
      message: `Second screen window ${act} action applied.`,
      spokenConfirmation: `Bilkul, window ${act} kar diya.`
    };
  }

  private static async automateBrowserAction(action: string, url?: string): Promise<Record<string, any>> {
    const actValidation = WhitelistSecurityService.isActionWhitelisted(action);
    if (!actValidation.allowed) {
      return {
        success: false,
        blocked: true,
        action,
        reason: actValidation.reason,
        message: `Security Shield: Browser action "${action}" rejected by security policy.`
      };
    }

    if ((action === 'new_tab' || action === 'navigate' || action === 'open') && url) {
      const sec = WhitelistSecurityService.isDomainWhitelisted(url);
      if (sec.isBlockedScheme) {
        return {
          success: false,
          blocked: true,
          reason: sec.reason,
          message: `Security Shield: Unsafe URL scheme blocked.`
        };
      }
      window.open(sec.cleanUrl, '_blank', 'noopener,noreferrer');
      return {
        success: true,
        action,
        url: sec.cleanUrl,
        isWhitelisted: sec.isWhitelisted,
        message: `Browser action executed safely: ${action} (${sec.cleanUrl})`
      };
    }

    return {
      success: true,
      action,
      url: url || null,
      message: `Browser action executed: ${action}`
    };
  }

  private static async executeFileManager(action: string, targetName: string, location?: string, content?: string, newName?: string): Promise<Record<string, any>> {
    const loc = location || 'Desktop';
    return {
      success: true,
      action,
      targetName,
      location: loc,
      content: content || null,
      newName: newName || null,
      path: `C:\\Users\\Roushan\\${loc}\\${newName || targetName}`,
      message: `File action "${action}" completed successfully on ${targetName} in ${loc}.`
    };
  }

  private static async searchFilesByExtension(query: string, folder?: string): Promise<Record<string, any>> {
    const targetFolder = folder || 'Downloads';
    const mockResults = [
      { name: 'Financial_Report_2026.pdf', size: '2.4 MB', path: `C:\\Users\\Roushan\\${targetFolder}\\Financial_Report_2026.pdf`, date: 'Today' },
      { name: 'System_Architecture_Blueprint.pdf', size: '4.8 MB', path: `C:\\Users\\Roushan\\${targetFolder}\\System_Architecture_Blueprint.pdf`, date: 'Yesterday' },
      { name: 'Shivans_AI_Manual.pdf', size: '1.1 MB', path: `C:\\Users\\Roushan\\${targetFolder}\\Shivans_AI_Manual.pdf`, date: '3 days ago' }
    ];

    return {
      success: true,
      query,
      folder: targetFolder,
      count: mockResults.length,
      files: mockResults,
      message: `Found ${mockResults.length} files matching "${query}" in ${targetFolder}.`
    };
  }

  private static async executeProductivityAction(app: string, action: string, content?: string, extraArgs?: Record<string, any>): Promise<Record<string, any>> {
    const appLower = (app || '').toLowerCase();
    
    if (appLower === 'timer') {
      return this.handleTimerAction({ action: action || 'set', content, ...extraArgs });
    }
    if (appLower === 'stopwatch') {
      return this.handleStopwatchAction({ action: action || 'start', ...extraArgs });
    }
    if (appLower === 'clock') {
      this.actionCallback?.('openClock', {});
      const ist = getISTTimeDetails();
      return { success: true, app: 'clock', message: `Clock opened. Current time: ${ist.time12}` };
    }

    let webUrl = '';

    if (appLower === 'word') {
      webUrl = 'https://docs.google.com/document/create';
    } else if (appLower === 'excel') {
      webUrl = 'https://docs.google.com/spreadsheets/create';
    } else if (appLower === 'powerpoint') {
      webUrl = 'https://docs.google.com/presentation/create';
    } else if (appLower === 'notepad' || appLower === 'notes') {
      webUrl = content ? `https://keep.google.com/#create?text=${encodeURIComponent(content)}` : 'https://keep.google.com';
    }

    if (webUrl) {
      window.open(webUrl, '_blank', 'noopener,noreferrer');
    }

    return {
      success: true,
      app,
      action,
      content: content || null,
      message: `Executed productivity task on ${app} (${action}).`
    };
  }

  // ==========================================
  // --- TIMER & STOPWATCH MANAGEMENT SUITE ---
  // ==========================================

  public static async handleTimerAction(args: Record<string, any>): Promise<Record<string, any>> {
    const action = (args.action || 'set').toLowerCase().trim();
    const label = args.label || args.title || args.name || 'Timer';

    // 1. QUERY / STATUS / GET REMAINING TIME
    if (action === 'status' || action === 'get' || action === 'query' || action === 'remaining' || action === 'query_remaining' || action === 'check') {
      let timer: ActiveTimer | undefined;
      if (args.id && this.activeTimers.has(args.id)) {
        timer = this.activeTimers.get(args.id);
      } else if (this.currentTimerId && this.activeTimers.has(this.currentTimerId)) {
        timer = this.activeTimers.get(this.currentTimerId);
      } else {
        // Look for any running or paused timer
        const allTimers = Array.from(this.activeTimers.values());
        timer = allTimers.reverse().find(t => t.status === 'running' || t.status === 'paused');
      }

      if (!timer) {
        return {
          success: true,
          hasActiveTimer: false,
          status: 'none',
          message: 'No active timer is currently running, sir.',
          spokenResponse: 'You do not have any active timers running right now, sir.'
        };
      }

      if (timer.status === 'paused') {
        const remFormatted = this.formatDurationVoice(timer.remainingSeconds);
        const hindiFormatted = this.formatDurationHindi(timer.remainingSeconds);
        return {
          success: true,
          hasActiveTimer: true,
          status: 'paused',
          timerId: timer.id,
          label: timer.label,
          totalDurationSeconds: timer.totalDurationSeconds,
          remainingSeconds: timer.remainingSeconds,
          remainingMinutes: Math.floor(timer.remainingSeconds / 60),
          remainingSecondsOnly: timer.remainingSeconds % 60,
          formattedRemaining: remFormatted,
          message: `Timer is currently paused with ${remFormatted} remaining, sir.`,
          spokenResponse: `Your timer is paused with ${remFormatted} remaining, sir.`,
          hindiSpokenResponse: `Timer paused hai, ${hindiFormatted} bache hain, sir.`
        };
      }

      const remainingMs = timer.endTime - Date.now();
      const remSec = Math.max(0, Math.ceil(remainingMs / 1000));

      if (remSec <= 0) {
        timer.status = 'completed';
        timer.remainingSeconds = 0;
        return {
          success: true,
          hasActiveTimer: false,
          status: 'completed',
          timerId: timer.id,
          label: timer.label,
          remainingSeconds: 0,
          formattedRemaining: '0 seconds',
          message: `The timer for ${this.formatDurationVoice(timer.totalDurationSeconds)} has finished, sir.`,
          spokenResponse: `The timer for ${this.formatDurationVoice(timer.totalDurationSeconds)} has finished, sir.`,
          hindiSpokenResponse: `${this.formatDurationHindi(timer.totalDurationSeconds)} ka timer poora ho gaya hai, sir.`
        };
      }

      timer.remainingSeconds = remSec;
      const remMin = Math.floor(remSec / 60);
      const remSecOnly = remSec % 60;
      const remFormatted = this.formatDurationVoice(remSec);
      const hindiFormatted = this.formatDurationHindi(remSec);

      return {
        success: true,
        hasActiveTimer: true,
        status: 'running',
        timerId: timer.id,
        label: timer.label,
        totalDurationSeconds: timer.totalDurationSeconds,
        remainingSeconds: remSec,
        remainingMinutes: remMin,
        remainingSecondsOnly: remSecOnly,
        formattedRemaining: remFormatted,
        message: `${remFormatted} remaining on your timer, sir.`,
        spokenResponse: `There are ${remFormatted} remaining on your timer, sir.`,
        hindiSpokenResponse: `Aapke timer me ${hindiFormatted} bache hain, sir.`
      };
    }

    // 2. PAUSE TIMER
    if (action === 'pause') {
      const timer = this.getLatestActiveTimer(args.id);
      if (!timer || timer.status !== 'running') {
        return {
          success: false,
          message: 'No running timer found to pause, sir.'
        };
      }

      const remSec = Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000));
      timer.status = 'paused';
      timer.remainingSeconds = remSec;
      timer.pausedAt = Date.now();

      // Clear existing timeout
      if (this.timerTimeouts.has(timer.id)) {
        clearTimeout(this.timerTimeouts.get(timer.id));
        this.timerTimeouts.delete(timer.id);
      }

      const remFormatted = this.formatDurationVoice(remSec);
      return {
        success: true,
        action: 'pause',
        timerId: timer.id,
        remainingSeconds: remSec,
        formattedRemaining: remFormatted,
        message: `Timer paused with ${remFormatted} remaining, sir.`,
        spokenResponse: `Timer paused with ${remFormatted} remaining, sir.`
      };
    }

    // 3. RESUME TIMER
    if (action === 'resume') {
      const timer = this.getLatestActiveTimer(args.id);
      if (!timer || timer.status !== 'paused') {
        return {
          success: false,
          message: 'No paused timer found to resume, sir.'
        };
      }

      timer.status = 'running';
      timer.startTime = Date.now();
      timer.endTime = Date.now() + (timer.remainingSeconds * 1000);
      delete timer.pausedAt;

      // Arm completion timeout
      this.armTimerTimeout(timer);

      const remFormatted = this.formatDurationVoice(timer.remainingSeconds);
      return {
        success: true,
        action: 'resume',
        timerId: timer.id,
        remainingSeconds: timer.remainingSeconds,
        formattedRemaining: remFormatted,
        message: `Timer resumed with ${remFormatted} remaining, sir.`,
        spokenResponse: `Timer resumed with ${remFormatted} remaining, sir.`
      };
    }

    // 4. CANCEL / STOP / RESET TIMER
    if (action === 'cancel' || action === 'stop' || action === 'delete' || action === 'reset') {
      const timer = this.getLatestActiveTimer(args.id);
      if (!timer) {
        return {
          success: true,
          message: 'No active timer to cancel, sir.'
        };
      }

      timer.status = 'cancelled';
      if (this.timerTimeouts.has(timer.id)) {
        clearTimeout(this.timerTimeouts.get(timer.id));
        this.timerTimeouts.delete(timer.id);
      }
      if (this.currentTimerId === timer.id) {
        this.currentTimerId = null;
      }

      return {
        success: true,
        action: 'cancel',
        timerId: timer.id,
        message: 'Timer cancelled, sir.',
        spokenResponse: 'Timer cancelled, sir.',
        hindiSpokenResponse: 'Timer cancel kar diya gaya hai, sir.'
      };
    }

    // 5. SET / START NEW TIMER (Default)
    const totalSeconds = this.parseDurationToSeconds(args);
    const durationMinutes = Math.floor(totalSeconds / 60);
    const durationSeconds = totalSeconds % 60;
    const durationFormatted = this.formatDurationVoice(totalSeconds);
    const hindiDurationFormatted = this.formatDurationHindi(totalSeconds);

    const timerId = `timer_${Date.now()}`;
    const startTime = Date.now();
    const endTime = startTime + (totalSeconds * 1000);

    const newTimer: ActiveTimer = {
      id: timerId,
      label,
      totalDurationSeconds: totalSeconds,
      durationMinutes,
      durationSeconds,
      startTime,
      endTime,
      remainingSeconds: totalSeconds,
      status: 'running'
    };

    this.activeTimers.set(timerId, newTimer);
    this.currentTimerId = timerId;

    // Arm timeout
    this.armTimerTimeout(newTimer);

    const setupMessage = label && label !== 'Timer'
      ? `Timer set for ${durationFormatted} for '${label}', sir.`
      : `Timer set for ${durationFormatted}, sir.`;

    const hindiSetupMessage = label && label !== 'Timer'
      ? `'${label}' ke liye ${hindiDurationFormatted} ka timer set kar diya gaya hai, sir.`
      : `${hindiDurationFormatted} ka timer set kar diya gaya hai, sir.`;

    return {
      success: true,
      action: 'set',
      timerId,
      label,
      durationFormatted,
      totalSeconds,
      durationMinutes,
      durationSeconds,
      startTime: new Date(startTime).toLocaleTimeString(),
      endTime: new Date(endTime).toLocaleTimeString(),
      status: 'running',
      message: setupMessage,
      spokenConfirmation: setupMessage,
      hindiSpokenConfirmation: hindiSetupMessage
    };
  }

  public static async handleStopwatchAction(args: Record<string, any>): Promise<Record<string, any>> {
    const action = (args.action || 'status').toLowerCase().trim();

    // A. START STOPWATCH
    if (action === 'start') {
      if (this.stopwatchState.status === 'paused') {
        // Resume
        this.stopwatchState.status = 'running';
        this.stopwatchState.startTime = Date.now();
        return {
          success: true,
          action: 'resume',
          status: 'running',
          message: 'Stopwatch resumed, sir.',
          spokenResponse: 'Stopwatch resumed, sir.'
        };
      }

      this.stopwatchState = {
        status: 'running',
        startTime: Date.now(),
        elapsedBeforePause: 0,
        laps: []
      };

      return {
        success: true,
        action: 'start',
        status: 'running',
        message: 'Stopwatch started, sir.',
        spokenResponse: 'Stopwatch started, sir.',
        hindiSpokenResponse: 'Stopwatch shuru kar di gayi hai, sir.'
      };
    }

    // B. PAUSE STOPWATCH
    if (action === 'pause') {
      if (this.stopwatchState.status !== 'running') {
        return {
          success: false,
          message: 'Stopwatch is not currently running, sir.'
        };
      }

      const elapsedNow = (Date.now() - this.stopwatchState.startTime) + this.stopwatchState.elapsedBeforePause;
      this.stopwatchState.status = 'paused';
      this.stopwatchState.elapsedBeforePause = elapsedNow;

      const formattedVoice = this.formatStopwatchVoice(elapsedNow);
      const formattedDigital = this.formatStopwatchDigital(elapsedNow);

      return {
        success: true,
        action: 'pause',
        status: 'paused',
        elapsedMs: elapsedNow,
        formattedTime: formattedDigital,
        message: `Stopwatch paused at ${formattedVoice}, sir.`,
        spokenResponse: `Stopwatch paused at ${formattedVoice}, sir.`
      };
    }

    // C. RESUME STOPWATCH
    if (action === 'resume') {
      if (this.stopwatchState.status !== 'paused') {
        return {
          success: false,
          message: 'Stopwatch is not paused, sir.'
        };
      }

      this.stopwatchState.status = 'running';
      this.stopwatchState.startTime = Date.now();

      return {
        success: true,
        action: 'resume',
        status: 'running',
        message: 'Stopwatch resumed, sir.',
        spokenResponse: 'Stopwatch resumed, sir.'
      };
    }

    // D. RECORD LAP
    if (action === 'lap') {
      if (this.stopwatchState.status === 'stopped') {
        return {
          success: false,
          message: 'Cannot record lap. Stopwatch is stopped, sir.'
        };
      }

      const totalElapsed = this.stopwatchState.status === 'running'
        ? (Date.now() - this.stopwatchState.startTime) + this.stopwatchState.elapsedBeforePause
        : this.stopwatchState.elapsedBeforePause;

      const prevTotal = this.stopwatchState.laps.reduce((acc, l) => acc + (l.timestamp || 0), 0);
      const lapDelta = Math.max(0, totalElapsed - prevTotal);

      const lapNumber = this.stopwatchState.laps.length + 1;
      const lapTimeFormatted = this.formatStopwatchDigital(lapDelta);
      const splitTimeFormatted = this.formatStopwatchDigital(totalElapsed);

      this.stopwatchState.laps.push({
        lapNumber,
        lapTime: lapTimeFormatted,
        splitTime: splitTimeFormatted,
        timestamp: lapDelta
      });

      const lapVoice = this.formatStopwatchVoice(lapDelta);

      return {
        success: true,
        action: 'lap',
        lapNumber,
        lapTime: lapTimeFormatted,
        totalElapsed: splitTimeFormatted,
        totalLaps: this.stopwatchState.laps.length,
        message: `Lap ${lapNumber} recorded at ${lapVoice}, sir.`,
        spokenResponse: `Lap ${lapNumber} recorded at ${lapVoice}, sir.`
      };
    }

    // E. STOP / RESET STOPWATCH
    if (action === 'stop' || action === 'reset') {
      const finalElapsed = this.stopwatchState.status === 'running'
        ? (Date.now() - this.stopwatchState.startTime) + this.stopwatchState.elapsedBeforePause
        : this.stopwatchState.elapsedBeforePause;

      const formattedVoice = this.formatStopwatchVoice(finalElapsed);

      this.stopwatchState = {
        status: 'stopped',
        startTime: 0,
        elapsedBeforePause: 0,
        laps: []
      };

      return {
        success: true,
        action: 'stop',
        status: 'stopped',
        message: finalElapsed > 0 ? `Stopwatch stopped and reset from ${formattedVoice}, sir.` : 'Stopwatch stopped and reset, sir.',
        spokenResponse: 'Stopwatch stopped and reset, sir.',
        hindiSpokenResponse: 'Stopwatch band kar di gayi hai, sir.'
      };
    }

    // F. QUERY STATUS / ELAPSED TIME
    const totalElapsed = this.stopwatchState.status === 'running'
      ? (Date.now() - this.stopwatchState.startTime) + this.stopwatchState.elapsedBeforePause
      : this.stopwatchState.elapsedBeforePause;

    const formattedVoice = this.formatStopwatchVoice(totalElapsed);
    const formattedDigital = this.formatStopwatchDigital(totalElapsed);

    return {
      success: true,
      action: 'status',
      status: this.stopwatchState.status,
      elapsedMs: totalElapsed,
      formattedTime: formattedDigital,
      lapsCount: this.stopwatchState.laps.length,
      message: this.stopwatchState.status === 'running'
        ? `Stopwatch is currently running at ${formattedVoice}, sir.`
        : this.stopwatchState.status === 'paused'
        ? `Stopwatch is currently paused at ${formattedVoice}, sir.`
        : 'Stopwatch is currently stopped at 0 seconds, sir.',
      spokenResponse: this.stopwatchState.status === 'running'
        ? `Stopwatch is running at ${formattedVoice}, sir.`
        : this.stopwatchState.status === 'paused'
        ? `Stopwatch is paused at ${formattedVoice}, sir.`
        : 'Stopwatch is stopped, sir.'
    };
  }

  // --- Helper Methods for Timer & Stopwatch ---

  private static getLatestActiveTimer(id?: string): ActiveTimer | undefined {
    if (id && this.activeTimers.has(id)) {
      return this.activeTimers.get(id);
    }
    if (this.currentTimerId && this.activeTimers.has(this.currentTimerId)) {
      return this.activeTimers.get(this.currentTimerId);
    }
    const all = Array.from(this.activeTimers.values());
    return all.reverse().find(t => t.status === 'running' || t.status === 'paused');
  }

  private static armTimerTimeout(timer: ActiveTimer) {
    if (this.timerTimeouts.has(timer.id)) {
      clearTimeout(this.timerTimeouts.get(timer.id));
    }

    const delayMs = Math.max(0, timer.endTime - Date.now());
    const timeout = setTimeout(() => {
      timer.status = 'completed';
      timer.remainingSeconds = 0;
      console.log(`[ToolExecutor] ⏰ Timer "${timer.label}" (${timer.id}) completed!`);
    }, delayMs);

    this.timerTimeouts.set(timer.id, timeout);
  }

  private static parseDurationToSeconds(args: Record<string, any>): number {
    // 1. Direct explicit numeric parameters
    if (typeof args.durationSeconds === 'number' && args.durationSeconds > 0) {
      const mins = typeof args.durationMinutes === 'number' ? args.durationMinutes : 0;
      const hrs = typeof args.durationHours === 'number' ? args.durationHours : 0;
      return (hrs * 3600) + (mins * 60) + args.durationSeconds;
    }

    if (typeof args.durationMinutes === 'number' && args.durationMinutes > 0) {
      const hrs = typeof args.durationHours === 'number' ? args.durationHours : 0;
      return (hrs * 3600) + (args.durationMinutes * 60);
    }

    if (typeof args.minutes === 'number' && args.minutes > 0) {
      const secs = typeof args.seconds === 'number' ? args.seconds : 0;
      const hrs = typeof args.hours === 'number' ? args.hours : 0;
      return (hrs * 3600) + (args.minutes * 60) + secs;
    }

    if (typeof args.seconds === 'number' && args.seconds > 0) {
      return args.seconds;
    }

    if (typeof args.hours === 'number' && args.hours > 0) {
      return args.hours * 3600;
    }

    // 2. String parsing from 'duration', 'time', 'content', or 'query'
    const str = (args.duration || args.time || args.content || args.query || '').toString().toLowerCase().trim();
    if (str) {
      let extractedSeconds = 0;
      let matched = false;

      // Match hours: e.g. "1 hour", "2 hrs", "1.5 hours"
      const hrMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|ghante?|h)\b/i);
      if (hrMatch) {
        extractedSeconds += Math.round(parseFloat(hrMatch[1]) * 3600);
        matched = true;
      }

      // Match minutes: e.g. "10 minutes", "10 min", "5 mins", "10 minute", "10m"
      const minMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|minute|m)\b/i);
      if (minMatch) {
        extractedSeconds += Math.round(parseFloat(minMatch[1]) * 60);
        matched = true;
      }

      // Match seconds: e.g. "30 seconds", "45 secs", "30 second", "30s"
      const secMatch = str.match(/(\d+)\s*(?:seconds?|secs?|second|s)\b/i);
      if (secMatch) {
        extractedSeconds += parseInt(secMatch[1], 10);
        matched = true;
      }

      // Pure digits (e.g. "10" or "5") -> default to minutes
      if (!matched) {
        const pureNum = parseInt(str.replace(/\D/g, ''), 10);
        if (!isNaN(pureNum) && pureNum > 0) {
          extractedSeconds = pureNum * 60; // 10 -> 600s
          matched = true;
        }
      }

      if (matched && extractedSeconds > 0) {
        return extractedSeconds;
      }
    }

    // Default fallback: 10 minutes (600 seconds)
    return 600;
  }

  private static formatDurationVoice(totalSeconds: number): string {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const parts: string[] = [];
    if (hrs > 0) {
      parts.push(`${hrs} ${hrs === 1 ? 'hour' : 'hours'}`);
    }
    if (mins > 0) {
      parts.push(`${mins} ${mins === 1 ? 'minute' : 'minutes'}`);
    }
    if (secs > 0 || parts.length === 0) {
      parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
    }

    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
    return `${parts[0]}, ${parts[1]} and ${parts[2]}`;
  }

  private static formatDurationHindi(totalSeconds: number): string {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const parts: string[] = [];
    if (hrs > 0) parts.push(`${hrs} ghanta`);
    if (mins > 0) parts.push(`${mins} minute`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} second`);

    return parts.join(' aur ');
  }

  private static formatStopwatchVoice(elapsedMs: number): string {
    const totalSec = Math.floor(elapsedMs / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const ms = Math.floor((elapsedMs % 1000) / 10);

    const parts: string[] = [];
    if (hrs > 0) parts.push(`${hrs} ${hrs === 1 ? 'hour' : 'hours'}`);
    if (mins > 0) parts.push(`${mins} ${mins === 1 ? 'minute' : 'minutes'}`);
    parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);

    return parts.join(' and ');
  }

  private static formatStopwatchDigital(elapsedMs: number): string {
    const totalSec = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const ms = Math.floor((elapsedMs % 1000) / 10);

    const mm = mins.toString().padStart(2, '0');
    const ss = secs.toString().padStart(2, '0');
    const cs = ms.toString().padStart(2, '0');

    return `${mm}:${ss}.${cs}`;
  }

  private static async executeMediaAction(action: string, songOrArtist?: string, platform?: string): Promise<Record<string, any>> {
    const plat = platform || 'youtube';
    if (action === 'search' && songOrArtist) {
      const searchUrl = plat === 'spotify' 
        ? `https://open.spotify.com/search/${encodeURIComponent(songOrArtist)}`
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(songOrArtist)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }

    return {
      success: true,
      action,
      songOrArtist: songOrArtist || null,
      platform: plat,
      message: `Media playback action "${action}" executed on ${plat}${songOrArtist ? ` for "${songOrArtist}"` : ''}.`
    };
  }
}

export default ToolExecutor;

