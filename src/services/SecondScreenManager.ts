import { SecondScreenState, SecondScreenAction } from '../types';
import { WhitelistSecurityService } from './WhitelistSecurityService';

// Whitelist of allowed domains for second-screen browser security
export const ALLOWED_DOMAINS = [
  'youtube.com',
  'youtu.be',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'google.com',
  'www.google.com',
  'google.co.in',
  'facebook.com',
  'www.facebook.com',
  'wikipedia.org',
  'en.wikipedia.org',
  'hi.wikipedia.org',
  'github.com',
  'reddit.com',
  'twitter.com',
  'x.com',
  'spotify.com',
  'open.spotify.com',
  'instagram.com',
  'netflix.com',
  'primevideo.com',
  'amazon.in',
  'amazon.com',
  'weather.com',
  'news.google.com'
];

// Curated Bhojpuri & Hindi YouTube Video & Audio library for responsive embed playback
export const YOUTUBE_PRESETS: Record<string, { title: string; videoId: string; category: 'bhojpuri' | 'hindi' | 'audio' | 'party'; related: string[] }> = {
  // === BHOJPURI VIDEO & AUDIO HITS ===
  'pawan singh': {
    title: 'Pawan Singh Nonstop Superhit Bhojpuri Songs & Videos',
    videoId: 'YwK8nB7Zq9A',
    category: 'bhojpuri',
    related: ['Lolipop Lagelu', 'Kamariya Hila Rahi Hai', 'Raja Ji', 'Pudina Ae Haseena', 'Bhojpuri Top Hits']
  },
  'lolipop lagelu': {
    title: 'Lolipop Lagelu | Pawan Singh | All Time Bhojpuri Superhit',
    videoId: 'vA8qK7G6Vn8',
    category: 'bhojpuri',
    related: ['Pawan Singh Hits', 'Kamariya Hila Rahi Hai', 'Bhojpuri DJ Remix']
  },
  'khesari lal': {
    title: 'Khesari Lal Yadav Superhit Bhojpuri Songs & Dance Videos',
    videoId: '9YmZk8Wz2Xs',
    category: 'bhojpuri',
    related: ['Lal Ghaghra', 'Saj Ke Sawar Ke', 'Nathuniya', 'Pagal Banibe', 'Bhojpuri Blast']
  },
  'khesari lal yadav': {
    title: 'Khesari Lal Yadav Nonstop Bhojpuri Hits & Video Playlist',
    videoId: '9YmZk8Wz2Xs',
    category: 'bhojpuri',
    related: ['Lal Ghaghra', 'Saj Ke Sawar Ke', 'Nathuniya', 'Bhojpuri Party Hits']
  },
  'lal ghaghra': {
    title: 'Lal Ghaghra | Khesari Lal Yadav & Shilpi Raj | Official Bhojpuri Video',
    videoId: 'kX8mP9Q3ZyA',
    category: 'bhojpuri',
    related: ['Khesari Lal Hits', 'Shilpi Raj Hits', 'Bhojpuri DJ Party']
  },
  'shilpi raj': {
    title: 'Shilpi Raj Superhit Bhojpuri Audio & Video Collection',
    videoId: '5Vn8ZxQ7W9k',
    category: 'bhojpuri',
    related: ['Raja Ji Ke Dilwa', 'Khesari Shilpi Duet', 'Bhojpuri Romantic Hits']
  },
  'arvind akela kallu': {
    title: 'Arvind Akela Kallu Bhojpuri Hit Songs & Music Videos',
    videoId: '8WkZ9mY2X3s',
    category: 'bhojpuri',
    related: ['Kallu Bhojpuri Dance', 'Bhojpuri Chaita', 'Bhojpuri DJ Songs']
  },
  'neelkamal singh': {
    title: 'Neelkamal Singh Superhit Bhojpuri Romantic & Sad Songs',
    videoId: '7Yn9XzW2M1k',
    category: 'bhojpuri',
    related: ['Bhojpuri Melody', 'Neelkamal New Song', 'Bhojpuri Love Track']
  },
  'ritesh pandey': {
    title: 'Ritesh Pandey Bhojpuri Hits (Piyawa Se Pahile)',
    videoId: '4XmZ9kY7W2s',
    category: 'bhojpuri',
    related: ['Piyawa Se Pahile', 'Hello Koun', 'Bhojpuri Top Chart']
  },
  'bhojpuri gana': {
    title: 'Bhojpuri Top 50 Trending Songs & Video Playlist (Pawan Singh, Khesari Lal, Shilpi Raj)',
    videoId: '9YmZk8Wz2Xs',
    category: 'bhojpuri',
    related: ['Pawan Singh Hits', 'Khesari Lal Hits', 'Bhojpuri DJ Remix', 'Bhojpuri Romantic']
  },
  'bhojpuri song': {
    title: 'New Bhojpuri Superhit Songs 2024-2025 | Video & Audio Hits',
    videoId: 'YwK8nB7Zq9A',
    category: 'bhojpuri',
    related: ['Bhojpuri Gana', 'Khesari Lal', 'Pawan Singh', 'Bhojpuri DJ']
  },
  'bhojpuri video': {
    title: 'Bhojpuri HD Video Songs Nonstop Hits',
    videoId: 'kX8mP9Q3ZyA',
    category: 'bhojpuri',
    related: ['Bhojpuri Dance Video', 'Pawan Singh Video', 'Khesari Lal Video']
  },
  'bhojpuri audio': {
    title: 'Bhojpuri High Quality Audio Songs Jukebox',
    videoId: '5Vn8ZxQ7W9k',
    category: 'bhojpuri',
    related: ['Bhojpuri MP3 Jukebox', 'Bhojpuri Folk Hits', 'Bhojpuri Lofi']
  },
  'bhojpuri dj': {
    title: 'Bhojpuri DJ Dance Party Nonstop Remix (Bass Boosted)',
    videoId: '8WkZ9mY2X3s',
    category: 'party',
    related: ['Bhojpuri DJ Track', 'Pawan Singh DJ', 'Khesari DJ Remix']
  },
  'bhojpuri lofi': {
    title: 'Bhojpuri Lofi Chill Lounge | Slowed + Reverb Audio Beats',
    videoId: '7Yn9XzW2M1k',
    category: 'audio',
    related: ['Bhojpuri Relaxing Vibes', 'Bhojpuri Acoustic', 'Bhojpuri Night Lofi']
  },
  'chhath geet': {
    title: 'Chhath Geet Bhojpuri Hits | Sharda Sinha & Anuradha Paudwal',
    videoId: '3Zk9XmW7Y1s',
    category: 'bhojpuri',
    related: ['Sharda Sinha Chhath', 'Bhojpuri Paramparik Geet', 'Bhojpuri Folk']
  },

  // === HINDI BOLLYWOOD & ROMANTIC HITS ===
  'arijit singh': {
    title: 'Arijit Singh Greatest Romantic Hits & Melodies (Nonstop Jukebox)',
    videoId: 'jfKfPfyJRdk',
    category: 'hindi',
    related: ['Kesariya', 'Tum Hi Ho', 'Channa Mereya', 'Apna Bana Le', 'Agar Tum Saath Ho', 'O Maahi']
  },
  'arijit singh song': {
    title: 'Arijit Singh Best Heartfelt Romantic Mashup (Audio & Video)',
    videoId: 'jfKfPfyJRdk',
    category: 'hindi',
    related: ['Kesariya', 'Tum Hi Ho', 'Channa Mereya', 'Apna Bana Le']
  },
  'kesariya': {
    title: 'Kesariya - Brahmāstra | Ranbir Kapoor, Alia Bhatt | Arijit Singh',
    videoId: 'BddP6PYo2gs',
    category: 'hindi',
    related: ['Apna Bana Le', 'Rasiya', 'Deva Deva', 'O Maahi']
  },
  'apna bana le': {
    title: 'Apna Bana Le - Bhediya | Varun Dhawan, Kriti Sanon | Arijit Singh, Sachin-Jigar',
    videoId: 'ElZfdU54Cp8',
    category: 'hindi',
    related: ['Kesariya', 'Tum Hi Ho', 'Tere Hawaale']
  },
  'tum hi ho': {
    title: 'Tum Hi Ho - Aashiqui 2 | Arijit Singh | Mithoon',
    videoId: 'Umqb9KENgmk',
    category: 'hindi',
    related: ['Chahun Main Ya Naa', 'Sunn Raha Hai Na Tu', 'Aashiqui 2 Songs']
  },
  'jubin nautiyal': {
    title: 'Jubin Nautiyal Best Romantic Hindi Songs Jukebox',
    videoId: 'gvyUuxdRdR4',
    category: 'hindi',
    related: ['Raataan Lambiyan', 'Lut Gaye', 'Humnava Mere', 'Bewafa Tera Masoom Chehra']
  },
  'raataan lambiyan': {
    title: 'Raataan Lambiyan - Shershaah | Sidharth, Kiara | Jubin Nautiyal, Asees Kaur',
    videoId: 'gvyUuxdRdR4',
    category: 'hindi',
    related: ['Ranjha', 'Mann Bharryaa', 'Jubin Nautiyal Hits']
  },
  'shreya ghoshal': {
    title: 'Shreya Ghoshal All Time Best Hindi Melodies & Sweet Romantic Songs',
    videoId: 'pG6iaOMV46I',
    category: 'hindi',
    related: ['Sun Raha Hai', 'Deewani Mastani', 'Ghoomar', 'Agar Tum Mil Jao']
  },
  'neha kakkar': {
    title: 'Neha Kakkar Top Bollywood Dance & Party Songs Mashup',
    videoId: 'tgbNymZ7vqY',
    category: 'hindi',
    related: ['Dilbar', 'Aankh Marey', 'Garmi', 'Kala Chashma']
  },
  'atif aslam': {
    title: 'Atif Aslam Best Romantic Hindi Songs (Jeene Laga Hoon, Tere Sang Yaara)',
    videoId: 'Umqb9KENgmk',
    category: 'hindi',
    related: ['Tere Sang Yaara', 'Pehli Nazar Mein', 'Jeena Jeena', 'Tajdar-e-Haram']
  },
  'hindi gana': {
    title: 'Top Bollywood Hindi Songs 2024-2025 | Latest Romantic & Dance Hits',
    videoId: 'BddP6PYo2gs',
    category: 'hindi',
    related: ['Arijit Singh Hits', 'Bollywood Party Mashup', 'New Hindi Songs']
  },
  'hindi song': {
    title: 'Trending Hindi Songs & Video Jukebox (Arijit, Jubin, Shreya Ghoshal)',
    videoId: 'jfKfPfyJRdk',
    category: 'hindi',
    related: ['Kesariya', 'Apna Bana Le', 'Hindi Romantic Mashup']
  },
  'hindi romantic': {
    title: 'Heart Touching Hindi Romantic Love Songs Playlist',
    videoId: 'ElZfdU54Cp8',
    category: 'hindi',
    related: ['Arijit Romantic', 'Jubin Romantic', '90s Romantic Songs']
  },
  'hindi 90s': {
    title: '90s Hindi Evergreen Superhit Songs (Kumar Sanu, Alka Yagnik, Udit Narayan)',
    videoId: 'pG6iaOMV46I',
    category: 'hindi',
    related: ['Kumar Sanu Hits', 'Alka Yagnik Melodies', 'Udit Narayan Songs']
  },
  'hindi lofi': {
    title: 'Bollywood Hindi Lofi Chill Beats | Relaxing Midnight Music',
    videoId: 'jfKfPfyJRdk',
    category: 'audio',
    related: ['Midnight Hindi Lofi', 'Arijit Lofi', 'Acoustic Bollywood']
  },
  'coke studio': {
    title: 'Coke Studio Top Global & Indian Fusion Hits',
    videoId: '5Eqb_-j3FDA',
    category: 'hindi',
    related: ['Pasoori', 'Afreen Afreen', 'Tajdar-e-Haram']
  },
  'trending': {
    title: 'YouTube India Top Trending Music & Video Hits (Bhojpuri & Hindi)',
    videoId: 'BddP6PYo2gs',
    category: 'party',
    related: ['Bhojpuri Superhits', 'Bollywood Hits', 'Pawan Singh New Song', 'Arijit Singh Hits']
  }
};

