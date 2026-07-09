import { Linking, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export class AndroidIntents {
  /**
   * Safe helper to open a scheme or package
   */
  private static async launchSchemeOrPackage(scheme: string, fallbackPackage: string, webFallback?: string) {
    if (Platform.OS !== 'android') {
      if (webFallback) {
        await Linking.openURL(webFallback);
      }
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(scheme);
      if (canOpen) {
        await Linking.openURL(scheme);
        return { success: true, method: 'scheme' };
      }
    } catch (e) {
      console.log(`[AndroidIntents] Scheme ${scheme} failed, trying package...`, e);
    }

    // Try starting package activity directly
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        category: 'android.intent.category.LAUNCHER',
        packageName: fallbackPackage,
      });
      return { success: true, method: 'package' };
    } catch (err: any) {
      console.log(`[AndroidIntents] Package launch ${fallbackPackage} failed:`, err.message);
      if (webFallback) {
        await Linking.openURL(webFallback);
        return { success: true, method: 'webFallback' };
      }
      throw new Error(`Could not open app. Package ${fallbackPackage} might not be installed.`);
    }
  }

  // 1. WhatsApp
  public static async openWhatsApp(number?: string, message?: string) {
    let url = 'whatsapp://';
    if (number) {
      const cleanNum = number.replace(/\D/g, '');
      url = `whatsapp://send?phone=${cleanNum}`;
      if (message) {
        url += `&text=${encodeURIComponent(message)}`;
      }
    }
    return this.launchSchemeOrPackage(url, 'com.whatsapp', 'https://wa.me/');
  }

  // 2. Instagram
  public static async openInstagram(username?: string) {
    const url = username ? `instagram://user?username=${username}` : 'instagram://';
    return this.launchSchemeOrPackage(url, 'com.instagram.android', 'https://instagram.com/');
  }

  // 3. Facebook
  public static async openFacebook() {
    return this.launchSchemeOrPackage('fb://', 'com.facebook.katana', 'https://facebook.com/');
  }

  // 4. Messenger
  public static async openMessenger() {
    return this.launchSchemeOrPackage('fb-messenger://', 'com.facebook.orca', 'https://messenger.com/');
  }

  // 5. YouTube
  public static async openYouTube(query?: string) {
    const url = query ? `youtube://results?search_query=${encodeURIComponent(query)}` : 'youtube://';
    return this.launchSchemeOrPackage(url, 'com.google.android.youtube', 'https://youtube.com/');
  }

  // 6. Spotify
  public static async openSpotify(query?: string) {
    const url = query ? `spotify:search:${encodeURIComponent(query)}` : 'spotify://';
    return this.launchSchemeOrPackage(url, 'com.spotify.music', 'https://open.spotify.com/');
  }

  // 7. Netflix
  public static async openNetflix() {
    return this.launchSchemeOrPackage('nflx://', 'com.netflix.mediaclient', 'https://netflix.com/');
  }

  // 8. Google Maps
  public static async openGoogleMaps(location?: string) {
    const url = location ? `geo:0,0?q=${encodeURIComponent(location)}` : 'geo:0,0';
    return this.launchSchemeOrPackage(url, 'com.google.android.apps.maps', 'https://maps.google.com/');
  }

  // 9. Gmail
  public static async openGmail(to?: string, subject?: string, body?: string) {
    let url = 'mailto:';
    if (to) {
      url += `${to}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`;
    }
    return this.launchSchemeOrPackage(url, 'com.google.android.gm', 'https://mail.google.com/');
  }

  // 10. SMS
  public static async openSMS(number?: string, message?: string) {
    const url = number ? `sms:${number}?body=${encodeURIComponent(message || '')}` : 'sms:';
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.intent.action.SENDTO', {
        data: url,
      });
      return { success: true };
    }
    await Linking.openURL(url);
  }

  // 11. Phone Dialer
  public static async openPhoneDialer(number?: string) {
    const url = number ? `tel:${number}` : 'tel:';
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.intent.action.DIAL', {
        data: url,
      });
      return { success: true };
    }
    await Linking.openURL(url);
  }

  // 12. Contacts
  public static async openContacts() {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: 'content://contacts/people',
      });
      return { success: true };
    }
    await Linking.openURL('contacts:');
  }

  // 13. Camera
  public static async openCamera() {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.media.action.IMAGE_CAPTURE');
      return { success: true };
    }
    throw new Error('Camera launch only supported natively on Android.');
  }

  // 14. Gallery
  public static async openGallery() {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: 'content://media/internal/images/media',
        type: 'image/*',
      });
      return { success: true };
    }
    throw new Error('Gallery launch only supported natively on Android.');
  }

  // 15. Files
  public static async openFiles() {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.intent.action.GET_CONTENT', {
        type: '*/*',
      });
      return { success: true };
    }
    throw new Error('Files launch only supported natively on Android.');
  }

  // 16. Calculator
  public static async openCalculator() {
    // Try multiple calculator packages standard across different ROMs
    const packages = [
      'com.google.android.calculator',
      'com.android.calculator2',
      'com.sec.android.app.popupcalculator',
      'com.miui.calculator',
      'com.oneplus.calculator',
    ];
    for (const pkg of packages) {
      try {
        await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
          category: 'android.intent.category.LAUNCHER',
          packageName: pkg,
        });
        return { success: true, pkg };
      } catch (e) {
        // Keep looping
      }
    }
    throw new Error('No calculator app found on this device.');
  }

  // 17. Clock
  public static async openClock() {
    const packages = [
      'com.google.android.deskclock',
      'com.android.deskclock',
      'com.sec.android.app.clockpackage',
      'com.oneplus.clock',
    ];
    for (const pkg of packages) {
      try {
        await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
          category: 'android.intent.category.LAUNCHER',
          packageName: pkg,
        });
        return { success: true, pkg };
      } catch (e) {
        // Keep looping
      }
    }
    throw new Error('No clock app found on this device.');
  }

  // 18. Settings
  public static async openSettings() {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.SETTINGS);
      return { success: true };
    }
    await Linking.openSettings();
  }

  // 19. Play Store
  public static async openPlayStore(packageName?: string) {
    const url = packageName ? `market://details?id=${packageName}` : 'market://';
    return this.launchSchemeOrPackage(url, 'com.android.vending', 'https://play.google.com/store');
  }
}
