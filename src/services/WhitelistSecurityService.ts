import { 
  WhitelistDomainEntry, 
  AllowedBrowserAction, 
  SecurityAuditEvent, 
  SecurityPolicyState,
  DomainCategory 
} from '../types';

export const SYSTEM_DEFAULT_DOMAINS: WhitelistDomainEntry[] = [
  // Media & Video
  { id: 'dom-yt-1', domain: 'youtube.com', category: 'media', description: 'YouTube Video & Audio Streaming', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-yt-2', domain: 'youtu.be', category: 'media', description: 'YouTube Short URLs', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-yt-3', domain: 'www.youtube.com', category: 'media', description: 'YouTube Main Portal', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-yt-4', domain: 'm.youtube.com', category: 'media', description: 'YouTube Mobile Portal', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-yt-5', domain: 'youtube-nocookie.com', category: 'media', description: 'YouTube Privacy Sandbox Embed', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-spot-1', domain: 'spotify.com', category: 'media', description: 'Spotify Music Portal', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-spot-2', domain: 'open.spotify.com', category: 'media', description: 'Spotify Web Player', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-net-1', domain: 'netflix.com', category: 'streaming', description: 'Netflix Video Streaming', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-prime-1', domain: 'primevideo.com', category: 'streaming', description: 'Amazon Prime Video', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-hot-1', domain: 'hotstar.com', category: 'streaming', description: 'Disney+ Hotstar India', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-jio-1', domain: 'jiosaavn.com', category: 'media', description: 'JioSaavn Music Player', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-gaana-1', domain: 'gaana.com', category: 'media', description: 'Gaana Bhojpuri & Hindi Hits', isSystem: true, enabled: true, dateAdded: Date.now() },

  // Search & Knowledge
  { id: 'dom-goog-1', domain: 'google.com', category: 'search', description: 'Google Search Engine', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-goog-2', domain: 'www.google.com', category: 'search', description: 'Google Worldwide Web Search', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-goog-3', domain: 'google.co.in', category: 'search', description: 'Google India Search', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-wiki-1', domain: 'wikipedia.org', category: 'search', description: 'Wikipedia Free Encyclopedia', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-wiki-2', domain: 'en.wikipedia.org', category: 'search', description: 'English Wikipedia', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-wiki-3', domain: 'hi.wikipedia.org', category: 'search', description: 'Hindi Wikipedia (हिन्दी विकिपीडिया)', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-bing-1', domain: 'bing.com', category: 'search', description: 'Microsoft Bing Search', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-duck-1', domain: 'duckduckgo.com', category: 'search', description: 'DuckDuckGo Privacy Search', isSystem: true, enabled: true, dateAdded: Date.now() },

  // Social & Community
  { id: 'dom-fb-1', domain: 'facebook.com', category: 'social', description: 'Facebook Social Network', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-fb-2', domain: 'www.facebook.com', category: 'social', description: 'Facebook Web App', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-ig-1', domain: 'instagram.com', category: 'social', description: 'Instagram Media Feed', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-tw-1', domain: 'twitter.com', category: 'social', description: 'Twitter Platform', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-tw-2', domain: 'x.com', category: 'social', description: 'X (formerly Twitter)', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-red-1', domain: 'reddit.com', category: 'social', description: 'Reddit Communities', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-link-1', domain: 'linkedin.com', category: 'social', description: 'LinkedIn Professional Network', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-wa-1', domain: 'whatsapp.com', category: 'social', description: 'WhatsApp Messenger', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-wa-2', domain: 'web.whatsapp.com', category: 'social', description: 'WhatsApp Web', isSystem: true, enabled: true, dateAdded: Date.now() },

  // Developer & AI
  { id: 'dom-gh-1', domain: 'github.com', category: 'developer', description: 'GitHub Source Repositories', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-gl-1', domain: 'gitlab.com', category: 'developer', description: 'GitLab DevOps Platform', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-so-1', domain: 'stackoverflow.com', category: 'developer', description: 'Stack Overflow Q&A', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-mdn-1', domain: 'developer.mozilla.org', category: 'developer', description: 'MDN Web Docs', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-gdev-1', domain: 'google.dev', category: 'developer', description: 'Google Developers Portal', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-aidev-1', domain: 'ai.google.dev', category: 'developer', description: 'Google AI Studio & Gemini Docs', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-hf-1', domain: 'huggingface.co', category: 'developer', description: 'HuggingFace AI Models Hub', isSystem: true, enabled: true, dateAdded: Date.now() },

  // Shopping & Utilities
  { id: 'dom-amz-1', domain: 'amazon.in', category: 'shopping', description: 'Amazon India Shopping', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-amz-2', domain: 'amazon.com', category: 'shopping', description: 'Amazon Global Shopping', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-weath-1', domain: 'weather.com', category: 'utility', description: 'The Weather Channel Forecast', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-news-1', domain: 'news.google.com', category: 'utility', description: 'Google News Feed', isSystem: true, enabled: true, dateAdded: Date.now() },
  { id: 'dom-maps-1', domain: 'maps.google.com', category: 'utility', description: 'Google Maps & Navigation', isSystem: true, enabled: true, dateAdded: Date.now() }
];

export const ALLOWED_BROWSER_ACTIONS: Array<{ action: AllowedBrowserAction; description: string; category: string; dangerLevel: 'safe' | 'medium' }> = [
  { action: 'navigate', description: 'Navigate window to a whitelisted URL', category: 'Navigation', dangerLevel: 'safe' },
  { action: 'search', description: 'Perform safe web or YouTube query search', category: 'Navigation', dangerLevel: 'safe' },
  { action: 'play', description: 'Start media video or audio playback', category: 'Playback', dangerLevel: 'safe' },
  { action: 'pause', description: 'Pause media playback', category: 'Playback', dangerLevel: 'safe' },
  { action: 'resume', description: 'Resume paused media playback', category: 'Playback', dangerLevel: 'safe' },
  { action: 'stop', description: 'Halt active media stream', category: 'Playback', dangerLevel: 'safe' },
  { action: 'mute', description: 'Mute audio output stream', category: 'Audio', dangerLevel: 'safe' },
  { action: 'unmute', description: 'Unmute audio output stream', category: 'Audio', dangerLevel: 'safe' },
  { action: 'set_volume', description: 'Adjust audio output volume (0-100%)', category: 'Audio', dangerLevel: 'safe' },
  { action: 'next_track', description: 'Advance to next track in queue', category: 'Playback', dangerLevel: 'safe' },
  { action: 'previous_track', description: 'Return to previous track in queue', category: 'Playback', dangerLevel: 'safe' },
  { action: 'refresh', description: 'Reload current page in sandbox', category: 'Page Control', dangerLevel: 'safe' },
  { action: 'history_back', description: 'Step backward in session history', category: 'Navigation', dangerLevel: 'safe' },
  { action: 'history_forward', description: 'Step forward in session history', category: 'Navigation', dangerLevel: 'safe' },
  { action: 'minimize', description: 'Minimize second-screen window to taskbar', category: 'Window Control', dangerLevel: 'safe' },
  { action: 'maximize', description: 'Maximize window to full screen', category: 'Window Control', dangerLevel: 'safe' },
  { action: 'restore', description: 'Restore window to standard dimensions', category: 'Window Control', dangerLevel: 'safe' },
  { action: 'close', description: 'Close second screen popup / tab', category: 'Window Control', dangerLevel: 'safe' },
  { action: 'popout', description: 'Detach to external secondary monitor window', category: 'Window Control', dangerLevel: 'safe' },
  { action: 'scroll_up', description: 'Scroll page content upwards', category: 'Page Control', dangerLevel: 'safe' },
  { action: 'scroll_down', description: 'Scroll page content downwards', category: 'Page Control', dangerLevel: 'safe' },
  { action: 'take_screenshot', description: 'Capture viewport snapshot preview', category: 'Diagnostics', dangerLevel: 'safe' }
];

export const FORBIDDEN_EXECUTION_PATTERNS = [
  /^javascript:/i,
  /^data:/i,
  /^vbscript:/i,
  /^file:/i,
  /^blob:/i,
  /eval\s*\(/i,
  /Function\s*\(/i,
  /<script\b[^>]*>/i,
  /window\.__proto__/i,
  /document\.cookie/i,
  /localStorage\.clear/i,
  /require\s*\(/i,
  /process\.exit/i,
  /child_process/i,
  /;\s*rm\s+-rf/i,
  /\|\s*bash/i,
  /\|\s*sh/i
];

export class WhitelistSecurityService {
  private static domains: WhitelistDomainEntry[] = [];
  private static securityLogs: SecurityAuditEvent[] = [];
  private static listeners: Array<(policy: SecurityPolicyState) => void> = [];
  private static initialized = false;

  private static blockedAttemptsCount = 0;
  private static allowedRequestsCount = 0;
  private static sanitizedRequestsCount = 0;

  /**
   * Initializes whitelist from persistent local storage or system defaults
   */
  public static init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const savedDomains = localStorage.getItem('shivans_whitelist_domains');
      if (savedDomains) {
        this.domains = JSON.parse(savedDomains);
      } else {
        this.domains = [...SYSTEM_DEFAULT_DOMAINS];
        this.saveDomains();
      }

      const savedLogs = localStorage.getItem('shivans_security_audit_logs');
      if (savedLogs) {
        this.securityLogs = JSON.parse(savedLogs);
      }
    } catch (e) {
      console.warn('[WhitelistSecurityService] Storage access error, loading defaults:', e);
      this.domains = [...SYSTEM_DEFAULT_DOMAINS];
    }
  }

  private static saveDomains() {
    try {
      localStorage.setItem('shivans_whitelist_domains', JSON.stringify(this.domains));
    } catch (e) {
      // ignore
    }
  }

  private static saveLogs() {
    try {
      // Keep last 100 entries
      const trimmed = this.securityLogs.slice(0, 100);
      localStorage.setItem('shivans_security_audit_logs', JSON.stringify(trimmed));
    } catch (e) {
      // ignore
    }
  }

  public static subscribe(listener: (policy: SecurityPolicyState) => void): () => void {
    this.init();
    this.listeners.push(listener);
    listener(this.getPolicyState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify() {
    const policy = this.getPolicyState();
    this.listeners.forEach(l => {
      try {
        l(policy);
      } catch (err) {
        console.error('[WhitelistSecurityService] Listener error:', err);
      }
    });
  }

  public static getPolicyState(): SecurityPolicyState {
    this.init();
    return {
      arbitraryExecutionBlocked: true,
      strictDomainWhitelistEnforced: true,
      allowedActionsOnlyEnforced: true,
      blockedAttemptsCount: this.blockedAttemptsCount,
      allowedRequestsCount: this.allowedRequestsCount,
      sanitizedRequestsCount: this.sanitizedRequestsCount,
      recentSecurityLogs: [...this.securityLogs]
    };
  }

  public static getDomains(): WhitelistDomainEntry[] {
    this.init();
    return [...this.domains];
  }

  public static getAllowedActions() {
    return [...ALLOWED_BROWSER_ACTIONS];
  }

  /**
   * Log a security evaluation event
   */
  public static logSecurityEvent(
    action: string, 
    target: string, 
    status: 'allowed' | 'blocked' | 'sanitized', 
    reason: string,
    category: 'domain' | 'code_execution' | 'action' | 'scheme' = 'domain'
  ) {
    this.init();

    if (status === 'blocked') this.blockedAttemptsCount++;
    else if (status === 'allowed') this.allowedRequestsCount++;
    else if (status === 'sanitized') this.sanitizedRequestsCount++;

    const entry: SecurityAuditEvent = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      action,
      target: target.length > 80 ? target.substring(0, 80) + '...' : target,
      status,
      reason,
      category
    };

    this.securityLogs.unshift(entry);
    if (this.securityLogs.length > 100) {
      this.securityLogs.pop();
    }
    this.saveLogs();
    this.notify();
  }

  /**
   * Check for Arbitrary Code Execution and Malicious URI Schemes
   */
  public static checkArbitraryCodeExecution(input: string): { isMalicious: boolean; reason?: string } {
    const trimmed = (input || '').trim();
    if (!trimmed) return { isMalicious: false };

    for (const pattern of FORBIDDEN_EXECUTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          isMalicious: true,
          reason: `Blocked forbidden execution pattern: "${pattern.toString()}"`
        };
      }
    }

    return { isMalicious: false };
  }

  /**
   * Strict domain whitelist checker
   */
  public static isDomainWhitelisted(rawUrl: string): { 
    isWhitelisted: boolean; 
    domain: string; 
    cleanUrl: string; 
    reason: string;
    isBlockedScheme?: boolean;
  } {
    this.init();
    const raw = (rawUrl || '').trim();

    // Check for arbitrary code execution patterns first
    const codeCheck = this.checkArbitraryCodeExecution(raw);
    if (codeCheck.isMalicious) {
      this.logSecurityEvent('EXECUTE_CODE_ATTEMPT', raw, 'blocked', codeCheck.reason!, 'code_execution');
      return {
        isWhitelisted: false,
        domain: '',
        cleanUrl: '',
        reason: codeCheck.reason!,
        isBlockedScheme: true
      };
    }

    try {
      let target = raw;
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
      }

      const parsed = new URL(target);
      const hostname = parsed.hostname.toLowerCase();

      // Check against active enabled whitelist domains
      const match = this.domains.find(d => d.enabled && (hostname === d.domain.toLowerCase() || hostname.endsWith('.' + d.domain.toLowerCase())));

      if (match) {
        this.logSecurityEvent('NAVIGATE_ALLOWED', hostname, 'allowed', `Domain matches whitelisted entry (${match.domain})`, 'domain');
        return {
          isWhitelisted: true,
          domain: hostname,
          cleanUrl: target,
          reason: `Matched allowed whitelist domain: ${match.domain}`
        };
      }

      // Not on active whitelist
      const sanitizedSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(raw)}`;
      this.logSecurityEvent('NAVIGATE_SANITIZED', hostname || raw, 'sanitized', `Domain "${hostname || raw}" is not whitelisted. Routed to Google Safe Search.`, 'domain');

      return {
        isWhitelisted: false,
        domain: hostname,
        cleanUrl: sanitizedSearchUrl,
        reason: `Domain "${hostname}" is outside the whitelist. Safely redirected through Google Search.`
      };
    } catch (err: any) {
      this.logSecurityEvent('URL_PARSE_ERROR', raw, 'blocked', `Invalid URL format: ${err.message}`, 'scheme');
      return {
        isWhitelisted: false,
        domain: '',
        cleanUrl: `https://www.google.com/search?q=${encodeURIComponent(raw)}`,
        reason: 'Malformed or invalid URL string.'
      };
    }
  }

  /**
   * Validates if a browser action is whitelisted
   */
  public static isActionWhitelisted(actionName: string): { allowed: boolean; reason: string } {
    this.init();
    const cleanAction = (actionName || '').trim().toLowerCase();

    // Mapping synonyms / normalized names
    const actionAliases: Record<string, AllowedBrowserAction> = {
      'navigate': 'navigate',
      'open': 'navigate',
      'openwebsite': 'navigate',
      'search': 'search',
      'search_youtube': 'search',
      'play': 'play',
      'play_video': 'play',
      'pause': 'pause',
      'pause_video': 'pause',
      'resume': 'resume',
      'resume_video': 'resume',
      'stop': 'stop',
      'stop_video': 'stop',
      'mute': 'mute',
      'mute_video': 'mute',
      'unmute': 'unmute',
      'unmute_video': 'unmute',
      'set_volume': 'set_volume',
      'volume': 'set_volume',
      'next': 'next_track',
      'next_track': 'next_track',
      'next_video': 'next_track',
      'previous': 'previous_track',
      'prev_track': 'previous_track',
      'previous_track': 'previous_track',
      'refresh': 'refresh',
      'refresh_page': 'refresh',
      'back': 'history_back',
      'history_back': 'history_back',
      'forward': 'history_forward',
      'history_forward': 'history_forward',
      'minimize': 'minimize',
      'minimize_window': 'minimize',
      'maximize': 'maximize',
      'maximize_window': 'maximize',
      'restore': 'restore',
      'restore_window': 'restore',
      'close': 'close',
      'close_window': 'close',
      'popout': 'popout',
      'popout_window': 'popout',
      'scroll_up': 'scroll_up',
      'scroll_down': 'scroll_down',
      'screenshot': 'take_screenshot',
      'take_screenshot': 'take_screenshot'
    };

    const mapped = actionAliases[cleanAction];
    if (mapped) {
      this.logSecurityEvent('BROWSER_ACTION_ALLOWED', cleanAction, 'allowed', `Action "${cleanAction}" is verified in browser action whitelist`, 'action');
      return { allowed: true, reason: `Action "${cleanAction}" is whitelisted.` };
    }

    this.logSecurityEvent('BROWSER_ACTION_BLOCKED', cleanAction, 'blocked', `Unrecognized or arbitrary browser action "${cleanAction}" rejected.`, 'action');
    return {
      allowed: false,
      reason: `Action "${cleanAction}" is not permitted by the Security Policy.`
    };
  }

  /**
   * Add a new trusted custom domain
   */
  public static addCustomDomain(rawDomain: string, category: DomainCategory = 'custom', description = 'User Whitelisted Domain'): { success: boolean; message: string } {
    this.init();
    let clean = rawDomain.trim().toLowerCase();

    // Clean protocol if provided
    clean = clean.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();

    if (!clean || clean.length < 3) {
      return { success: false, message: 'Invalid domain length or format.' };
    }

    // Check code execution injection
    const codeCheck = this.checkArbitraryCodeExecution(clean);
    if (codeCheck.isMalicious) {
      return { success: false, message: 'Domain contains forbidden characters or script tags.' };
    }

    // Validate domain syntax (e.g. example.com or api.example.co.uk)
    const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
    if (!domainRegex.test(clean)) {
      return { success: false, message: 'Invalid domain syntax. Format must be domain.com or sub.domain.com' };
    }

    const exists = this.domains.some(d => d.domain.toLowerCase() === clean);
    if (exists) {
      return { success: false, message: `Domain "${clean}" is already in the whitelist.` };
    }

    const newEntry: WhitelistDomainEntry = {
      id: `dom-custom-${Date.now()}`,
      domain: clean,
      category,
      description,
      isSystem: false,
      enabled: true,
      dateAdded: Date.now()
    };

    this.domains.unshift(newEntry);
    this.saveDomains();
    this.logSecurityEvent('DOMAIN_ADDED', clean, 'allowed', `New domain "${clean}" added to custom whitelist.`, 'domain');
    this.notify();

    return { success: true, message: `Domain "${clean}" added to allowed whitelist.` };
  }

  /**
   * Remove a custom domain
   */
  public static removeCustomDomain(id: string): { success: boolean; message: string } {
    this.init();
    const entry = this.domains.find(d => d.id === id);
    if (!entry) return { success: false, message: 'Domain entry not found.' };
    if (entry.isSystem) return { success: false, message: 'System core domains cannot be removed. You can disable them instead.' };

    this.domains = this.domains.filter(d => d.id !== id);
    this.saveDomains();
    this.logSecurityEvent('DOMAIN_REMOVED', entry.domain, 'allowed', `Custom domain "${entry.domain}" removed from whitelist.`, 'domain');
    this.notify();

    return { success: true, message: `Removed domain "${entry.domain}" from whitelist.` };
  }

  /**
   * Toggle domain enabled state
   */
  public static toggleDomainStatus(id: string): { success: boolean; enabled: boolean } {
    this.init();
    const entry = this.domains.find(d => d.id === id);
    if (!entry) return { success: false, enabled: false };

    entry.enabled = !entry.enabled;
    this.saveDomains();
    this.logSecurityEvent(
      entry.enabled ? 'DOMAIN_ENABLED' : 'DOMAIN_DISABLED', 
      entry.domain, 
      'allowed', 
      `Domain "${entry.domain}" set to ${entry.enabled ? 'Active' : 'Disabled'}.`,
      'domain'
    );
    this.notify();

    return { success: true, enabled: entry.enabled };
  }

  /**
   * Reset domains back to system defaults
   */
  public static resetToDefaultWhitelist() {
    this.domains = [...SYSTEM_DEFAULT_DOMAINS];
    this.saveDomains();
    this.logSecurityEvent('WHITELIST_RESET', 'System Defaults', 'allowed', 'Reset all domain rules to default secure configuration.', 'domain');
    this.notify();
  }

  /**
   * Clear security logs
   */
  public static clearSecurityLogs() {
    this.securityLogs = [];
    this.saveLogs();
    this.notify();
  }
}