export class SecondScreenManager {
  private static state: SecondScreenState = {
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    mode: 'blank',
    title: 'Second Screen Standby',
    service: 'custom',
    url: 'about:blank',
    currentQuery: '',
    videoId: '',
    playbackStatus: 'stopped',
    isMuted: false,
    volume: 85,
    playlistIndex: 0,
    playlist: [
      { title: 'Pawan Singh Bhojpuri Superhits', query: 'Pawan Singh Bhojpuri song', videoId: 'YwK8nB7Zq9A' },
      { title: 'Khesari Lal Yadav Bhojpuri Blast', query: 'Khesari Lal Yadav video', videoId: '9YmZk8Wz2Xs' },
      { title: 'Arijit Singh Romantic Hits', query: 'Arijit Singh song', videoId: 'jfKfPfyJRdk' },
      { title: 'Kesariya - Brahmastra', query: 'Kesariya', videoId: 'BddP6PYo2gs' },
      { title: 'Shilpi Raj Bhojpuri Hits', query: 'Shilpi Raj song', videoId: '5Vn8ZxQ7W9k' },
      { title: 'Top Bollywood Hindi Hits', query: 'Hindi song', videoId: 'ElZfdU54Cp8' }
    ],
    isExternalWindowOpen: false,
    lastAction: 'initialized',
    updatedAt: Date.now()
  };

