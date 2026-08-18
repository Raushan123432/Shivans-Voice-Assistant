import { ToolCall, ToolResponse, PendingConfirmation } from '../types';
import { getISTTimeDetails } from '../utils/timeUtils';

export class ToolExecutor {
  private static confirmationCallback?: (request: PendingConfirmation) => void;
  private static actionCallback?: (action: string, args: Record<string, any>) => void;

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

        case 'searchYouTube':
          this.actionCallback?.(name, args || {});
          result = await this.requestConfirmation(name, args, () => this.searchYouTubeAndPlay(args.query, args.autoplay));
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
          result = await this.requestConfirmation(name, args, () => this.executeProductivityAction(args.app, args.action, args.content));
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
    
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'https://' + url;
    }

    const win = window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    if (win) {
      return { success: true, openedUrl: formattedUrl, message: `Opened website: ${formattedUrl}` };
    } else {
      return { 
        success: true, 
        openedUrl: formattedUrl, 
        warning: 'Popup blocked. Please allow popups.',
        message: `Attempted to open: ${formattedUrl}`
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

  private static async searchYouTubeAndPlay(query: string, autoplay?: boolean): Promise<Record<string, any>> {
    if (!query) return { error: 'No query provided' };
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(ytUrl, '_blank', 'noopener,noreferrer');
    return {
      success: true,
      query,
      autoplay: autoplay !== false,
      url: ytUrl,
      message: `Searching and playing "${query}" on YouTube.`
    };
  }

  private static async automateBrowserAction(action: string, url?: string): Promise<Record<string, any>> {
    if (action === 'new_tab' && url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer');
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

  private static async executeProductivityAction(app: string, action: string, content?: string): Promise<Record<string, any>> {
    const appLower = app.toLowerCase();
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
