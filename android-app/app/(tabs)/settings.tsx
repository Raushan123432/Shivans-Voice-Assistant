import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLiveSession } from '../../hooks/useLiveSession';
import { AndroidIntents } from '../../services/AndroidIntents';
import { Settings, Sliders, Volume2, Globe, Shield, Smartphone } from 'lucide-react-native';

const VOICES = ['Zephyr', 'Charon', 'Kore', 'Fenrir', 'Puck'];
const LANGUAGES = [
  'English',
  'Hindi',
  'Maithili',
  'Bhojpuri',
  'Urdu',
  'Bengali',
  'Marathi',
  'Tamil',
  'Telugu',
  'Punjabi',
  'Gujarati'
];

export default function SettingsScreen() {
  const { settings, updateSettings, clearChat } = useLiveSession();

  const handleClearChat = () => {
    Alert.alert(
      'Clear Conversations',
      'Are you sure you want to permanently clear your chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            await clearChat();
            Alert.alert('Cleared', 'All local chat history deleted.');
          }
        }
      ]
    );
  };

  const handleOpenAndroidSettings = async () => {
    try {
      await AndroidIntents.openSettings();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not launch settings.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Settings color="#6C63FF" size={24} />
        <Text style={styles.headerTitle}>Babu Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Assistant Identity */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Smartphone color="#00E5FF" size={16} />
            <Text style={styles.sectionTitle}>Assistant Identity</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Assistant Name</Text>
            <TextInput
              style={styles.textInput}
              value={settings.assistantName}
              onChangeText={(text) => updateSettings({ assistantName: text })}
              placeholder="e.g. BABU AI"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
            />
          </View>
        </View>

        {/* Voice Customization */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Volume2 color="#FF007F" size={16} />
            <Text style={styles.sectionTitle}>Voice & Audio Configuration</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Select Voice</Text>
            <View style={styles.pickerRow}>
              {VOICES.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.pickerItem,
                    settings.voice === v && styles.pickerItemActive
                  ]}
                  onPress={() => updateSettings({ voice: v })}
                >
                  <Text style={[styles.pickerText, settings.voice === v && styles.pickerTextActive]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Mic Sensitivity</Text>
            <View style={styles.pickerRow}>
              {['low', 'medium', 'high'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.pickerItem,
                    settings.sensitivity === s && styles.pickerItemActive
                  ]}
                  onPress={() => updateSettings({ sensitivity: s as any })}
                >
                  <Text style={[styles.pickerText, settings.sensitivity === s && styles.pickerTextActive]}>
                    {s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Language Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Globe color="#F59E0B" size={16} />
            <Text style={styles.sectionTitle}>Language Settings</Text>
          </View>
          <Text style={styles.infoText}>Babu automatically detects and speaks in your chosen native language:</Text>
          <View style={styles.langGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langBtn,
                  settings.language === lang && styles.langBtnActive
                ]}
                onPress={() => updateSettings({ language: lang })}
              >
                <Text style={[styles.langBtnText, settings.language === lang && styles.langBtnTextActive]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sync & Security */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Shield color="#10B981" size={16} />
            <Text style={styles.sectionTitle}>Cloud & Security</Text>
          </View>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelCol}>
              <Text style={styles.label}>Firebase Cloud Sync</Text>
              <Text style={styles.switchDesc}>Keep conversation history synced to secure servers</Text>
            </View>
            <Switch
              value={settings.firebaseSync}
              onValueChange={(val) => updateSettings({ firebaseSync: val })}
              trackColor={{ false: '#1E293B', true: '#6C63FF' }}
              thumbColor={settings.firebaseSync ? '#FFF' : '#94A3B8'}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelCol}>
              <Text style={styles.label}>Offline Simulation Mode</Text>
              <Text style={styles.switchDesc}>Work entirely with offline fallback simulation</Text>
            </View>
            <Switch
              value={settings.offlineMode}
              onValueChange={(val) => updateSettings({ offlineMode: val })}
              trackColor={{ false: '#1E293B', true: '#6C63FF' }}
              thumbColor={settings.offlineMode ? '#FFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Sliders color="#EF4444" size={16} />
            <Text style={styles.sectionTitle}>System Settings & Utilities</Text>
          </View>
          <TouchableOpacity style={styles.utilityBtn} onPress={handleOpenAndroidSettings}>
            <Text style={styles.utilityBtnText}>Open Android Device Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.utilityBtn, styles.dangerBtn]} onPress={handleClearChat}>
            <Text style={[styles.utilityBtnText, styles.dangerBtnText]}>Clear Chat Conversations</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F2D',
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    backgroundColor: '#141B41',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  row: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  textInput: {
    height: 44,
    backgroundColor: 'rgba(10, 15, 45, 0.6)',
    borderRadius: 8,
    color: '#FFF',
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(10, 15, 45, 0.3)',
  },
  pickerItemActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  pickerText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    fontWeight: '600',
  },
  pickerTextActive: {
    color: '#FFF',
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginBottom: 12,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  langBtn: {
    width: '31%',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(10, 15, 45, 0.3)',
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  langBtnText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '600',
  },
  langBtnTextActive: {
    color: '#FFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  switchLabelCol: {
    flex: 1,
    paddingRight: 12,
  },
  switchDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  utilityBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  utilityBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  dangerBtnText: {
    color: '#EF4444',
  }
});