  private static listeners: Set<(state: SecondScreenState) => void> = new Set();
  private static externalWindowRef: Window | null = null;
  private static broadcastChannel: BroadcastChannel | null = null;

  static {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('shivans_second_screen_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'STATE_UPDATE' && event.data?.state) {
            this.state = { ...this.state, ...event.data.state, updatedAt: Date.now() };
            this.notifyListeners();
          } else if (event.data?.type === 'ACTION') {
            this.handleIncomingAction(event.data.action, event.data.payload);
          }
        };
      }
    } catch (e) {
      console.warn('[SecondScreenManager] BroadcastChannel init error:', e);
    }
  }

  public static subscribe(listener: (state: SecondScreenState) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  public static getState(): SecondScreenState {
    return { ...this.state };
  }

  private static notifyListeners() {
    this.listeners.forEach((l) => {
      try {
        l({ ...this.state });
      } catch (err) {
        console.error('[SecondScreenManager] Listener error:', err);
      }
    });

    // Broadcast across tabs/windows
    try {
      this.broadcastChannel?.postMessage({
        type: 'STATE_UPDATE',
        state: this.state
      });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('shivans_second_screen_state', JSON.stringify(this.state));
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Validates if a URL domain is in the allowed whitelist and enforces code execution protection
   */
  public static isDomainAllowed(rawUrl: string): { allowed: boolean; domain: string; cleanUrl: string; reason?: string } {
    const res = WhitelistSecurityService.isDomainWhitelisted(rawUrl);
    return {
      allowed: res.isWhitelisted,
      domain: res.domain,
      cleanUrl: res.cleanUrl,
      reason: res.reason
    };
  }

  /**
   * Reuses existing window if open, or creates a dedicated second screen window popup
   */
  public static openOrFocusExternalWindow(targetUrl: string, windowTitle = 'Shivans AI - Second Screen'): Window | null {
    try {
      // Check if existing window is still alive and not closed
      if (this.externalWindowRef && !this.externalWindowRef.closed) {
        this.externalWindowRef.location.href = targetUrl;
        this.externalWindowRef.focus();
        this.state.isExternalWindowOpen = true;
        this.notifyListeners();
        return this.externalWindowRef;
      }

      // Calculate secondary monitor positioning (typically left >= 1920 or right-aligned)
      const screenW = window.screen.availWidth || 1920;
      const screenH = window.screen.availHeight || 1080;
      const popupW = Math.min(1280, Math.floor(screenW * 0.75));
      const popupH = Math.min(800, Math.floor(screenH * 0.85));
      const leftPos = Math.max(0, screenW - popupW - 40);
      const topPos = 40;

      const features = `width=${popupW},height=${popupH},left=${leftPos},top=${topPos},menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes`;
      
      const newWin = window.open(targetUrl, 'ShivansAI_Dedicated_SecondScreen_Window', features);
      if (newWin) {
        this.externalWindowRef = newWin;
        this.state.isExternalWindowOpen = true;
        this.notifyListeners();
      }
      return newWin;
    } catch (err) {
      console.warn('[SecondScreenManager] Popup open caught (popup blocker may be active):', err);
      return null;
    }
  }

  /**
   * Smart resolver for Bhojpuri and Hindi songs, video playlists, and audio tracks
   */
  public static resolveMediaTrack(query?: string): { videoId: string; title: string; query: string } {
    const raw = (query || '').trim();
    if (!raw) {
      return {
        videoId: 'YwK8nB7Zq9A',
        title: 'Bhojpuri & Hindi Superhit Songs',
        query: 'Bhojpuri and Hindi hit songs'
      };
    }

    const lower = raw.toLowerCase();

    // Check direct preset map
    for (const [key, preset] of Object.entries(YOUTUBE_PRESETS)) {
      if (lower.includes(key)) {
        return {
          videoId: preset.videoId,
          title: preset.title,
          query: raw
        };
      }
    }

    // Artist & Genre pattern matchers
    if (lower.includes('pawan') || lower.includes('singh') || lower.includes('lolipop') || lower.includes('kamariya')) {
      return { videoId: 'YwK8nB7Zq9A', title: `Pawan Singh Bhojpuri Hits - ${raw}`, query: raw };
    }
    if (lower.includes('khesari') || lower.includes('lal') || lower.includes('ghaghra') || lower.includes('nathuniya')) {
      return { videoId: '9YmZk8Wz2Xs', title: `Khesari Lal Yadav Bhojpuri Blast - ${raw}`, query: raw };
    }
    if (lower.includes('shilpi') || lower.includes('raj')) {
      return { videoId: '5Vn8ZxQ7W9k', title: `Shilpi Raj Bhojpuri Songs - ${raw}`, query: raw };
    }
    if (lower.includes('kallu') || lower.includes('arvind')) {
      return { videoId: '8WkZ9mY2X3s', title: `Arvind Akela Kallu Hits - ${raw}`, query: raw };
    }
    if (lower.includes('neelkamal')) {
      return { videoId: '7Yn9XzW2M1k', title: `Neelkamal Singh Bhojpuri Songs - ${raw}`, query: raw };
    }
    if (lower.includes('ritesh')) {
      return { videoId: '4XmZ9kY7W2s', title: `Ritesh Pandey Bhojpuri Hits - ${raw}`, query: raw };
    }
    if (lower.includes('bhojpuri')) {
      return { videoId: 'YwK8nB7Zq9A', title: `Bhojpuri Superhit Video - ${raw}`, query: raw };
    }
    if (lower.includes('arijit')) {
      return { videoId: 'jfKfPfyJRdk', title: `Arijit Singh Melodies - ${raw}`, query: raw };
    }
    if (lower.includes('jubin') || lower.includes('raataan') || lower.includes('lut gaye')) {
      return { videoId: 'gvyUuxdRdR4', title: `Jubin Nautiyal Hits - ${raw}`, query: raw };
    }
    if (lower.includes('shreya')) {
      return { videoId: 'pG6iaOMV46I', title: `Shreya Ghoshal Melodies - ${raw}`, query: raw };
    }
    if (lower.includes('neha') || lower.includes('kakkar')) {
      return { videoId: 'tgbNymZ7vqY', title: `Neha Kakkar Party Hits - ${raw}`, query: raw };
    }
    if (lower.includes('kesariya') || lower.includes('brahmastra')) {
      return { videoId: 'BddP6PYo2gs', title: `Kesariya | Arijit Singh - ${raw}`, query: raw };
    }
    if (lower.includes('apna bana le') || lower.includes('bhediya')) {
      return { videoId: 'ElZfdU54Cp8', title: `Apna Bana Le | Arijit Singh - ${raw}`, query: raw };
    }
    if (lower.includes('tum hi ho') || lower.includes('aashiqui')) {
      return { videoId: 'Umqb9KENgmk', title: `Tum Hi Ho | Arijit Singh - ${raw}`, query: raw };
    }
    if (lower.includes('hindi') || lower.includes('bollywood') || lower.includes('romantic') || lower.includes('song') || lower.includes('gana') || lower.includes('music') || lower.includes('audio') || lower.includes('video')) {
      return { videoId: 'BddP6PYo2gs', title: `Hindi & Bollywood Superhits - ${raw}`, query: raw };
    }

    // Default fallback to trending video
    return {
      videoId: 'YwK8nB7Zq9A',
      title: `YouTube - ${raw}`,
      query: raw
    };
  }

  /**
   * 1. USER: "Shivans AI, YouTube kholo."
   * Action: Open second screen, load YouTube, keep main voice assistant active.
   */
  public static async openYouTube(query?: string): Promise<{ success: boolean; message: string; spoken: string }> {
    const isSearch = Boolean(query && query.trim());
    const searchQuery = isSearch ? query!.trim() : '';

    let matchedVideoId = 'YwK8nB7Zq9A';
    let displayTitle = 'YouTube Homepage';

    if (isSearch) {
      const resolved = this.resolveMediaTrack(searchQuery);
      matchedVideoId = resolved.videoId;
      displayTitle = resolved.title;
    }

    const webUrl = isSearch
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
      : 'https://www.youtube.com';

    this.state = {
      ...this.state,
      isOpen: true,
      isMinimized: false,
      mode: 'youtube',
      service: 'youtube',
      title: displayTitle,
      url: webUrl,
      currentQuery: searchQuery,
      videoId: matchedVideoId,
      playbackStatus: isSearch ? 'playing' : 'paused',
      lastAction: isSearch ? 'search_and_play' : 'open_youtube',
      updatedAt: Date.now()
    };

    this.notifyListeners();
    this.openOrFocusExternalWindow(webUrl, 'Shivans AI - YouTube Second Screen');

    // Notify backend API
    try {
      await fetch('/api/second-screen/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, autoplay: true, videoId: matchedVideoId, videoTitle: displayTitle })
      });
    } catch (e) {
      // non-blocking
    }

    const spoken = isSearch
      ? `Bilkul, second screen par ${searchQuery} chala diya.`
      : 'Bilkul, second screen par YouTube khol diya.';

    return {
      success: true,
      message: `YouTube opened on second screen window${isSearch ? ' playing: ' + searchQuery : ''}.`,
      spoken
    };
  }

  /**
   * 2. USER: "YouTube par Pawan Singh ka gana chalao" / "Bhojpuri song chalao" / "Hindi song chalao"
   * Action: Search, select most relevant video/audio, play on second screen window.
   */
  public static async playYouTubeVideo(query: string): Promise<{ success: boolean; message: string; spoken: string }> {
    const targetQuery = query?.trim() || 'Bhojpuri and Hindi hit songs';
    const resolved = this.resolveMediaTrack(targetQuery);
    
    const videoId = resolved.videoId;
    const videoTitle = resolved.title;
    const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(targetQuery)}`;

    // Update playlist queue
    const updatedPlaylist = [...this.state.playlist];
    const existingIdx = updatedPlaylist.findIndex((p) => p.query.toLowerCase() === targetQuery.toLowerCase());
    if (existingIdx === -1) {
      updatedPlaylist.unshift({ title: videoTitle, query: targetQuery, videoId });
    }

    this.state = {
      ...this.state,
      isOpen: true,
      isMinimized: false,
      mode: 'youtube',
      service: 'youtube',
      title: videoTitle,
      url: targetUrl,
      currentQuery: targetQuery,
      videoId,
      playbackStatus: 'playing',
      playlist: updatedPlaylist,
      playlistIndex: 0,
      lastAction: 'play_video',
      updatedAt: Date.now()
    };

    this.notifyListeners();
    this.openOrFocusExternalWindow(targetUrl, `Shivans AI - ${videoTitle}`);

    try {
      await fetch('/api/second-screen/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQuery, autoplay: true, videoId, videoTitle })
      });
    } catch (e) {
      // non-blocking
    }

    return {
      success: true,
      message: `Playing "${targetQuery}" on second-screen YouTube window.`,
      spoken: `Bilkul, second screen par ${targetQuery} chala diya.`
    };
  }

  /**
   * 3. USER: "Chrome par Google kholo" / "Chrome par Facebook kholo" / "Chrome par [website] kholo"
   */
  public static async openWhitelistedWebsite(target: string): Promise<{ success: boolean; message: string; spoken: string; url?: string }> {
    let cleanTarget = target.trim();
    let serviceName: SecondScreenState['service'] = 'custom';
    let siteTitle = cleanTarget;

    if (cleanTarget.toLowerCase().includes('google')) {
      cleanTarget = 'https://www.google.com';
      serviceName = 'google';
      siteTitle = 'Google Search';
    } else if (cleanTarget.toLowerCase().includes('facebook')) {
      cleanTarget = 'https://www.facebook.com';
      serviceName = 'facebook';
      siteTitle = 'Facebook';
    } else if (cleanTarget.toLowerCase().includes('wikipedia')) {
      cleanTarget = 'https://www.wikipedia.org';
      serviceName = 'wikipedia';
      siteTitle = 'Wikipedia';
    } else if (cleanTarget.toLowerCase().includes('youtube')) {
      return this.openYouTube();
    } else if (!cleanTarget.startsWith('http')) {
      cleanTarget = 'https://' + cleanTarget;
    }

    const { allowed, domain, cleanUrl } = this.isDomainAllowed(cleanTarget);
    if (!allowed) {
      // If not strictly on the top whitelist, redirect through Google Search for safety
      const safeSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(target)}`;
      this.state = {
        ...this.state,
        isOpen: true,
        isMinimized: false,
        mode: 'website',
        service: 'google',
        title: `Google Search: ${target}`,
        url: safeSearchUrl,
        currentQuery: target,
        playbackStatus: 'stopped',
        lastAction: 'safe_search',
        updatedAt: Date.now()
      };
      this.notifyListeners();
      this.openOrFocusExternalWindow(safeSearchUrl, 'Shivans AI - Google Search');

      return {
        success: true,
        message: `Security Shield: Opened "${target}" via safe Google Search on second screen.`,
        spoken: `Bilkul, second screen par ${target} search kar diya hai.`,
        url: safeSearchUrl
      };
    }

    this.state = {
      ...this.state,
      isOpen: true,
      isMinimized: false,
      mode: 'website',
      service: serviceName,
      title: siteTitle || domain,
      url: cleanUrl,
      currentQuery: '',
      playbackStatus: 'stopped',
      lastAction: 'open_website',
      updatedAt: Date.now()
    };
    this.notifyListeners();
    this.openOrFocusExternalWindow(cleanUrl, `Shivans AI - ${siteTitle}`);

    try {
      await fetch('/api/second-screen/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl, service: serviceName, title: siteTitle })
      });
    } catch (e) {
      // non-blocking
    }

    return {
      success: true,
      message: `Loaded "${siteTitle}" on second-screen window.`,
      spoken: `Bilkul, second screen par ${siteTitle} khol diya.`,
      url: cleanUrl
    };
  }

  /**
   * 4. "Video pause karo"
   */
  public static async pauseVideo(): Promise<{ success: boolean; message: string; spoken: string }> {
    this.state = {
      ...this.state,
      playbackStatus: 'paused',
      lastAction: 'pause_video',
      updatedAt: Date.now()
    };
    this.notifyListeners();

    try {
      await fetch('/api/second-screen/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause' })
      });
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      message: 'Video playback paused on second screen.',
      spoken: 'Bilkul, video pause kar diya.'
    };
  }

  /**
   * 5. "Video chalu karo" / "Play karo"
   */
  public static async resumeVideo(): Promise<{ success: boolean; message: string; spoken: string }> {
    this.state = {
      ...this.state,
      isOpen: true,
      playbackStatus: 'playing',
      lastAction: 'resume_video',
      updatedAt: Date.now()
    };
    this.notifyListeners();

    try {
      await fetch('/api/second-screen/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume' })
      });
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      message: 'Video playback resumed on second screen.',
      spoken: 'Bilkul, video chalu kar diya.'
    };
  }

  /**
   * 6. "Video mute karo"
   */
  public static async muteVideo(): Promise<{ success: boolean; message: string; spoken: string }> {
    this.state = {
      ...this.state,
      isMuted: true,
      lastAction: 'mute_video',
      updatedAt: Date.now()
    };
    this.notifyListeners();

    try {
      await fetch('/api/second-screen/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mute' })
      });
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      message: 'Second screen video muted.',
      spoken: 'Bilkul, video mute kar diya.'
    };
  }

  /**
   * 7. "Video ki awaaz on karo" / "Unmute karo"
   */
  public static async unmuteVideo(): Promise<{ success: boolean; message: string; spoken: string }> {
    this.state = {
      ...this.state,
      isMuted: false,
      lastAction: 'unmute_video',
      updatedAt: Date.now()
    };
    this.notifyListeners();

    try {
      await fetch('/api/second-screen/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unmute' })
      });
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      message: 'Second screen audio unmuted.',
      spoken: 'Bilkul, video ki awaaz on kar diya.'
    };
  }

  /**
   * 8. "Agla video chalao" / Next video in playlist queue
   */
  public static async nextVideo(): Promise<{ success: boolean; message: string; spoken: string }> {
    const nextIdx = (this.state.playlistIndex + 1) % this.state.playlist.length;
    const nextItem = this.state.playlist[nextIdx] || {
      title: 'Arijit Singh Melodies',
      query: 'Arijit Singh songs',
      videoId: 'jfKfPfyJRdk'
    };

    this.state = {
      ...this.state,
      isOpen: true,
      playlistIndex: nextIdx,
      title: nextItem.title,
      currentQuery: nextItem.query,
      videoId: nextItem.videoId || 'jfKfPfyJRdk',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(nextItem.query)}`,
      playbackStatus: 'playing',
      lastAction: 'next_video',
      updatedAt: Date.now()
    };
    this.notifyListeners();
    this.openOrFocusExternalWindow(this.state.url, `Shivans AI - ${nextItem.title}`);

    try {
      await fetch('/api/second-screen/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'next', item: nextItem })
      });
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      message: `Playing next video: "${nextItem.title}" on second screen.`,
      spoken: `Bilkul, agla video ${nextItem.title} chala diya.`
    };
  }

  /**
   * 9. "YouTube band karo" / "Second screen band karo"
   */
  public static async closeSecondScreen(): Promise<{ success: boolean; message: string; spoken: string }> {
    if (this.externalWindowRef && !this.externalWindowRef.closed) {
      try {
        this.externalWindowRef.close();
      } catch (e) {
        // ignore
      }
    }
    this.externalWindowRef = null;

    this.state = {
      ...this.state,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      playbackStatus: 'stopped',
      isExternalWindowOpen: false,
      lastAction: 'close_second_screen',
      updatedAt: Date.now()
    };
    this.notifyListeners();

    try {
      await fetch('/api/second-screen/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      message: 'Second screen browser window closed successfully.',
      spoken: 'Bilkul, second screen band kar diya.'
    };
  }

  /**
   * Window controls: minimize, maximize, restore, focus, popout
   */
  public static minimizeWindow() {
    return this.controlWindow('minimize');
  }

  public static maximizeWindow() {
    return this.controlWindow('maximize');
  }

  public static restoreWindow() {
    return this.controlWindow('restore');
  }

  public static popoutExternalWindow() {
    return this.controlWindow('popout');
  }

  public static controlWindow(action: 'minimize' | 'maximize' | 'restore' | 'focus' | 'popout'): { success: boolean; message: string; spoken: string } {
    if (action === 'minimize') {
      this.state = { ...this.state, isMinimized: true, updatedAt: Date.now() };
      this.notifyListeners();
      return { success: true, message: 'Second screen minimized.', spoken: 'Window minimize kar diya.' };
    } else if (action === 'maximize') {
      this.state = { ...this.state, isMinimized: false, isMaximized: true, updatedAt: Date.now() };
      this.notifyListeners();
      return { success: true, message: 'Second screen maximized.', spoken: 'Window maximize kar diya.' };
    } else if (action === 'restore') {
      this.state = { ...this.state, isMinimized: false, isMaximized: false, updatedAt: Date.now() };
      this.notifyListeners();
      return { success: true, message: 'Second screen restored.', spoken: 'Window restore kar diya.' };
    } else if (action === 'focus' || action === 'popout') {
      this.openOrFocusExternalWindow(this.state.url || 'https://www.youtube.com', this.state.title);
      return { success: true, message: 'Second screen popped out to native monitor window.', spoken: 'Window second monitor par pop out kar diya.' };
    }
    return { success: false, message: 'Unknown window action', spoken: '' };
  }

  private static handleIncomingAction(action: SecondScreenAction, payload?: any) {
    switch (action) {
      case 'play':
      case 'resume':
        this.resumeVideo();
        break;
      case 'pause':
        this.pauseVideo();
        break;
      case 'mute':
        this.muteVideo();
        break;
      case 'unmute':
        this.unmuteVideo();
        break;
      case 'next':
        this.nextVideo();
        break;
      case 'close':
        this.closeSecondScreen();
        break;
      case 'minimize':
        this.controlWindow('minimize');
        break;
      case 'maximize':
        this.controlWindow('maximize');
        break;
      default:
        break;
    }
  }
}
